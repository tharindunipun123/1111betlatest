const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

// Database connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'spin_wheel_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Socket connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Get all matches
app.get('/matches', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, team1, team2, match_time, status, result, is_locked, 
             team1_win_multiplier, team2_win_multiplier, draw_multiplier,
             full_target_multiplier_yes, full_target_multiplier_no,
             six_over_target_multiplier_yes, six_over_target_multiplier_no,
             full_target_locked, six_over_target_locked,
             full_target_result, six_over_target_result
      FROM cricket_matches 
      ORDER BY match_time DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Place a bet
app.post('/place-bet', async (req, res) => {
  const { userId, matchId, betType, amount } = req.body;
  
  try {
    // Get match details and check locks
    const [matchRows] = await db.query(`
      SELECT 
        is_locked, 
        full_target_locked,
        six_over_target_locked,
        team1, team2,
        CASE
          WHEN ? IN ('team1_win', 'team2_win', 'draw') THEN CONCAT(?, '_multiplier')
          WHEN ? IN ('full_target_yes', 'full_target_no') THEN CONCAT('full_target_multiplier_', SUBSTRING(?, 12))
          WHEN ? IN ('six_over_target_yes', 'six_over_target_no') THEN CONCAT('six_over_target_multiplier_', SUBSTRING(?, 16))
        END as multiplier_col
      FROM cricket_matches 
      WHERE id = ?
    `, [betType, betType, betType, betType, betType, betType, matchId]);
    
    if (matchRows.length === 0) {
      return res.status(400).json({ message: 'Match not found' });
    }

    const match = matchRows[0];

    // Check if betting is locked for the specific bet type
    if ((betType.includes('team') || betType === 'draw') && match.is_locked) {
      return res.status(400).json({ message: 'Match betting is locked' });
    }
    if (betType.includes('full_target') && match.full_target_locked) {
      return res.status(400).json({ message: 'Full target betting is locked' });
    }
    if (betType.includes('six_over_target') && match.six_over_target_locked) {
      return res.status(400).json({ message: 'Six over target betting is locked' });
    }

    // Get the multiplier value
    const [multiplierResult] = await db.query(
      `SELECT ${match.multiplier_col} as multiplier FROM cricket_matches WHERE id = ?`,
      [matchId]
    );
    const multiplier = multiplierResult[0].multiplier;

    // Check user's wallet balance
    const [userRows] = await db.query('SELECT wallet FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0 || userRows[0].wallet < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Start transaction
    await db.query('START TRANSACTION');

    // Deduct amount from user's wallet
    await db.query('UPDATE users SET wallet = wallet - ? WHERE id = ?', [amount, userId]);

    // Place the bet
    await db.query('INSERT INTO cricket_bets (user_id, match_id, bet_type, amount, multiplier) VALUES (?, ?, ?, ?, ?)',
      [userId, matchId, betType, amount, multiplier]);

    // Commit transaction
    await db.query('COMMIT');

    res.json({ message: 'Bet placed successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error placing bet:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/wallet', async (req, res) => {
  const { user_id } = req.query;
  try {
    const [users] = await db.query('SELECT wallet FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ wallet: users[0].wallet });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ message: 'Error fetching wallet balance' });
  }
});

app.get('/bet-history', async (req, res) => {
  const { user_id } = req.query;
  try {
    const [bets] = await db.query(`
      SELECT cb.*, cm.team1, cm.team2, cm.match_time, 
             cm.full_target_result, cm.six_over_target_result
      FROM cricket_bets cb
      JOIN cricket_matches cm ON cb.match_id = cm.id
      WHERE cb.user_id = ?
      ORDER BY cm.match_time DESC
    `, [user_id]);
    
    const betHistory = bets.map(bet => ({
      id: bet.id,
      match_details: `${bet.team1} vs ${bet.team2} (${new Date(bet.match_time).toLocaleString()})`,
      bet_type: bet.bet_type,
      amount: bet.amount,
      status: bet.status,
      winnings: bet.winnings || 0,
      full_target_result: bet.full_target_result,
      six_over_target_result: bet.six_over_target_result
    }));

    res.json(betHistory);
  } catch (error) {
    console.error('Error fetching bet history:', error);
    res.status(500).json({ message: 'Error fetching bet history' });
  }
});

// Admin: End match and process bets
app.post('/end-match', async (req, res) => {
  const { matchId, result, fullTargetResult, sixOverTargetResult } = req.body;

  try {
    await db.query('START TRANSACTION');

    // Update match status and results
    await db.query(`
      UPDATE cricket_matches 
      SET status = "completed", 
          result = ?,
          full_target_result = ?,
          six_over_target_result = ?
      WHERE id = ?
    `, [result, fullTargetResult, sixOverTargetResult, matchId]);

    // Get all bets for this match
    const [bets] = await db.query('SELECT * FROM cricket_bets WHERE match_id = ?', [matchId]);

    for (const bet of bets) {
      let isWinner = false;

      // Determine if bet is winner based on bet type
      if (bet.bet_type.includes('team') || bet.bet_type === 'draw') {
        isWinner = bet.bet_type === result;
      } else if (bet.bet_type.includes('full_target')) {
        isWinner = (bet.bet_type === 'full_target_yes' && fullTargetResult === 'yes') ||
                  (bet.bet_type === 'full_target_no' && fullTargetResult === 'no');
      } else if (bet.bet_type.includes('six_over_target')) {
        isWinner = (bet.bet_type === 'six_over_target_yes' && sixOverTargetResult === 'yes') ||
                  (bet.bet_type === 'six_over_target_no' && sixOverTargetResult === 'no');
      }

      if (isWinner) {
        const winnings = bet.amount * bet.multiplier;
        await db.query('UPDATE users SET wallet = wallet + ? WHERE id = ?', [winnings, bet.user_id]);
        await db.query('UPDATE cricket_bets SET status = "won", winnings = ? WHERE id = ?', [winnings, bet.id]);
      } else {
        await db.query('UPDATE cricket_bets SET status = "lost" WHERE id = ?', [bet.id]);
      }
    }

    await db.query('COMMIT');

    // Notify clients about the match end
    io.emit('matchEnded', { 
      matchId, 
      result,
      fullTargetResult,
      sixOverTargetResult 
    });

    res.json({ message: 'Match ended and bets processed successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error ending match:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin: Lock/Unlock betting options
app.post('/toggle-lock', async (req, res) => {
  const { matchId, lockType, isLocked } = req.body;

  try {
    let updateQuery;
    switch (lockType) {
      case 'match':
        updateQuery = 'UPDATE cricket_matches SET is_locked = ? WHERE id = ?';
        break;
      case 'full_target':
        updateQuery = 'UPDATE cricket_matches SET full_target_locked = ? WHERE id = ?';
        break;
      case 'six_over_target':
        updateQuery = 'UPDATE cricket_matches SET six_over_target_locked = ? WHERE id = ?';
        break;
      default:
        return res.status(400).json({ message: 'Invalid lock type' });
    }

    await db.query(updateQuery, [isLocked, matchId]);
    
    // Fetch updated match data
    const [updatedMatch] = await db.query(`
      SELECT * FROM cricket_matches WHERE id = ?
    `, [matchId]);
    
    // Notify clients about the match update
    io.emit('matchUpdate', updatedMatch[0]);

    res.json({ message: `${lockType} ${isLocked ? 'locked' : 'unlocked'} successfully` });
  } catch (error) {
    console.error('Error toggling lock:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin: Update multipliers
app.post('/update-multipliers', async (req, res) => {
  const { 
    matchId, 
    team1Multiplier,
    team2Multiplier,
    drawMultiplier,
    fullTargetYesMultiplier,
    fullTargetNoMultiplier,
    sixOverTargetYesMultiplier,
    sixOverTargetNoMultiplier
  } = req.body;

  try {
    await db.query(`
      UPDATE cricket_matches 
      SET team1_win_multiplier = ?,
          team2_win_multiplier = ?,
          draw_multiplier = ?,
          full_target_multiplier_yes = ?,
          full_target_multiplier_no = ?,
          six_over_target_multiplier_yes = ?,
          six_over_target_multiplier_no = ?
      WHERE id = ?
    `, [
      team1Multiplier,
      team2Multiplier,
      drawMultiplier,
      fullTargetYesMultiplier,
      fullTargetNoMultiplier,
      sixOverTargetYesMultiplier,
      sixOverTargetNoMultiplier,
      matchId
    ]);

    // Fetch updated match data
    const [updatedMatch] = await db.query(`SELECT * FROM cricket_matches WHERE id = ?`, [matchId]);
    
    // Notify clients about the match update
    io.emit('matchUpdate', updatedMatch[0]);

    res.json({ message: 'Multipliers updated successfully' });
  } catch (error) {
    console.error('Error updating multipliers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3008;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
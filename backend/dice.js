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
  host: '127.0.0.1',
  user: 'newuser',
  password: 'newuser_password',
  database: 'spin_wheel_db',
});


// Global variables
let currentRoundId = 0;
let currentRoundNumber = 1; // This variable keeps track of the current round number
const multipliers = [3, 6, 9, 12, 15, 18];
let roundTimer;
let timeRemaining = 60;
const spinDuration = 12; // Spin duration is 12 seconds for animation

// Function to start a new round
async function startNewRound() {
  try {
    // Insert a new round into the rounds table with the round number and timestamp
    const [result] = await db.query('INSERT INTO dice_rounds (round_number, updated_time) VALUES (?, NOW())', [currentRoundNumber]);
    currentRoundId = result.insertId;
    console.log(`New round started: ${currentRoundId}`);
    io.emit('newRound', { roundId: currentRoundId, roundNumber: currentRoundNumber, timeRemaining: 60 });

    // Reset timer for new round
    timeRemaining = 60;
    clearInterval(roundTimer);
    roundTimer = setInterval(() => {
      timeRemaining--;
      io.emit('timeUpdate', timeRemaining); // Emit the time update to frontend
      if (timeRemaining <= 0) {
        clearInterval(roundTimer);
        endRound(); // End the round and determine the winner
      }
    }, 1000);
  } catch (error) {
    console.error('Error starting new round:', error);
  }
}

async function endRound() {
  try {
    // Fetch all bets for the current round
    const [bets] = await db.query('SELECT userId, multiplier, amount FROM dice_betting_results WHERE round = ?', [currentRoundNumber]);
    const [roundNumbers] = await db.query('SELECT round_number FROM manual_set ORDER BY id DESC LIMIT 1');

    let winningMultiplier;

    if (roundNumbers.length > 0) {
      // Use the round number from the table if manually set
      winningMultiplier = roundNumbers[0].round_number;
    } else if (bets.length === 0) {
      // If no bets, choose from 7, 10, or 20
      winningMultiplier = [9, 15, 18][Math.floor(Math.random() * 3)];
    } else {
      // New logic for determining winning multiplier when there are bets
      const bettedMultipliers = new Set(bets.map(bet => parseInt(bet.multiplier)));
      const unbettedMultipliers = multipliers.filter(m => !bettedMultipliers.has(m));

      if (unbettedMultipliers.length > 0) {
        // Choose a random multiplier from unbetted numbers
        winningMultiplier = unbettedMultipliers[Math.floor(Math.random() * unbettedMultipliers.length)];
      } else {
        // All numbers have been bet, choose the one with least payout
        const payouts = multipliers.map(multiplier => {
          const totalPayout = bets
            .filter(bet => parseInt(bet.multiplier) === multiplier)
            .reduce((sum, bet) => sum + parseFloat(bet.amount) * multiplier, 0);
          return { multiplier, totalPayout };
        });
        winningMultiplier = payouts.reduce((min, current) => 
          current.totalPayout < min.totalPayout ? current : min
        ).multiplier;
      }
    }

    console.log(`Winning multiplier for round ${currentRoundNumber}: ${winningMultiplier}`);

    // Update the current round with the winning multiplier
    await db.query('UPDATE dice_rounds SET winning_multiplier = ? WHERE round_number = ?', [winningMultiplier, currentRoundNumber]);

    // Emit to frontend that the wheel should start spinning
    io.emit('spinWheel', { winningMultiplier, roundNumber: currentRoundNumber });

    // Delay for the spin duration before calculating results
    setTimeout(async () => {
      const results = [];

      for (const bet of bets) {
        // Calculate winnings based on whether the user bet on the winning multiplier
        const winAmount = parseInt(bet.multiplier) === winningMultiplier ? parseFloat(bet.amount) * 1.8 : 0;
        // Update user's wallet with the winnings
        if (winAmount > 0) {
          await db.query('UPDATE users SET wallet = wallet + ? WHERE id = ?', [winAmount, bet.userId]);
          //await db.query('INSERT INTO win_history (user_id, round_number, winning_multiplier, win_amount) VALUES (?, ?, ?, ?)', 
            //[bet.userId, currentRoundNumber, winningMultiplier, winAmount]);
        }
        results.push({ userId: bet.userId, betAmount: parseFloat(bet.amount), winAmount });
      }

      // Emit results to all connected clients
      io.emit('roundResult', { roundId: currentRoundId, winningMultiplier, results });

      // Increment round number and start a new round after spin duration
      currentRoundNumber += 1;
      setTimeout(startNewRound, spinDuration * 1000);
    }, spinDuration * 1000);
  } catch (error) {
    console.error('Error ending round:', error);
  }
}


// Start the first round when the server starts
startNewRound();



// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
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



app.post('/bet', async (req, res) => {
  const { userId, betNumber, betAmount } = req.body;
  try {
    // Step 1: Get user wallet balance
    const [userRows] = await db.query('SELECT wallet FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) return res.status(404).json({ message: 'User not found' });

    const userWallet = userRows[0].wallet;

    // Check if wallet has enough balance
    if (userWallet < betAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Step 2: Deduct the bet amount from the user's wallet
    const newWalletBalance = userWallet - betAmount;
    await db.query('UPDATE users SET wallet = ? WHERE id = ?', [newWalletBalance, userId]);

    // Step 3: Record the bet in betting_results table
    await db.query(
      'INSERT INTO dice_betting_results (userId, round, multiplier, amount) VALUES (?, ?, ?, ?)',
      [userId, currentRoundNumber, betNumber, betAmount]
    );

    // Step 4: Return the response
    res.status(200).json({ message: 'Bet placed successfully', newWalletBalance });
  } catch (error) {
    console.error('Error placing bet:', error);
    res.status(500).json({ message: 'An error occurred while placing the bet' });
  }
});


app.get('/check-bet-result/:userId/:roundNumber', async (req, res) => {
  const { userId, roundNumber } = req.params;
  console.log(`Checking result for user ${userId} in round ${currentRoundNumber}`);

  try {
    // Fetch all of the user's bets for the specified round
    const [userBets] = await db.query('SELECT multiplier, amount FROM dice_betting_results WHERE userId = ? AND round = ?', [userId, currentRoundNumber]);
    
    // If the user has not placed any bets for that round, return no bet
    if (userBets.length === 0) {
      return res.json({ message: 'No bets placed for this round.' });
    }

    // Fetch the winning multiplier for the specified round
    const [roundDetails] = await db.query('SELECT winning_multiplier FROM dice_rounds WHERE round_number = ?', [currentRoundNumber]);

    // If round details are not found, return an error
    if (roundDetails.length === 0 || roundDetails[0].winning_multiplier === null) {
      return res.status(404).json({ message: 'Round not found or result not available yet.' });
    }

    const winningMultiplier = roundDetails[0].winning_multiplier;

    // Check if any of the user's bets match the winning multiplier
    const winningBet = userBets.find(bet => bet.multiplier === winningMultiplier);

    if (winningBet) {
      const winAmount = winningBet.amount * winningMultiplier;
      return res.json({ 
        message: 'win', 
        multiplier: winningMultiplier,
        betAmount: winningBet.amount,
        winAmount: winAmount
      });
    } else {
      const totalBetAmount = userBets.reduce((sum, bet) => sum + bet.amount, 0);
      return res.json({ 
        message: 'loss', 
        multiplier: winningMultiplier,
        totalBetAmount: totalBetAmount
      });
    }
  } catch (error) {
    console.error('Error checking bet result:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



const PORT = process.env.PORT || 3008;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
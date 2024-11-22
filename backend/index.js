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
const multipliers = [2, 4, 5, 7, 10, 20];
let roundTimer;
let timeRemaining = 60;
const spinDuration = 12; // Spin duration is 12 seconds for animation

// Function to start a new round
async function startNewRound() {
  try {
    // Insert a new round into the rounds table with the round number and timestamp
    const [result] = await db.query('INSERT INTO rounds (round_number, updated_time) VALUES (?, NOW())', [currentRoundNumber]);
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
    const [bets] = await db.query('SELECT userId, multiplier, amount FROM betting_results WHERE round = ?', [currentRoundNumber]);
    const [roundNumbers] = await db.query('SELECT round_number FROM manual_set ORDER BY id DESC LIMIT 1');

    let winningMultiplier;

    if (roundNumbers.length > 0) {
      // Use the round number from the table if manually set
      winningMultiplier = roundNumbers[0].round_number;
    } else if (bets.length === 0) {
      // If no bets, choose from 7, 10, or 20
      winningMultiplier = [7, 10, 20][Math.floor(Math.random() * 3)];
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
    await db.query('UPDATE rounds SET winning_multiplier = ? WHERE round_number = ?', [winningMultiplier, currentRoundNumber]);

    // Emit to frontend that the wheel should start spinning
    io.emit('spinWheel', { winningMultiplier, roundNumber: currentRoundNumber });

    // Delay for the spin duration before calculating results
    setTimeout(async () => {
      const results = [];

      for (const bet of bets) {
        // Calculate winnings based on whether the user bet on the winning multiplier
        const winAmount = parseInt(bet.multiplier) === winningMultiplier ? parseFloat(bet.amount) * winningMultiplier : 0;
        // Update user's wallet with the winnings
        if (winAmount > 0) {
          await db.query('UPDATE users SET wallet = wallet + ? WHERE id = ?', [winAmount, bet.userId]);
          await db.query('INSERT INTO win_history (user_id, round_number, winning_multiplier, win_amount) VALUES (?, ?, ?, ?)', 
            [bet.userId, currentRoundNumber, winningMultiplier, winAmount]);
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

// Express routes
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ message: "Username already exists" });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.json({ id: user.id, wallet: user.wallet });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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



app.post('/bet', async (req, res) => {
  const { userId, betAmount, multiplier } = req.body;
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
      'INSERT INTO betting_results (userId, round, multiplier, amount) VALUES (?, ?, ?, ?)',
      [userId, currentRoundNumber, multiplier, betAmount]
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
  console.log(`Checking result for user ${userId} in round ${roundNumber}`);

  try {
    // Fetch all of the user's bets for the specified round
    const [userBets] = await db.query('SELECT multiplier, amount FROM betting_results WHERE userId = ? AND round = ?', [userId, roundNumber]);
    
    // If the user has not placed any bets for that round, return no bet
    if (userBets.length === 0) {
      return res.json({ message: 'No bets placed for this round.' });
    }

    // Fetch the winning multiplier for the specified round
    const [roundDetails] = await db.query('SELECT winning_multiplier FROM rounds WHERE round_number = ?', [roundNumber]);

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


app.get('/last-10-winning-numbers', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT round_number, updated_time, winning_multiplier FROM rounds WHERE winning_multiplier IS NOT NULL ORDER BY round_number DESC LIMIT 10'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching last 10 winning numbers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Endpoint to get winning percentages
app.get('/winning-percentages', async (req, res) => {
  try {
    // Fetch actual winning counts
    const [rows] = await db.query(
      'SELECT winning_multiplier, COUNT(*) as count FROM rounds WHERE winning_multiplier IS NOT NULL GROUP BY winning_multiplier'
    );

    // Calculate total rounds
    const totalRounds = rows.reduce((sum, row) => sum + row.count, 0);

    // Calculate actual percentages
    const actualPercentages = rows.reduce((acc, row) => {
      acc[row.winning_multiplier] = (row.count / totalRounds) * 100;
      return acc;
    }, {});

    // Define the possible multipliers
    const multipliers = [2, 4, 5, 7, 10, 20];

    // Function to adjust percentages
    const adjustPercentage = (actual) => {
      // Add some randomness, but keep it within +/- 2% of actual
      const adjustment = (Math.random() * 4) - 2;
      return Math.max(0.1, Math.min(30, actual + adjustment));
    };

    // Create adjusted percentages
    const adjustedPercentages = multipliers.reduce((acc, multiplier) => {
      const actual = actualPercentages[multiplier] || 0;
      acc[multiplier] = adjustPercentage(actual).toFixed(1);
      return acc;
    }, {});

    res.json(adjustedPercentages);
  } catch (error) {
    console.error('Error fetching winning percentages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// dice game ednpoints
app.post('/dicebet', async (req, res) => {
  const { userId, totalBet} = req.body;
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
    const newWalletBalance = userWallet - totalBet;
    await db.query('UPDATE users SET wallet = ? WHERE id = ?', [newWalletBalance, userId]);

    // Step 3: Record the bet in betting_results table
    await db.query(
      'INSERT INTO betting_results (userId, round, multiplier, amount) VALUES (?, ?, ?, ?)',
      [userId, currentRoundNumber, multiplier, betAmount]
    );

    // Step 4: Return the response
    res.status(200).json({ message: 'Bet placed successfully', newWalletBalance });
  } catch (error) {
    console.error('Error placing bet:', error);
    res.status(500).json({ message: 'An error occurred while placing the bet' });
  }
});

app.post('/dicewin', async (req, res) => {
  const { userId, winnings } = req.body;
  try {
    // Step 1: Get user wallet balance
    const [userRows] = await db.query('SELECT wallet FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) return res.status(404).json({ message: 'User not found' });

    const userWallet = userRows[0].wallet;

  
    // Step 2: Deduct the bet amount from the user's wallet
    const newWalletBalance = userWallet + winnings;
    await db.query('UPDATE users SET wallet = ? WHERE id = ?', [newWalletBalance, userId]);

    // Step 4: Return the response
    res.status(200).json({ message: 'Record placed successfully', newWalletBalance });
  } catch (error) {
    console.error('Error placing bet:', error);
    res.status(500).json({ message: 'An error occurred while updating the wallet' });
  }
});


const PORT = process.env.PORT || 3008;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




















// const express = require('express');
// const mysql = require('mysql2');
// const bcrypt = require('bcryptjs');
// const cors = require('cors');
// const app = express();

// app.use(express.json());
// app.use(cors());

// // Database connection
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'spin_wheel_db'
// });

// // Global variables to track current round and bets
// let bets = [];
// // Global variable to track current round
// let currentRoundId = 0;

// // Helper function to update the current round every minute
// const updateCurrentRound = () => {
//   // Increment the round ID for the next round
//   currentRoundId++;

//   // Create a new round and update the round ID in the database
//   db.execute('INSERT INTO rounds (round_time) VALUES (NOW())', (err, result) => {
//     if (err) {
//       console.log('Error creating new round', err);
//     } else {
//       currentRoundId = result.insertId;
//       console.log(`New round created with ID: ${currentRoundId}`);
//     }
//   });

//    // Determine the winning multiplier based on existing bets or random selection
//    let winning_multiplier;
  
//    if (bets.length > 0) {
//      // Use the lowest multiplier from the current bets as the winner
//      winning_multiplier = Math.min(...bets.map(b => b.bet_multiplier));
//    } else {
//      // If no bets are placed, randomly select a multiplier from possible values
//      const multipliers = [2, 5, 10, 20, 30, 50];
//      winning_multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
//    }
 
//    // Update the round in the database with the winning multiplier
//    db.execute('UPDATE rounds SET winning_multiplier = ? WHERE id = ?', [winning_multiplier, currentRoundId], (error) => {
//      if (error) {
//        console.log('Error updating round with winning multiplier', error);
//        return res.status(500).json({ message: 'Error updating round' });
//      }
//    });
 

// };
// // Automatically update the round ID every minute
// setInterval(() => {
//   console.log('Updating current round...');
//   updateCurrentRound();
// }, 60000); // 1 mi

// // Start the first round when the server starts
// db.execute('INSERT INTO rounds (round_time) VALUES (NOW())', (err, result) => {
//   if (err) console.log('Error creating initial round', err);
//   else currentRoundId = result.insertId;
// });

// // Register endpoint
// app.post('/register', (req, res) => {
//   const { username, password } = req.body;
//   bcrypt.hash(password, 10, (err, hash) => {
//     if (err) return res.status(500).send('Server error');
//     db.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash], (error) => {
//       if (error) return res.status(400).send('User already exists');
//       res.json({message:"User registered"});
//     });
//   });
// });

// // Login endpoint
// app.post('/login', (req, res) => {
//   const { username, password } = req.body;
//   db.execute('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
//     if (error || results.length === 0) return res.status(400).send('Invalid credentials');
//     const user = results[0];
//     bcrypt.compare(password, user.password_hash, (err, isMatch) => {
//       if (!isMatch) return res.status(400).send('Invalid credentials');
//       res.json({ id: user.id, wallet: user.wallet });
//     });
//   });
// });

// // Place a bet endpoint (no token required)
// app.post('/bet', (req, res) => {
//   const { user_id, bet_amount, multiplier } = req.body;

//   // Ensure that bet_amount and multiplier are valid numbers
//   if (!bet_amount || isNaN(bet_amount) || !multiplier || isNaN(multiplier)) {
//     return res.status(400).json({ message: 'Invalid bet amount or multiplier' });
//   }

//   // Check if the user has sufficient funds in the wallet
//   db.execute('SELECT wallet FROM users WHERE id = ?', [user_id], (err, results) => {
//     if (err || results.length === 0 || results[0].wallet < bet_amount) {
//       return res.status(400).json({ message: 'Insufficient funds' });
//     }

//     // Deduct the bet amount from the user's wallet
//     db.execute('UPDATE users SET wallet = wallet - ? WHERE id = ?', [bet_amount, user_id], (err) => {
//       if (err) return res.status(500).json({ message: 'Error updating wallet' });

//       // Insert the bet into the bets table, associating it with the current round
//       db.execute(
//         'INSERT INTO bets (user_id, round_id, bet_amount, bet_multiplier) VALUES (?, ?, ?, ?)',
//         [user_id, currentRoundId, bet_amount, multiplier],
//         (err, result) => {
//           if (err) {
//             console.log('Error inserting bet into bets table:', err);
//             return res.status(500).json({ message: 'Error placing bet' });
//           }

//           // If successful, respond with a success message
//           return res.json({ message: 'Bet placed successfully',  round_id: currentRoundId, });
//         }
//       );
//     });
//   });
// });


// app.post('/check-bet-status', (req, res) => {
//   const { user_id, round_id } = req.body;

//   // First, fetch the user's bets for the specified round
//   db.execute(
//     'SELECT bet_amount, bet_multiplier FROM bets WHERE user_id = ? AND round_id = ?',
//     [user_id, round_id],
//     (err, betResults) => {
//       if (err || betResults.length === 0) {
//         return res.status(400).json({ message: 'No bet found for this round' });
//       }

//       const userBet = betResults[0];

//       // Now, fetch the winning multiplier for the round
//       db.execute(
//         'SELECT winning_multiplier FROM rounds WHERE id = ?',
//         [round_id],
//         (err, roundResults) => {
//           if (err || roundResults.length === 0) {
//             return res.status(500).json({ message: 'Error fetching round details' });
//           }

//           const winningMultiplier = roundResults[0].winning_multiplier;

//           // Check if the user's bet multiplier matches the winning multiplier
//           if (userBet.bet_multiplier === winningMultiplier) {
//             // User wins - calculate payout and update wallet
//             const payout = userBet.bet_amount * winningMultiplier;

//             // Update user's wallet with the payout
//             db.execute(
//               'UPDATE users SET wallet = wallet + ? WHERE id = ?',
//               [payout, user_id],
//               (err) => {
//                 if (err) {
//                   return res.status(500).json({ message: 'Error updating wallet' });
//                 }

//                 return res.json({
//                   status: 'win',
//                   message: `You won! Your bet amount of ${userBet.bet_amount} was multiplied by ${winningMultiplier}. You earned ${payout}.`,
//                 });
//               }
//             );
//           } else {
//             // User loses - return loss status
//             return res.json({
//               status: 'loss',
//               message: 'Sorry, you lost this round.',
//             });
//           }
//         }
//       );
//     }
//   );
// });


// // // Fetch bet history endpoint (no token required)
// // app.get('/history', (req, res) => {
// //   const { user_id } = req.query;
  
// //   db.execute('SELECT * FROM bet_history WHERE user_id = ? ORDER BY id DESC LIMIT 10', [user_id], (error, results) => {
// //     if (error) return res.status(500).send('Error fetching history');
// //     res.json(results);
// //   });
// // });

// // Fetch global winning numbers (last 10 spins)
// app.get('/global-history', (req, res) => {
//   db.execute('SELECT * FROM rounds ORDER BY round_time DESC LIMIT 10', (error, results) => {
//     if (error) return res.status(500).send('Error fetching global history');
//     res.json(results);
//   });
// });

// // Get wallet balance endpoint (no token required)
// app.get('/wallet', (req, res) => {
//   const { user_id } = req.query;
  
//   db.execute('SELECT wallet FROM users WHERE id = ?', [user_id], (error, results) => {
//     if (error) return res.status(500).send('Error fetching wallet balance');
//     res.json({ wallet: results[0].wallet });
//   });
// });

// app.post('/spin', (req, res) => {
//   const { user_id } = req.body;

//   // Fetch the last round (most recent round)
//   db.execute('SELECT winning_multiplier FROM rounds ORDER BY id DESC LIMIT 1', (error, results) => {
//     if (error) {
//       console.log('Error fetching the latest round:', error);
//       return res.status(500).json({ message: 'Error fetching the latest round' });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: 'No round data available' });
//     }

//     const winning_multiplier = results[0].winning_multiplier;

//     // Return the winning multiplier to the frontend
//     return res.status(200).json({ winning_multiplier });
//   });
// });

  
//   // Time remaining for the current spin
// app.get('/time-remaining', (req, res) => {
//     // Calculate the time remaining for the current round
//     const spinDuration = 60000; // 60 seconds in milliseconds
//     const currentTime = new Date().getTime();
    
//     // Get the time when the last round started
//     db.execute('SELECT round_time FROM rounds ORDER BY round_time DESC LIMIT 1', (err, result) => {
//       if (err || result.length === 0) {
//         return res.status(500).json({ message: 'Error fetching round time' });
//       }
  
//       const roundStartTime = new Date(result[0].round_time).getTime();
//       const timePassed = currentTime - roundStartTime;
//       const timeRemaining = Math.max(spinDuration - timePassed, 0); // Remaining time before the next spin
  
//       return res.status(200).json({ timeRemaining });
//     });
//   });
  

// // Start the server
// app.listen(3008, () => {
//   console.log('Server running on port 3000');
// });


  






































// // const express = require('express');
// // const mysql = require('mysql2');
// // const bcrypt = require('bcryptjs');
// // const jwt = require('jsonwebtoken');
// // const cors = require('cors');
// // const app = express();

// // app.use(express.json());
// // app.use(cors());

// // // Database connection
// // const db = mysql.createConnection({
// //   host: 'localhost',
// //   user: 'root',
// //   password: '',
// //   database: 'spin_wheel_db'
// // });

// // // Global variables to track current round and bets
// // let bets = [];
// // let currentRoundId = 0;

// // // Helper function for creating JWT tokens
// // const createToken = (user) => {
// //   return jwt.sign({ id: user.id, username: user.username }, 'secret', { expiresIn: '1h' });
// // };

// // // Helper function to spin the wheel
// // const spinWheel = () => {
// //   if (bets.length > 0) {
// //     const winning_multiplier = Math.min(...bets.map(b => b.bet_multiplier));
    
// //     db.execute('UPDATE rounds SET winning_multiplier = ? WHERE id = ?', [winning_multiplier, currentRoundId], (error) => {
// //       if (error) {
// //         console.log('Error updating round with winning multiplier', error);
// //         return;
// //       }
      
// //       bets.forEach(bet => {
// //         const payout = bet.bet_multiplier === winning_multiplier ? bet.bet_amount * winning_multiplier : 0;
        
// //         db.execute('UPDATE users SET wallet = wallet + ? WHERE id = ?', [payout, bet.user_id]);
        
// //         db.execute('INSERT INTO bet_history (user_id, round_id, winning_multiplier, payout) VALUES (?, ?, ?, ?)', 
// //           [bet.user_id, currentRoundId, winning_multiplier, payout]);
// //       });

// //       // Reset bets for the next round
// //       bets = [];
// //       console.log(`Round ${currentRoundId} completed. Winning multiplier: ${winning_multiplier}`);
// //     });
    
// //     // Increment round ID for the next round
// //     currentRoundId++;
    
// //     // Create a new round
// //     db.execute('INSERT INTO rounds (round_time) VALUES (NOW())', (err, result) => {
// //       if (err) console.log('Error creating new round', err);
// //       else currentRoundId = result.insertId;
// //     });
// //   }
// // };

// // // Automatically spin the wheel every minute
// // setInterval(() => {
// //   console.log('Spinning the wheel...');
// //   spinWheel();
// // }, 60000); // 1 minute interval

// // // Start the first round when the server starts
// // db.execute('INSERT INTO rounds (round_time) VALUES (NOW())', (err, result) => {
// //   if (err) console.log('Error creating initial round', err);
// //   else currentRoundId = result.insertId;
// // });

// // // Register endpoint
// // app.post('/register', (req, res) => {
// //   const { username, password } = req.body;
// //   bcrypt.hash(password, 10, (err, hash) => {
// //     if (err) return res.status(500).send('Server error');
// //     db.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash], (error) => {
// //       if (error) return res.status(400).send('User already exists');
// //       res.status(201).send('User registered');
// //     });
// //   });
// // });

// // // Login endpoint
// // app.post('/login', (req, res) => {
// //   const { username, password } = req.body;
// //   db.execute('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
// //     if (error || results.length === 0) return res.status(400).send('Invalid credentials');
// //     const user = results[0];
// //     bcrypt.compare(password, user.password_hash, (err, isMatch) => {
// //       if (!isMatch) return res.status(400).send('Invalid credentials');
// //       const token = createToken(user);
// //       res.json({ token, wallet: user.wallet });
// //     });
// //   });
// // });

// // // Place a bet endpoint
// // app.post('/bet', (req, res) => {
// //   const { token, bet_amount, multiplier } = req.body;
// //   try {
// //     const decoded = jwt.verify(token, 'secret');
    
// //     db.execute('SELECT wallet FROM users WHERE id = ?', [decoded.id], (err, results) => {
// //       if (err || results.length === 0 || results[0].wallet < bet_amount) {
// //         return res.status(400).send('Insufficient funds');
// //       }

// //       // Deduct the bet amount from the user's wallet
// //       db.execute('UPDATE users SET wallet = wallet - ? WHERE id = ?', [bet_amount, decoded.id], (err) => {
// //         if (err) return res.status(500).send('Error updating wallet');
        
// //         // Add the bet to the current round
// //         bets.push({
// //           user_id: decoded.id,
// //           bet_amount,
// //           bet_multiplier: multiplier
// //         });
        
// //         res.status(200).send('Bet placed');
// //       });
// //     });
// //   } catch (error) {
// //     res.status(400).send('Invalid token');
// //   }
// // });

// // // Fetch bet history endpoint
// // app.get('/history', (req, res) => {
// //   const { token } = req.query;
// //   try {
// //     const decoded = jwt.verify(token, 'secret');
    
// //     db.execute('SELECT * FROM bet_history WHERE user_id = ? ORDER BY id DESC LIMIT 10', [decoded.id], (error, results) => {
// //       if (error) return res.status(500).send('Error fetching history');
// //       res.json(results);
// //     });
// //   } catch (error) {
// //     res.status(400).send('Invalid token');
// //   }
// // });

// // // Fetch global winning numbers (last 10 spins)
// // app.get('/global-history', (req, res) => {
// //   db.execute('SELECT * FROM rounds ORDER BY round_time DESC LIMIT 10', (error, results) => {
// //     if (error) return res.status(500).send('Error fetching global history');
// //     res.json(results);
// //   });
// // });

// // // Get wallet balance endpoint
// // app.get('/wallet', (req, res) => {
// //   const { token } = req.query;
// //   try {
// //     const decoded = jwt.verify(token, 'secret');
// //     db.execute('SELECT wallet FROM users WHERE id = ?', [decoded.id], (error, results) => {
// //       if (error) return res.status(500).send('Error fetching wallet balance');
// //       res.json({ wallet: results[0].wallet });
// //     });
// //   } catch (error) {
// //     res.status(400).send('Invalid token');
// //   }
// // });

// // // Start the server
// // app.listen(3000, () => {
// //   console.log('Server running on port 3000');
// // });



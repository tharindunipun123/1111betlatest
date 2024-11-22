import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wheel } from 'react-custom-roulette';
import io from 'socket.io-client';
import swal from 'sweetalert';
 
import './spinWheel.css';

const socket = io('http://145.223.21.62:3008');

// Define the wheel segments and styles
const data = [
  { option: '2', style: { backgroundColor: 'red', textColor: 'white' } },
  { option: '4', style: { backgroundColor: 'blue', textColor: 'white' } },
  { option: '5', style: { backgroundColor: 'green', textColor: 'white' } },
  { option: '7', style: { backgroundColor: 'yellow', textColor: 'black' } },
  { option: '10', style: { backgroundColor: 'purple', textColor: 'white' } },
  { option: '20', style: { backgroundColor: 'orange', textColor: 'black' } },
  { option: '2', style: { backgroundColor: 'red', textColor: 'white' } },
  { option: '4', style: { backgroundColor: 'blue', textColor: 'white' } },
  { option: '5', style: { backgroundColor: 'green', textColor: 'white' } },
  { option: '7', style: { backgroundColor: 'yellow', textColor: 'black' } },
  { option: '10', style: { backgroundColor: 'purple', textColor: 'white' } },
  { option: '20', style: { backgroundColor: 'orange', textColor: 'black' } },
];

// Betting button colors corresponding to wheel segments
const betColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

const SpinWheel = () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [walletAmount, setWalletAmount] = useState(0); // Starting wallet amount
  const [results, setResults] = useState([]); // Store results of each round
  const [betColor, setBetColor] = useState(null); // Track user's bet
  const [betAmount, setBetAmount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isBettingEnabled, setIsBettingEnabled] = useState(true); 
  const [currentRoundNumber, setCurrentRoundNumber] = useState(null);
  const [lastWinningNumbers, setLastWinningNumbers] = useState([]);
  const [winningPercentages, setWinningPercentages] = useState({});
  const [isBettingLocked, setIsBettingLocked] = useState(false);// To control betting during spin
  const userId = localStorage.getItem('user_id');

  const navigate = useNavigate();
  
  // Add this useEffect at the top of your component
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Listen for time updates from server
    socket.on('timeUpdate', (timeLeft) => {
      setTimeRemaining(timeLeft);
    });

    // Listen for spin command from server
    socket.on('spinWheel', ({ winningMultiplier,roundNumber }) => {
      const winningIndex = data.findIndex(item => item.option == winningMultiplier.toString());
      setPrizeNumber(winningIndex);
      setMustSpin(true);
      setCurrentRoundNumber(roundNumber);
      setIsBettingLocked(true);
      console.log(roundNumber);

    });

    // Listen for new round
    socket.on('newRound', ({timeRemaining }) => {
      setTimeRemaining(timeRemaining);
      setMustSpin(false);
      setIsBettingLocked(false);
    });


    // Cleanup on unmount
    return () => {
      socket.off('timeUpdate');
      socket.off('spinWheel');
      socket.off('newRound');
    };
  }, []);

  useEffect(() => {
    fetchWinningPercentages();
    fetchWallet();
   
    const interval = setInterval(fetchWallet, 1000); // Update time every second

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const fetchWinningPercentages = () => {
    fetch('http://145.223.21.62:3008/winning-percentages')
      .then(response => response.json())
      .then(data => setWinningPercentages(data))
      .catch(error => console.error('Error fetching winning percentages:', error));
  };

  // Fetch wallet balance
  const fetchWallet = () => {
    fetch(`http://145.223.21.62:3008/wallet?user_id=${userId}`)
      .then(response => response.json())
      .then(data => setWalletAmount(data.wallet))
      .catch(error => console.error('Error fetching wallet:', error));
  };

    // Function to handle checking bet result after spin
    const checkBetResult = () => {
      fetch(`http://145.223.21.62:3008/check-bet-result/${userId}/${currentRoundNumber}`)
        .then(response => response.json())
        .then(data => {
          if (data.message === 'win') {
            swal('Congratulations!', `You won! Your bet of ${data.betAmount} LKR on ${data.multiplier}x won you ${data.winAmount} LKR!`, 'success');
          } else if (data.message === 'loss') {
            swal('Better luck next time!', `The winning multiplier was ${data.multiplier}x.`, 'error');
          } else {
            swal('Info', data.message, 'info');
          }
          fetchWallet(); // Update wallet after result
        })
        .catch(error => {
          console.error('Error checking bet result:', error);
          swal('Error', 'Could not check bet result. Please try again later.', 'error');
        });
    };

    const fetchLastWinningNumbers = () => {
      fetch('http://145.223.21.62:3008/last-10-winning-numbers')
        .then(response => response.json())
        .then(data => setLastWinningNumbers(data))
        .catch(error => console.error('Error fetching last winning numbers:', error));
    };

  // Function to handle the spin action
  const handleSpinClick = () => {
    const winningIndex = 0; // Random winning index
    setPrizeNumber(winningIndex);
    setMustSpin(true);
  };

  // Function to handle the betting action
  const handleBetClick = (color) => {
    setBetColor(color);
  };

  // Function to handle spin completion
  const handleSpinComplete = () => {
    setMustSpin(false);
    setIsBettingLocked(false);
    // Check user's bet result after spin stops
    checkBetResult();
    fetchLastWinningNumbers();
  };

  const handleBet = (multiplier) => {
    const betInput = document.getElementById(`bet-${multiplier}`);
    const betAmount = parseInt(betInput.value);

    if (isNaN(betAmount) || betAmount <= 0 || betAmount > walletAmount) {
      swal('Error', 'Invalid bet amount.', 'error');
      return;
    }

    // Confirm the bet
    swal({
      title: `Confirm Bet on ${multiplier}`,
      text: `You are betting ${betAmount} LKR on ${multiplier}`,
      icon: 'warning',
      buttons: true,
    }).then((willBet) => {
      if (willBet) {
        // Send bet to API
        fetch('http://145.223.21.62:3008/bet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            multiplier,
            betAmount,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message === 'Bet placed successfully') {

              swal('Bet Placed!', `You have bet ${betAmount} LKR on ${multiplier}.`, 'success');
              fetchWallet(); // Update wallet after placing bet
              betInput.value = ''; // Clear bet input
            } else {
              swal('Error', 'Failed to place bet.', 'error');
            }
          })
          .catch((error) => {
            console.error('Error placing bet:', error);
            swal('Error', 'An error occurred.', 'error');
          });
      }
    });
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="wallet">
          <img src="https://img.icons8.com/emoji/48/000000/coin-emoji.png" alt="coin" />
          <span>{walletAmount} LKR</span>
        </div>
      </header>

      <main className="game-content">
        <section className="left-section">
          <div className="wheel-container">
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={data}
              onStopSpinning={handleSpinComplete}
            />
            <div className="timer">
              <h2>Time Remaining: {timeRemaining} seconds</h2>
            </div>
          </div>

          <div className="betting-container">
            {[2, 4, 5, 7, 10, 20].map((multiplier) => (
              <div key={multiplier} className="bet-group">
                <label htmlFor={`bet-${multiplier}`} className="bet-label">Bet on {multiplier}</label>
                <input
                  type="number"
                  id={`bet-${multiplier}`}
                  className="bet-input"
                  placeholder="Amount"
                  disabled={isBettingLocked}
                />
                <button
                  className={`bet-button bet-button-${multiplier}`}
                  onClick={() => handleBet(multiplier)}
                  disabled={isBettingLocked}
                >
                  Bet {multiplier}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="right-section">
          <div className="stats-container">
            <h2>Last 10 Winning Numbers</h2>
            <table className="winning-numbers-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Time</th>
                  <th>Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {lastWinningNumbers.map((round) => (
                  <tr key={round.round_number}>
                    <td>{round.round_number}</td>
                    <td>{new Date(round.updated_time).toLocaleTimeString()}</td>
                    <td>{round.winning_multiplier}x</td>
                  </tr>
                ))}
              </tbody>
            </table>

           
          </div>
        </section>
      </main>
    </div>
   
  );
};






export default SpinWheel;

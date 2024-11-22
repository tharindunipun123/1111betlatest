import React, { useState, useEffect } from 'react';
import swal from 'sweetalert';
import io from 'socket.io-client';
import './lucky.css';

const socket = io('http://145.223.21.62:3009');

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', 
  '#FFA07A', '#98D8C8', '#F7DC6F', 
  '#BB8FCE', '#F1948A', '#AED6F1', 
  '#E59866'
];

const LuckyNumber = () => {
  const [walletAmount, setWalletAmount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [currentRoundNumber, setCurrentRoundNumber] = useState(null);
  const [lastWinningNumbers, setLastWinningNumbers] = useState([]);
  const [winningPercentages, setWinningPercentages] = useState({});
  const [isBettingLocked, setIsBettingLocked] = useState(false);
  const [winningMultiplier, setWinningMultiplier] = useState(null);
  const userId = localStorage.getItem('user_id'); // Consider fetching this from localStorage or a more secure method

  useEffect(() => {
    socket.on('timeUpdate', (timeLeft) => {
      setTimeRemaining(timeLeft);
    });

    socket.on('spinWheel', ({ winningMultiplier, roundNumber }) => {
      setWinningMultiplier(winningMultiplier);
      setCurrentRoundNumber(roundNumber);
      setIsBettingLocked(true);
      console.log(`Spin wheel for round ${roundNumber}, winning multiplier: ${winningMultiplier}`);
      setTimeout(() => checkBetResult(roundNumber), 2000); // Check bet result after a short delay
    });

    socket.on('newRound', ({ roundId, roundNumber, timeRemaining }) => {
      setCurrentRoundNumber(roundNumber);
      setTimeRemaining(timeRemaining);
      setIsBettingLocked(false);
      setWinningMultiplier(null);
      console.log(`New round started: ${roundNumber}`);
    });

    return () => {
      socket.off('timeUpdate');
      socket.off('spinWheel');
      socket.off('newRound');
    };
  }, []);

  useEffect(() => {
    fetchWinningPercentages();
    fetchWallet();
    fetchLastWinningNumbers();
   
    const interval = setInterval(() => {
      fetchWallet();
      fetchLastWinningNumbers();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchWinningPercentages = () => {
    fetch('http://145.223.21.62:3009/winning-percentages')
      .then(response => response.json())
      .then(data => setWinningPercentages(data))
      .catch(error => console.error('Error fetching winning percentages:', error));
  };

  const fetchWallet = () => {
    fetch(`http://145.223.21.62:3009/wallet?user_id=${userId}`)
      .then(response => response.json())
      .then(data => setWalletAmount(data.wallet))
      .catch(error => console.error('Error fetching wallet:', error));
  };

  const checkBetResult = (roundNumber) => {
    console.log(`Checking bet result for round ${roundNumber}`);
    fetch(`http://145.223.21.62:3009/check-bet-result/${userId}/${roundNumber}`)
      .then(response => response.json())
      .then(data => {
        if (data.message === 'win') {
          swal('Congratulations!', `You won! Your bet of ${data.betAmount} LKR on ${data.multiplier} won you ${data.winAmount} LKR!`, 'success');
        } else if (data.message === 'loss') {
          swal('Better luck next time!', `The winning multiplier was ${data.multiplier}x. You lost.`, 'error');
        } else {
          swal('Info', data.message, 'info');
        }
        fetchWallet();
      })
      .catch(error => {
        console.error('Error checking bet result:', error);
        swal('Error', 'Could not check bet result. Please try again later.', 'error');
      });
  };

  const fetchLastWinningNumbers = () => {
    fetch('http://145.223.21.62:3009/last-10-winning-numbers')
      .then(response => response.json())
      .then(data => setLastWinningNumbers(data))
      .catch(error => console.error('Error fetching last winning numbers:', error));
  };

  const handleBet = (multiplier) => {
    const betInput = document.getElementById(`bet-${multiplier}`);
    const betAmount = parseInt(betInput.value);
  
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > walletAmount) {
      swal('Error', 'Invalid bet amount.', 'error');
      return;
    }
  
    swal({
      title: `Confirm Bet on ${multiplier}`,
      text: `You are betting ${betAmount} LKR on ${multiplier}`,
      icon: 'warning',
      buttons: true,
    }).then((willBet) => {
      if (willBet) {
        fetch('http://145.223.21.62:3009/bet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            multiplier,
            betAmount,
            roundNumber: currentRoundNumber,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message === 'Bet placed successfully') {
              swal('Bet Placed!', `You have bet ${betAmount} LKR on ${multiplier} for round ${currentRoundNumber}.`, 'success');
              fetchWallet();
              betInput.value = '';
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
          <div className="grid-container">
            {[1,2,3,4,5,6,7,8,9,10].map((multiplier, index) => (
              <div 
                key={multiplier} 
                className={`grid-item ${winningMultiplier === multiplier ? 'winning' : ''}`}
                style={{backgroundColor: colors[index]}}
              >
                {multiplier}x
              </div>
            ))}
          </div>
          <div className="timer">
            <h2>Time Remaining: {timeRemaining} seconds</h2>
          </div>

          <div className="betting-container">
            {[1,2,3,4,5,6,7,8,9,10].map((multiplier) => (
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
                  style={{backgroundColor: colors[multiplier - 1]}}
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

export default LuckyNumber;
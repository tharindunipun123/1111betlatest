
import { useState, useRef,useEffect } from 'react';
import Swal from 'sweetalert2';
import io from 'socket.io-client';

const socket = io('http://145.223.21.62:3010');

const DiceBettingGame = () => {
    const [isRolling, setIsRolling] = useState(false);
    const [winningNumber, setWinningNumber] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [balance, setBalance] = useState(0);
    const [rangeBet, setRangeBet] = useState({ type: '', amount: '' });
    const [numberBets, setNumberBets] = useState({
      '3': '',
      '6': '',
      '9': '',
      '12': '',
      '15': '',
      '18': ''
    });
    const [currentRoundNumber, setCurrentRoundNumber] = useState(null);
    const [isBettingLocked, setIsBettingLocked] = useState(false);
    const diceRef = useRef(null);
    const userId = 1;
  
    // Rotation map for the dice faces
    const rotationMap = {
      '3': [0, 0, 0],      // Front
      '9': [0, 180, 0],    // Back
      '6': [0, -90, 0],    // Right
      '12': [0, 90, 0],    // Left
      '15': [-90, 0, 0],   // Top
      '18': [90, 0, 0],    // Bottom
    };
  
    useEffect(() => {
      // Listen for time updates
      socket.on('timeUpdate', (timeLeft) => {
        setTimeRemaining(timeLeft);
      });
  
      // Listen for spin command
      socket.on('spinWheel', ({ winningMultiplier, roundNumber }) => {
        setWinningNumber(winningMultiplier);
        setCurrentRoundNumber(roundNumber);
        setIsBettingLocked(true);
        rollDiceToNumber(winningMultiplier);
      });
  
      // Listen for new round
      socket.on('newRound', ({ timeRemaining }) => {
        setTimeRemaining(timeRemaining);
        setIsBettingLocked(false);
        setIsRolling(false);
      });
  
      // Fetch wallet balance
      const fetchWallet = () => {
        fetch(`http://145.223.21.62:3010/wallet?user_id=${userId}`)
          .then(response => response.json())
          .then(data => setBalance(data.wallet))
          .catch(error => console.error('Error fetching wallet:', error));
      };
  
      fetchWallet();
      const walletInterval = setInterval(fetchWallet, 1000);
  
      return () => {
        socket.off('timeUpdate');
        socket.off('spinWheel');
        socket.off('newRound');
        clearInterval(walletInterval);
      };
    }, [userId]);
  
    const handleNumberBetChange = (number, value) => {
      if (isBettingLocked) return;
  
      if (rangeBet.type === 'lower' && number > 9) {
        Swal.fire({
          title: 'Invalid Bet',
          text: 'You can only bet on numbers 3, 6, 9 when lower range is selected',
          icon: 'error'
        });
        return;
      }
      if (rangeBet.type === 'higher' && number <= 9) {
        Swal.fire({
          title: 'Invalid Bet',
          text: 'You can only bet on numbers 12, 15, 18 when higher range is selected',
          icon: 'error'
        });
        return;
      }
  
      setNumberBets(prev => ({
        ...prev,
        [number]: value
      }));
    };
  
    const placeBet = async () => {
      // Check if range is selected first
      if (!rangeBet.type) {
        Swal.fire({
          title: 'Select Range',
          text: 'Please select a betting range (Lower or Higher) first!',
          icon: 'warning'
        });
        return;
      }
    
      // Filter out numbers with actual bets and check if they match the selected range
      const activeBets = Object.entries(numberBets)
        .filter(([number, amount]) => amount && parseInt(amount) > 0)
        .filter(([number]) => {
          const num = parseInt(number);
          if (rangeBet.type === 'lower' && num > 9) return false;
          if (rangeBet.type === 'higher' && num <= 9) return false;
          return true;
        })
        .map(([number, amount]) => ({
          number: parseInt(number),
          amount: parseInt(amount)
        }));
    
      if (activeBets.length === 0) {
        Swal.fire({
          title: 'No Valid Bets',
          text: 'Please place at least one bet within your selected range!',
          icon: 'warning'
        });
        return;
      }
    
      // Send each bet to the server
      try {
        for (const bet of activeBets) {
          const response = await fetch('http://145.223.21.62:3010/bet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              betNumber: bet.number,
              betAmount: bet.amount
            }),
          });
    
          const data = await response.json();
          if (data.message !== 'Bet placed successfully') {
            throw new Error(`Failed to place bet on number ${bet.number}`);
          }
        }
    
        Swal.fire({
          title: 'Success',
          text: 'Your bets have been placed!',
          icon: 'success'
        });
    
      } catch (error) {
        console.error('Error placing bet:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to place bet',
          icon: 'error'
        });
      }
    };
  
    const rollDiceToNumber = (number) => {
      setIsRolling(true);
  
      const randomRotation = () => {
        const dice = diceRef.current;
        if (!dice) return;
        dice.style.transition = 'transform 0.1s linear';
        dice.style.transform = `rotateX(${Math.random() * 360}deg) rotateY(${
          Math.random() * 360
        }deg) rotateZ(${Math.random() * 360}deg)`;
      };
  
      let rotations = 0;
      const rotationInterval = setInterval(() => {
        randomRotation();
        rotations++;
        if (rotations >= 20) {
          clearInterval(rotationInterval);
          const finalRotation = rotationMap[number.toString()];
          const dice = diceRef.current;
          if (dice) {
            dice.style.transition = 'transform 1s cubic-bezier(0.25, 0.1, 0.25, 1)';
            dice.style.transform = `rotateX(${finalRotation[0]}deg) rotateY(${finalRotation[1]}deg) rotateZ(${finalRotation[2]}deg)`;
          }
  
          // Check results after animation
          setTimeout(() => {
            checkResults();
          }, 1000);
        }
      }, 100);
    };
  
    const checkResults = async () => {
      try {
        const response = await fetch(`http://145.223.21.62:3010/check-bet-result/${userId}/${currentRoundNumber}`);
        const data = await response.json();
    
        if (!response.ok) {
          throw new Error('Failed to check results');
        }
    
        if (data.message === 'win') {
          Swal.fire({
            title: 'Congratulations!',
            text: `You won ${data.winAmount} LKR!`,
            icon: 'success'
          });
    
          // Update balance after win
          fetch(`http://145.223.21.62:3010/wallet?user_id=${userId}`)
            .then(response => response.json())
            .then(data => setBalance(data.wallet))
            .catch(error => console.error('Error updating balance:', error));
            
        } else if (data.message === 'loss') {
          Swal.fire({
            title: 'Better luck next time!',
            text: `The winning number was ${data.multiplier}`,
            icon: 'error'
          });
        } else {
          Swal.fire({
            title: 'Info',
            text: data.message,
            icon: 'info'
          });
        }
      } catch (error) {
        console.error('Error checking results:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to check results',
          icon: 'error'
        });
      }
    };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '1rem auto',
      padding: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      borderRadius: '20px',
      backgroundColor: 'white',
      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
      '@media (max-width: 768px)': {
        padding: '15px',
        margin: '0.5rem',
      },
    },
    gameSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '30px',
    },
    diceContainer: {
      width: '200px',
      height: '200px',
      perspective: '1200px',
      position: 'relative',
      margin: '2rem auto',
      '@media (max-width: 768px)': {
        width: '150px',
        height: '150px',
      },
    },
    dice: {
      width: '100%',
      height: '100%',
      position: 'relative',
      transformStyle: 'preserve-3d',
      transition: 'transform 0.5s ease-out',
      cursor: 'pointer',
      transform: 'rotateX(-25deg) rotateY(-25deg)',
    },
    face: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(145deg, #ff4444, #cc0000)',
      border: '2px solid rgba(255,255,255,0.2)',
      borderRadius: '24px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '48px',
      fontWeight: 'bold',
      color: 'white',
      userSelect: 'none',
      backfaceVisibility: 'hidden',
      boxShadow: 'inset 0 0 15px rgba(0,0,0,0.2), 0 0 10px rgba(0,0,0,0.3)',
      '@media (max-width: 768px)': {
        fontSize: '36px',
        borderRadius: '16px',
      },
    },
    bettingSection: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      margin: '20px 0',
      padding: '20px',
      borderRadius: '10px',
      backgroundColor: 'rgba(255,255,255,0.5)',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
        padding: '15px',
        gap: '15px',
      },
    },
    numberBettingGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '15px',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
      },
    },
    input: {
      width: '100%',
      height: '42px',
      borderRadius: '10px',
      border: '2px solid #e1e1e1',
      fontSize: '16px',
      textAlign: 'center',
      marginBottom: '10px',
      padding: '0 10px',
      transition: 'border-color 0.3s ease',
      '&:focus': {
        outline: 'none',
        borderColor: '#007bff',
      },
    },
    button: {
      width: '200px',
      height: '48px',
      marginTop: '30px',
      fontSize: '18px',
      fontWeight: 'bold',
      borderRadius: '24px',
      border: 'none',
      background: 'linear-gradient(145deg, #007bff, #0056b3)',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(0,123,255,0.3)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0,123,255,0.4)',
      },
      '@media (max-width: 768px)': {
        width: '180px',
        height: '44px',
        fontSize: '16px',
      },
    },
    balanceDisplay: {
      fontSize: '24px',
      textAlign: 'center',
      marginBottom: '25px',
      padding: '15px',
      borderRadius: '15px',
      backgroundColor: '#f8f9fa',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      '@media (max-width: 768px)': {
        fontSize: '20px',
        padding: '12px',
      },
    },
    history: {
      marginTop: '30px',
      padding: '20px',
      borderRadius: '15px',
      background: '#f8f9fa',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      '@media (max-width: 768px)': {
        padding: '15px',
      },
    },
    title: {
      textAlign: 'center',
      color: '#2c3e50',
      marginBottom: '25px',
      fontSize: '32px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      '@media (max-width: 768px)': {
        fontSize: '24px',
        marginBottom: '20px',
      },
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#666',
    },
  };


  
  return (
    <div style={styles.container}>
    <h2 style={styles.title}>Dice Game</h2>
    
    <div style={styles.balanceDisplay}>
      Balance: ${balance} | Time Remaining: {timeRemaining}s
    </div>

    <div style={styles.gameSection}>
      <div style={styles.diceContainer}>
        <div ref={diceRef} style={styles.dice}>
          <div style={{...styles.face, transform: 'translateZ(100px)'}}><span>3</span></div>
          <div style={{...styles.face, transform: 'rotateY(180deg) translateZ(100px)'}}><span>9</span></div>
          <div style={{...styles.face, transform: 'rotateY(90deg) translateZ(100px)'}}><span>6</span></div>
          <div style={{...styles.face, transform: 'rotateY(-90deg) translateZ(100px)'}}><span>12</span></div>
          <div style={{...styles.face, transform: 'rotateX(90deg) translateZ(100px)'}}><span>15</span></div>
          <div style={{...styles.face, transform: 'rotateX(-90deg) translateZ(100px)'}}><span>18</span></div>
        </div>
      </div>

      <button
        style={{
          ...styles.button,
          opacity: isBettingLocked ? 0.7 : 1,
          transform: isRolling ? 'scale(0.98)' : 'scale(1)',
        }}
        onClick={placeBet}
        disabled={isBettingLocked}
      >
        {isBettingLocked ? 'Betting Closed' : 'Place Bet'}
      </button>
    </div>

    <div style={styles.bettingSection}>
    <div>
      <h3 style={{ marginBottom: '15px' }}>Range Betting</h3>
      <select 
        style={{
          ...styles.input,
          borderColor: !rangeBet.type && isBettingLocked ? 'red' : '#e1e1e1'
        }}
        value={rangeBet.type}
        onChange={(e) => {
          setRangeBet(prev => ({ ...prev, type: e.target.value }));
          // Clear invalid bets when range changes
          const newNumberBets = {...numberBets};
          Object.keys(numberBets).forEach(number => {
            if ((e.target.value === 'lower' && parseInt(number) > 9) ||
                (e.target.value === 'higher' && parseInt(number) <= 9)) {
              newNumberBets[number] = '';
            }
          });
          setNumberBets(newNumberBets);
        }}
        disabled={isBettingLocked}
      >
        <option value="">Select Range</option>
        <option value="lower">Lower (3-9)</option>
        <option value="higher">Higher (12-18)</option>
      </select>
    </div>

      <div>
        <h3 style={{ marginBottom: '15px' }}>Number Betting</h3>
        <div style={styles.numberBettingGrid}>
          {[3, 6, 9, 12, 15, 18].map(number => (
            <div key={number}>
              <label style={styles.label}>Number {number}</label>
              <input
                type="number"
                style={styles.input}
                placeholder={`Bet on ${number}`}
                value={numberBets[number]}
                onChange={(e) => handleNumberBetChange(number, e.target.value)}
                disabled={isBettingLocked}
              />
            </div>
          ))}
        </div>
      </div>
    </div>

   
  </div>
  );
};

export default DiceBettingGame;
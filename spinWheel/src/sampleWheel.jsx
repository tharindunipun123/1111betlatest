// import React, { useState, useEffect } from 'react';
// import { Wheel } from 'react-custom-roulette';
// import swal from 'sweetalert';

// const data = [
//   { option: 'Red', style: { backgroundColor: 'red', textColor: 'white' } },
//   { option: 'Blue', style: { backgroundColor: 'blue', textColor: 'white' } },
//   { option: 'Green', style: { backgroundColor: 'green', textColor: 'white' } },
//   { option: 'Yellow', style: { backgroundColor: 'yellow', textColor: 'black' } },
//   { option: 'Purple', style: { backgroundColor: 'purple', textColor: 'white' } },
//   { option: 'Orange', style: { backgroundColor: 'orange', textColor: 'black' } },
// ];

// const SpinWheel = () => {
//   const [mustSpin, setMustSpin] = useState(false);
//   const [prizeNumber, setPrizeNumber] = useState(0);
//   const [walletAmount, setWalletAmount] = useState(0);
//   const [betColor, setBetColor] = useState(null);
//   const [betAmount, setBetAmount] = useState(0);
//   const [timeRemaining, setTimeRemaining] = useState(60);
//   const [isBettingEnabled, setIsBettingEnabled] = useState(true); // To control betting during spin
//   const userId = localStorage.getItem('user_id');

//   // Fetch wallet and time on load
//   useEffect(() => {
//     fetchWallet();
//     fetchTimeRemaining();
//     const interval = setInterval(fetchTimeRemaining, 1000); // Update time every second

//     return () => clearInterval(interval); // Cleanup interval on unmount
//   }, []);

//   // Fetch wallet balance
//   const fetchWallet = () => {
//     fetch(`http://localhost:3000/wallet?user_id=${userId}`)
//       .then(response => response.json())
//       .then(data => setWalletAmount(data.wallet))
//       .catch(error => console.error('Error fetching wallet:', error));
//   };

//   // Fetch time remaining from the server
//   const fetchTimeRemaining = () => {
//     fetch('http://localhost:3000/time-remaining')
//       .then(response => response.json())
//       .then(data => {
//         const timeLeft = Math.floor(data.timeRemaining / 1000);
//         setTimeRemaining(timeLeft);

//         if (timeLeft <= 0) {
//           handleSpinClick(); // Start spinning when time reaches zero
//         }
//       })
//       .catch(error => console.error('Error fetching time remaining:', error));
//   };

//   // Handle bet placement
//   const handleBetClick = (color) => {
//     if (!isBettingEnabled) {
//       swal('Betting is disabled', 'Wait for the current round to complete.', 'info');
//       return;
//     }

//     if (betAmount <= 0) {
//       swal('Invalid Bet', 'Please enter a valid bet amount', 'warning');
//       return;
//     }

//     setBetColor(color);
//     const multiplier = getMultiplierForColor(color);

//     fetch('http://localhost:3000/bet', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         user_id: userId,
//         bet_amount: betAmount,
//         multiplier,
//       }),
//     })
//       .then(response => response.json())
//       .then(data => {
//         if (data.message === 'Bet placed') {
//           swal('Bet Placed', `You bet ${betAmount} coins on ${color}`, 'success');
//         } else {
//           swal('Error', 'There was a problem placing your bet.', 'error');
//         }
//       })
//       .catch(error => console.error('Error placing bet:', error));
//   };

//   // Handle spinning the wheel
//   const handleSpinClick = () => {
//     setIsBettingEnabled(false); // Disable betting during spin

//     fetch('http://localhost:3000/spin', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ user_id: userId }),
//     })
//       .then(response => response.json())
//       .then(data => {
//         const winningMultiplier = data.winning_multiplier;
//         const winningIndex = getWinningIndexForMultiplier(winningMultiplier);
//         setPrizeNumber(winningIndex);
//         setMustSpin(true); // Start spinning

//         // Stop the spinning after 10 seconds
//         setTimeout(() => {
//           handleSpinComplete(winningMultiplier);
//         }, 10000);
//       })
//       .catch(error => {
//         console.error('Error spinning the wheel:', error);
//         swal('Error', 'An error occurred while spinning the wheel!', 'error');
//       });
//   };

//   // Handle spin completion and calculate win/loss
//   const handleSpinComplete = (winningMultiplier) => {
//     setMustSpin(false);
//     setIsBettingEnabled(true); // Enable betting after spin completes
//     const winningColor = data[prizeNumber].style.backgroundColor;

//     let winAmount = 0;
//     if (betColor === winningColor) {
//       winAmount = betAmount * winningMultiplier; // Calculate win based on multiplier
//       swal('Congratulations!', `You won ${winAmount} coins!`, 'success');
//     } else if (betColor) {
//       winAmount = -betAmount; // Loss amount if bet doesn't match
//       swal('Sorry!', 'You lost this round.', 'error');
//     }

//     setWalletAmount(walletAmount + winAmount); // Update wallet
//     setBetColor(null);
//     setBetAmount(0);

//     fetchWallet(); // Fetch updated wallet after spin
//   };

//   // Utility function to get multiplier based on color
//   const getMultiplierForColor = (color) => {
//     switch (color) {
//       case 'red': return 2;
//       case 'blue': return 5;
//       case 'green': return 10;
//       case 'yellow': return 20;
//       case 'purple': return 30;
//       case 'orange': return 50;
//       default: return 1;
//     }
//   };

//   const getWinningIndexForMultiplier = (multiplier) => {
//     switch (multiplier) {
//       case 2: return 0;
//       case 5: return 1;
//       case 10: return 2;
//       case 20: return 3;
//       case 30: return 4;
//       case 50: return 5;
//       default: return 0;
//     }
//   };

//   return (
//     <div className="container py-5">
//       <div className="wallet mb-3">
//         <img src="https://img.icons8.com/emoji/48/000000/coin-emoji.png" alt="coin" style={{ marginRight: '8px' }} />
//         {walletAmount} Coins
//       </div>

//       <div className="mb-3">
//         <h4>Time remaining for next spin: {timeRemaining} seconds</h4>
//       </div>

//       <div className="row justify-content-center">
//         <div className="col-md-6 text-center">
//           <Wheel
//             mustStartSpinning={mustSpin}
//             prizeNumber={prizeNumber}
//             data={data}
//             backgroundColors={['#3e3e3e', '#df3428']}
//             textColors={['#ffffff']}
//           />
//         </div>
//       </div>

//       <div className="bet-amount mt-4 text-center">
//         <input
//           type="number"
//           className="form-control mb-2"
//           placeholder="Enter bet amount"
//           value={betAmount}
//           onChange={(e) => setBetAmount(Number(e.target.value))}
//         />
//       </div>

//       <div className="bet-buttons mt-2 text-center">
//         {['red', 'blue', 'green', 'yellow', 'purple', 'orange'].map((color, index) => (
//           <button
//             key={index}
//             className="btn m-2"
//             style={{ backgroundColor: color, color: '#fff' }}
//             onClick={() => handleBetClick(color)}
//           >
//             Bet {color}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SpinWheel;

// import React, { useState,useEffect } from 'react';
// import { Wheel } from 'react-custom-roulette';

// // Define the wheel segments and styles
// const data = [
//   { option: 'Option 1', style: { backgroundColor: 'red', textColor: 'white' } },
//   { option: 'Option 2', style: { backgroundColor: 'blue', textColor: 'white' } },
//   { option: 'Option 3', style: { backgroundColor: 'green', textColor: 'white' } },
//   { option: 'Option 4', style: { backgroundColor: 'yellow', textColor: 'black' } },
//   { option: 'Option 5', style: { backgroundColor: 'purple', textColor: 'white' } },
//   { option: 'Option 6', style: { backgroundColor: 'orange', textColor: 'black' } },
//   { option: 'Option 1', style: { backgroundColor: 'red', textColor: 'white' } },
//   { option: 'Option 2', style: { backgroundColor: 'blue', textColor: 'white' } },
//   { option: 'Option 3', style: { backgroundColor: 'green', textColor: 'white' } },
//   { option: 'Option 4', style: { backgroundColor: 'yellow', textColor: 'black' } },
//   { option: 'Option 5', style: { backgroundColor: 'purple', textColor: 'white' } },
//   { option: 'Option 6', style: { backgroundColor: 'orange', textColor: 'black' } },
// ];

// // Betting button colors corresponding to wheel segments
// const betColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

// const SpinWheel = () => {
//   const [mustSpin, setMustSpin] = useState(false);
//   const [prizeNumber, setPrizeNumber] = useState(0);
//   const [walletAmount, setWalletAmount] = useState(0); // Starting wallet amount
//   const [results, setResults] = useState([]); // Store results of each round
//   const [betColor, setBetColor] = useState(null); // Track user's bet
//   const [betAmount, setBetAmount] = useState(0);
//   const [timeRemaining, setTimeRemaining] = useState(60);
//   const [isBettingEnabled, setIsBettingEnabled] = useState(true); // To control betting during spin
//   const userId = localStorage.getItem('user_id');


//   useEffect(() => {
//     fetchWallet();
   
//     const interval = setInterval(fetchWallet, 1000); // Update time every second

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



//   // Function to handle the spin action
//   const handleSpinClick = () => {
//     const winningIndex = 0; // Random winning index
//     setPrizeNumber(winningIndex);
//     setMustSpin(true);
//   };

//   // Function to handle the betting action
//   const handleBetClick = (color) => {
//     setBetColor(color);
//   };

//   // Function to handle spin completion
//   const handleSpinComplete = () => {
//     setMustSpin(false);
//     const winningColor = data[prizeNumber].style.backgroundColor;
//     let winAmount = 0;

//     // // Check if the user's bet color matches the winning color
//     // if (betColor === winningColor) {
//     //   winAmount = 100 * 2; // Example: Bet multiplies by 2
//     //   setWalletAmount(walletAmount + winAmount);
//     // } else {
//     //   winAmount = -100; // Deduct amount if the bet is lost
//     //   setWalletAmount(walletAmount + winAmount);
//     // }

//     // Update results table
//     setResults([...results, { color: winningColor, winAmount }]);
//     setBetColor(null); 
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.wallet}>
//         <img src="https://img.icons8.com/emoji/48/000000/coin-emoji.png" alt="coin" style={{ marginRight: '8px' }} />
//         {walletAmount} Coins
//       </div>
      
     

//       <div style={styles.mainContent}>
//         {/* Spin Wheel */}
//         <div style={styles.wheelContainer}>
//           <Wheel
//             mustStartSpinning={mustSpin}
//             prizeNumber={prizeNumber}
//             data={data}
//             onStopSpinning={handleSpinComplete}
//           />
//           <button onClick={handleSpinClick} style={styles.spinButton}>
//             Spin the Wheel
//           </button>

//           {/* Betting Buttons */}
//           <div style={styles.betContainer}>
//             {betColors.map((color, index) => (
//               <button
//                 key={index}
//                 style={{ ...styles.betButton, backgroundColor: color }}
//                 onClick={() => handleBetClick(color)}
//               >
//                 Bet {color}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Results Table */}
//         <div style={styles.resultsContainer}>
//           <h3>Results</h3>
//           <ul style={styles.resultsList}>
//             {results.map((result, index) => (
//               <li key={index} style={styles.resultItem}>
//                 <span style={{ backgroundColor: result.color, ...styles.resultColor }}></span>
//                 {result.color} - {result.winAmount > 0 ? `+${result.winAmount}` : result.winAmount} Coins
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Styles for the component
// const styles = {
//   container: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     background: 'linear-gradient(135deg, black, #203a43, #219EBC)',
//     height: '100vh',
//     padding: '20px',
//     color: '#fff',
//     fontFamily: 'Arial, sans-serif',
//   },
//   wallet: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontSize: '1.5em',
//     marginBottom: '20px',
//   },
//   mainContent: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     width: '100%',
//     maxWidth: '1200px',
//   },
//   wheelContainer: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//   },
//   spinButton: {
//     marginTop: '20px',
//     padding: '10px 30px',
//     fontSize: '18px',
//     borderRadius: '12px',
//     background: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
//     color: '#fff',
//     border: 'none',
//     cursor: 'pointer',
//     boxShadow: '0px 4px 15px rgba(0,0,0,0.2)',
//     transition: 'transform 0.2s',
//   },
//   betContainer: {
//     display: 'flex',
//     justifyContent: 'center',
//     flexWrap: 'wrap',
//     marginTop: '20px',
//   },
//   betButton: {
//     padding: '10px 20px',
//     margin: '5px',
//     fontSize: '16px',
//     borderRadius: '8px',
//     color: '#fff',
//     border: 'none',
//     cursor: 'pointer',
//     boxShadow: '0px 4px 15px rgba(0,0,0,0.2)',
//     transition: 'transform 0.2s',
//   },
//   resultsContainer: {
//     padding: '20px',
//     background: '#333',
//     borderRadius: '12px',
//     boxShadow: '0px 4px 15px rgba(0,0,0,0.2)',
//   },
//   resultsList: {
//     listStyle: 'none',
//     padding: 0,
//     margin: 0,
//   },
//   resultItem: {
//     marginBottom: '8px',
//   },
//   resultColor: {
//     display: 'inline-block',
//     width: '20px',
//     height: '20px',
//     borderRadius: '50%',
//     marginRight: '8px',
//   },
// };

// export default SpinWheel;

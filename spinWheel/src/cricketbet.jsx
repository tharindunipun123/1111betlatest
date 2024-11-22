import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import styles from './CricketBetting.module.css';

const socket = io('http://145.223.21.62:3008');

const CricketBetting = () => {
  const [matches, setMatches] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [betType, setBetType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [betHistory, setBetHistory] = useState([]);

  const userId = 1; // Replace with actual user ID

  useEffect(() => {
    fetchMatches();
    fetchWalletBalance();
    fetchBetHistory();

    socket.on('matchUpdate', handleMatchUpdate);
    socket.on('matchEnded', handleMatchEnded);

    return () => {
      socket.off('matchUpdate', handleMatchUpdate);
      socket.off('matchEnded', handleMatchEnded);
    };
  }, []);

  const handleMatchUpdate = (updatedMatch) => {
    setMatches(prevMatches => 
      prevMatches.map(match => 
        match.id === updatedMatch.id ? updatedMatch : match
      )
    );
    if (selectedMatch && selectedMatch.id === updatedMatch.id) {
      setSelectedMatch(updatedMatch);
    }
  };

  const handleMatchEnded = ({ matchId, result, fullTargetResult, sixOverTargetResult }) => {
    setMatches(prevMatches => 
      prevMatches.map(match => 
        match.id === matchId 
          ? { 
              ...match, 
              status: 'completed', 
              result,
              full_target_result: fullTargetResult,
              six_over_target_result: sixOverTargetResult 
            } 
          : match
      )
    );
    fetchWalletBalance();
    fetchBetHistory();
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://145.223.21.62:3008/matches');
      if (!response.ok) throw new Error('Failed to fetch matches');
      const data = await response.json();
      // Format the matches data to ensure team1 and team2 are always present
      const formattedMatches = data.map(match => ({
        ...match,
        team1: match.team1 || '',
        team2: match.team2 || '',
      }));
      setMatches(formattedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch(`http://145.223.21.62:3008/wallet?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch wallet balance');
      const data = await response.json();
      // Convert to number and handle potential null/undefined values
      setWalletBalance(Number(data.wallet) || 0);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      setError('Failed to load wallet balance');
      setWalletBalance(0); // Set to 0 if there's an error
    }
  };

  const fetchBetHistory = async () => {
    try {
      const response = await fetch(`http://145.223.21.62:3008/bet-history?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch bet history');
      const data = await response.json();
      setBetHistory(data);
    } catch (error) {
      console.error('Error fetching bet history:', error);
      setError('Failed to load bet history');
    }
  };

  const handlePlaceBet = async () => {
    try {
      const response = await fetch('http://145.223.21.62:3008/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          matchId: selectedMatch.id,
          betType,
          amount: parseFloat(betAmount)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place bet');
      }

      await fetchWalletBalance();
      await fetchBetHistory();
      setBetAmount('');
      setBetType('');
      alert('Bet placed successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const formatBetType = (betType, match) => {
    if (!betType || !match) return '';
  
    if (betType.startsWith('team')) {
      // Instead of using teams array, use team1 and team2 directly
      const teamNumber = betType.charAt(4);
      return teamNumber === '1' ? `${match.team1} Win` : `${match.team2} Win`;
    }
  
    const betTypeLabels = {
      'draw': 'Draw',
      'full_target_yes': 'Full Target - Yes',
      'full_target_no': 'Full Target - No',
      'six_over_target_yes': 'Six Over Target - Yes',
      'six_over_target_no': 'Six Over Target - No'
    };
  
    return betTypeLabels[betType] || betType;
  };

  const getBetMultiplier = (betType, match) => {
    if (!match) return null;

    if (betType?.startsWith('team')) {
      const teamIndex = parseInt(betType.charAt(4)) - 1;
      return match[`team${teamIndex + 1}_win_multiplier`];
    }

    const multiplierMap = {
      'draw': 'draw_multiplier',
      'full_target_yes': 'full_target_multiplier_yes',
      'full_target_no': 'full_target_multiplier_no',
      'six_over_target_yes': 'six_over_target_multiplier_yes',
      'six_over_target_no': 'six_over_target_multiplier_no'
    };

    return match[multiplierMap[betType]];
  };

   
  const formatMatchTeams = (match) => {
    if (!match) return '';
    if (match.team1 && match.team2) {
      return `${match.team1} vs ${match.team2}`;
    }
    return 'Teams Not Available';
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.cricketBetting}>
    <header className={styles.header}>
      <h1>Cricket Betting</h1>
      <div className={styles.walletBalance}>
        Balance: ${walletBalance.toFixed(2)}
      </div>
    </header>
    
    <main className={styles.main}>
      <section className={styles.matchList}>
        <h2>Upcoming Matches</h2>
        {matches.map(match => (
          <div 
            key={match.id} 
            className={`${styles.matchItem} ${selectedMatch?.id === match.id ? styles.selected : ''}`} 
            onClick={() => setSelectedMatch(match)}
          >
            <h3>{formatMatchTeams(match)}</h3>
            <p>Time: {new Date(match.match_time).toLocaleString()}</p>
            <p className={styles.matchStatus}>Status: {match.status}</p>
            
            {match.status === 'completed' && (
              <div className={styles.results}>
                <p>Match Result: {formatBetType(match.result, match)}</p>
                {match.full_target_result && match.full_target_result !== 'pending' && (
                  <p>Full Target: {match.full_target_result === 'yes' ? 'Achieved' : 'Not Achieved'}</p>
                )}
                {match.six_over_target_result && match.six_over_target_result !== 'pending' && (
                  <p>Six Over Target: {match.six_over_target_result === 'yes' ? 'Achieved' : 'Not Achieved'}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </section>

      {selectedMatch && selectedMatch.status !== 'completed' && (
        <section className={styles.bettingForm}>
          <h2>Place Bet: {formatMatchTeams(selectedMatch)}</h2>

          {!selectedMatch.is_locked && (
            <div className={styles.betSection}>
              <h3>Match Winner</h3>
              <select 
                value={betType} 
                onChange={(e) => setBetType(e.target.value)}
                className={styles.select}
              >
                <option value="">Select Winner</option>
                <option value="team1_win">
                  {selectedMatch.team1} Win (×{selectedMatch.team1_win_multiplier})
                </option>
                <option value="team2_win">
                  {selectedMatch.team2} Win (×{selectedMatch.team2_win_multiplier})
                </option>
                <option value="draw">Draw (×{selectedMatch.draw_multiplier})</option>
              </select>
            </div>
          )}

            {/* Full Target Betting */}
            {!selectedMatch.full_target_locked && (
              <div className={styles.betSection}>
                <h3>Full Target</h3>
                <select 
                  value={betType} 
                  onChange={(e) => setBetType(e.target.value)}
                  className={styles.select}
                >
                  <option value="">Select Prediction</option>
                  <option value="full_target_yes">
                    Yes (×{selectedMatch.full_target_multiplier_yes})
                  </option>
                  <option value="full_target_no">
                    No (×{selectedMatch.full_target_multiplier_no})
                  </option>
                </select>
              </div>
            )}

            {/* Six Over Target Betting */}
            {!selectedMatch.six_over_target_locked && (
              <div className={styles.betSection}>
                <h3>Six Over Target</h3>
                <select 
                  value={betType} 
                  onChange={(e) => setBetType(e.target.value)}
                  className={styles.select}
                >
                  <option value="">Select Prediction</option>
                  <option value="six_over_target_yes">
                    Yes (×{selectedMatch.six_over_target_multiplier_yes})
                  </option>
                  <option value="six_over_target_no">
                    No (×{selectedMatch.six_over_target_multiplier_no})
                  </option>
                </select>
              </div>
            )}

            {/* Bet Amount Input */}
            {betType && (
              <div className={styles.betAmount}>
                <input 
                  type="number" 
                  value={betAmount} 
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter Bet Amount"
                  className={styles.input}
                />
                <button 
                  onClick={handlePlaceBet} 
                  disabled={!betType || !betAmount || isNaN(parseFloat(betAmount))}
                  className={styles.button}
                >
                  Place Bet
                </button>
              </div>
            )}
          </section>
        )}

<section className={styles.betHistory}>
  <h2>Bet History</h2>
  {betHistory.map(bet => (
    <div key={bet.id} className={styles.betItem}>
      <p>{bet.match_details}</p>
      <p>Bet Type: {formatBetType(bet.bet_type, {
        team1: bet.team1,
        team2: bet.team2
      })}</p>
      <p>Amount: ${parseFloat(bet.amount).toFixed(2)}</p>
      <p>Status: {bet.status}</p>
      {bet.status === 'won' && <p>Winnings: ${parseFloat(bet.winnings).toFixed(2)}</p>}
    </div>
  ))}
</section>
      </main>
    </div>
  );
};

export default CricketBetting;
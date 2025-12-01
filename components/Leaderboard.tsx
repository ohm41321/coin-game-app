// components/Leaderboard.tsx
import React, { useState } from 'react';
import { GameState } from '../lib/types';

interface LeaderboardProps {
  gameState: GameState;
  role: 'player' | 'gm' | null;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ gameState, role }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleResetGame = async () => {
        if (!confirm('Are you sure you want to reset the entire game? This will allow a new game to begin.')) {
            return;
        }
        setIsLoading(true);
        try {
          const response = await fetch('/api/gm/reset', { method: 'POST' });
           if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to reset game');
          }
          // The page will now reload or the state will clear, starting the process over.
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
      }

  const { leaderboard } = gameState;

  return (
    <div>
      <h2>Game Over!</h2>
      <h3>🏆 Final Leaderboard 🏆</h3>
      <ol style={{ listStylePosition: 'inside', padding: '1rem 0' }}>
        {leaderboard.map((player, index) => (
          <li key={index} style={{ fontSize: '1.2rem', fontWeight: index === 0 ? 'bold' : 'normal', margin: '0.5rem 0' }}>
            {player.name} - {player.totalCoins} coins
          </li>
        ))}
      </ol>
      <p>Thank you for playing!</p>

      {role === 'gm' && (
         <button onClick={handleResetGame} disabled={isLoading} className="danger">
            Reset Game for All Players
        </button>
      )}
    </div>
  );
};

export default Leaderboard;

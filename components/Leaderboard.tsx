// components/Leaderboard.tsx
import React, { useState } from 'react';
import { GameState } from '../lib/types';
import { useTranslation } from 'react-i18next';

interface LeaderboardProps {
  gameState: GameState;
  role: 'player' | 'gm' | null;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ gameState, role }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const handleResetGame = async () => {
        if (!confirm(t('leaderboard.resetConfirm'))) {
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
      <h2>{t('leaderboard.gameOverTitle')}</h2>
      <div className="confetti"></div>
      <h3>{t('leaderboard.finalLeaderboardTitle')}</h3>
      <ol style={{ listStylePosition: 'inside', padding: '1rem 0' }}>
        {leaderboard.map((player, index) => (
          <li key={index} style={{ fontSize: '1.2rem', fontWeight: index === 0 ? 'bold' : 'normal', margin: '0.5rem 0' }}>
            {player.name} - {t('leaderboard.coins', { count: player.totalCoins })}
          </li>
        ))}
      </ol>
      <p>{t('leaderboard.thankYouMessage')}</p>

      {role === 'gm' && (
         <button onClick={handleResetGame} disabled={isLoading} className="danger">
            {t('leaderboard.resetGame')}
        </button>
      )}
    </div>
  );
};

export default Leaderboard;

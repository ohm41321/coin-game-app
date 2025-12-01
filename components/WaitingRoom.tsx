// components/WaitingRoom.tsx
import React, { useState } from 'react';
import { GameState } from '../lib/types';
import { useTranslation } from 'react-i18next';

interface WaitingRoomProps {
  gameState: GameState;
  role: 'player' | 'gm' | null; // role can be null for initial state
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ gameState, role }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartGame = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/gm/start-round', { method: 'POST' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to start game');
      }
      // Polling will handle the state update
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetGame = async () => {
    if (!confirm(t('waitingRoom.resetConfirm'))) {
        return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/gm/reset', { method: 'POST' });
       if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reset game');
      }
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  }

  const playerList = Object.values(gameState.players);

  return (
    <div>
      <h2>{t('waitingRoom.title')}</h2>
      <p>
        {t('waitingRoom.playerCount', { count: playerList.length })}
      </p>

      <div className="player-list">
        {playerList.length > 0 ? (
          <ul>
            {playerList.map((player) => (
              <li key={player.id}>{player.name}</li>
            ))}
          </ul>
        ) : (
          <p>{t('waitingRoom.noPlayers')}</p>
        )}
      </div>

      {role === 'gm' && (
        <div>
          <button onClick={handleStartGame} disabled={isLoading || playerList.length === 0}>
            {isLoading ? t('waitingRoom.startingButton') : t('waitingRoom.startRoundButton')}
          </button>
          <button onClick={handleResetGame} className="danger" disabled={isLoading}>
            {t('waitingRoom.resetGameButton')}
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      )}

      {role === 'player' && <p>{t('waitingRoom.playerWaitingMessage')}</p>}
    </div>
  );
};

export default WaitingRoom;

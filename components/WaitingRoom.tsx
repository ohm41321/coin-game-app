// components/WaitingRoom.tsx
import React, { useState } from 'react';
import { GameState } from '../lib/types';

interface WaitingRoomProps {
  gameState: GameState;
  role: 'player' | 'gm';
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ gameState, role }) => {
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
    if (!confirm('Are you sure you want to reset the entire game? All players will be disconnected.')) {
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
      <h2>Waiting for Game to Start</h2>
      <p>
        {playerList.length} {playerList.length === 1 ? 'player' : 'players'} have joined.
      </p>

      <div className="player-list">
        {playerList.length > 0 ? (
          <ul>
            {playerList.map((player) => (
              <li key={player.id}>{player.name}</li>
            ))}
          </ul>
        ) : (
          <p>No players have joined yet.</p>
        )}
      </div>

      {role === 'gm' && (
        <div>
          <button onClick={handleStartGame} disabled={isLoading || playerList.length === 0}>
            {isLoading ? 'Starting...' : 'Start Round 1'}
          </button>
          <button onClick={handleResetGame} className="danger" disabled={isLoading}>
            Reset Game
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      )}

      {role === 'player' && <p>The Game Master will start the game shortly.</p>}
    </div>
  );
};

export default WaitingRoom;

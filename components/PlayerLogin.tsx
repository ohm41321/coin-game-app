// components/PlayerLogin.tsx
import React, { useState, useEffect } from 'react';

interface PlayerLoginProps {
  onLogin: (playerId: string) => void;
  message?: string;
}

const PlayerLogin: React.FC<PlayerLoginProps> = ({ onLogin, message }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/create-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join game');
      }

      // Pass the player ID back to the parent component
      onLogin(data.playerId);
      
      // Store player ID in local storage to persist across reloads
      localStorage.setItem('coin-game-playerId', data.playerId);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Attempt to retrieve player ID from local storage on component mount
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('coin-game-playerId');
    if (storedPlayerId) {
        onLogin(storedPlayerId);
    }
  }, []); // Empty dependency array ensures this runs only once.


  return (
    <div>
      <h2>Join the Game</h2>
       {message && <p>{message}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Your Name"
          required
          maxLength={30}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Joining...' : 'Join Game'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default PlayerLogin;

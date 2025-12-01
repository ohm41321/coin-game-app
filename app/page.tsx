// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { GameState, GamePhase, Player } from '../lib/types';
import GMLogin from '../components/GMLogin';
import PlayerLogin from '../components/PlayerLogin';
import RoleSelector from '../components/RoleSelector';
import WaitingRoom from '../components/WaitingRoom';
import GMDashboard from '../components/GMDashboard';
import PlayerView from '../components/PlayerView';
import Leaderboard from '../components/Leaderboard';

// This is the main component that orchestrates the entire UI.
export default function Home() {
  // Client-side state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string>('');
  
  const [role, setRole] = useState<'player' | 'gm' | null>(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('coin_game_role');
      return savedRole === 'player' || savedRole === 'gm' ? savedRole : null;
    }
    return null;
  });

  const [playerId, setPlayerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleSetRole = (newRole: 'player' | 'gm' | null) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem('coin_game_role', newRole);
    } else {
      localStorage.removeItem('coin_game_role');
    }
  };

  // --- Main Game State Polling Logic ---
  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await fetch('/api/get-state');
        if (!response.ok) {
          throw new Error('Failed to fetch game state');
        }
        const data: GameState = await response.json();
        setGameState(data);
      } catch (err: any) {
        setError(err.message);
        // Stop polling on error
        clearInterval(interval);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch initial state immediately
    fetchState();

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchState, 2000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this runs once on mount

  // --- Render Logic ---
  
  const renderContent = () => {
    // Show loading spinner initially
    if (isLoading || !gameState) {
      return <div className="spinner"></div>;
    }
    
    // If the game is over, always show the leaderboard
    if (gameState.gamePhase === GamePhase.GAME_OVER) {
        return <Leaderboard gameState={gameState} role={role} />;
    }

    // 1. Role Selection
    if (!role) {
      return <RoleSelector onSelectRole={handleSetRole} />;
    }

    // 2. Login Screens
    if (role === 'gm' && !gameState.gm.isLoggedIn) {
      return <GMLogin />;
    }
    if (role === 'player' && !playerId) {
      return <PlayerLogin onLogin={setPlayerId} />;
    }

    // --- Logged-In Views ---
    
    // Get the current player's data
    const me = gameState.players[playerId];

    // If player has logged in but their data isn't in the state yet (e.g., after a reset)
    if (role === 'player' && playerId && !me) {
        return <PlayerLogin onLogin={setPlayerId} message="Game may have been reset. Please log in again." />;
    }

    // 3. Waiting Room
    if (gameState.gamePhase === GamePhase.WAITING_FOR_PLAYERS) {
        return <WaitingRoom gameState={gameState} role={role} />;
    }
    
    // 4. Main Game Views
    if (role === 'gm') {
        return <GMDashboard gameState={gameState} />;
    }
    
    if (role === 'player' && me) {
        return <PlayerView gameState={gameState} me={me} />;
    }

    // Fallback
    return <div>An unexpected error occurred.</div>;
  };

  return (
    <main>
      <div className="container">
        <h1>Budgeting Game</h1>
        {error && <p className="error">Connection Error: {error}</p>}
        {renderContent()}
      </div>
    </main>
  );
}
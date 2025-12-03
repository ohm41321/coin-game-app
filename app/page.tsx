// app/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { GameState, GamePhase, Player } from '../lib/types';
import GMLogin from '../components/GMLogin';
import PlayerLogin from '../components/PlayerLogin';
import RoleSelector from '../components/RoleSelector';
import WaitingRoom from '../components/WaitingRoom';
import GMDashboard from '../components/GMDashboard';
import PlayerView from '../components/PlayerView';
import Leaderboard from '../components/Leaderboard';
import CatchingGame from '../components/CatchingGame';
import SinglePlayerGame from '../components/SinglePlayerGame';
import HowToPlayModal from '../components/HowToPlayModal';
import { useTranslation } from 'react-i18next';

// This is the main component that orchestrates the entire UI.
export default function Home() {
  const { t, i18n } = useTranslation();
  // Client-side state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string>('');
  
  const [role, setRole] = useState<'player' | 'gm' | 'single-player' | null>(null);
  const [showCatchGame, setShowCatchGame] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);

  // This effect runs only on the client, after the initial render, to avoid hydration mismatch.
  useEffect(() => {
    const savedRole = localStorage.getItem('coin_game_role');
    if (savedRole === 'player' || savedRole === 'gm' || savedRole === 'single-player') {
      setRole(savedRole);
    }
  }, []);

  const [playerId, setPlayerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false); // New state for mobile detection

  // Effect to detect screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Use 768px as the breakpoint for mobile
    };

    // Set initial state
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Clean up event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleSetRole = (newRole: 'player' | 'gm' | 'single-player' | null) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem('coin_game_role', newRole);
    } else {
      localStorage.removeItem('coin_game_role');
    }
  };

  const toggleHowToPlayModal = () => {
    setShowHowToPlayModal((prev) => !prev);
  };

  const handlePlayerCancel = async () => {
    if (!playerId) return;

    try {
      // Notify the server to remove the player
      await fetch('/api/player/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
    } catch (err) {
      // Even if server fails, log out on client side
      console.error('Failed to cancel player on server', err);
    } finally {
      // Clear client-side state regardless of server response
      localStorage.removeItem('coin-game-playerId');
      setPlayerId('');
      handleSetRole(null);
    }
  };

  // --- Main Game State Polling Logic ---
  useEffect(() => {
    // IMPORTANT: This check ensures this code only runs on the client
    if (typeof window === 'undefined' || role === 'single-player') {
      return;
    }
  
    let isMounted = true;
    const fetchState = async () => {
      try {
        const response = await fetch('/api/get-state');
        if (!response.ok) {
          throw new Error('Failed to fetch game state');
        }
        const data: GameState = await response.json();
        if (isMounted) {
          setGameState(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
        }
        // Stop polling on error
        clearInterval(interval);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Fetch initial state immediately
    fetchState();

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchState, 2000);

    // Cleanup interval on component unmount
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [role]);

  // --- Render Logic ---
  
  const renderContent = () => {
    if (role === 'single-player') {
      return <SinglePlayerGame />;
    }
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
      return (
        <div className="role-selector-container">
            <div className={`role-selector-wrapper ${showCatchGame ? 'hidden' : ''}`}>
                <RoleSelector onSelectRole={handleSetRole} onPlayGame={() => setShowCatchGame(true)} />
            </div>
            {showCatchGame && <CatchingGame onClose={() => setShowCatchGame(false)} />}
        </div>
      )
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
        return <PlayerLogin onLogin={setPlayerId} message={t('playerLogin.loginMessage')} />;
    }

    // 3. Waiting Room
    if (gameState.gamePhase === GamePhase.WAITING_FOR_PLAYERS) {
        return <WaitingRoom gameState={gameState} role={role} onCancel={handlePlayerCancel} />;
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
        <div className="particles">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="header">
          <div className="left">
            {/* Conditionally render back button */}
            {role === 'single-player' || (role === 'gm' && !gameState?.gm.isLoggedIn) || (role === 'player' && !playerId) || (role === 'player' && playerId && !gameState?.players[playerId]) ? (
                <button
                  type="button"
                  className="back-button"
                  onClick={() => handleSetRole(null)}
                >
                  ← {isMobile ? '' : t('back')}
                </button>
              ) : null}
          </div>

          <div className="center">
            <h1>{t('appName')}</h1>
          </div>

          <div className="right">
            <button
              type="button"
              className="secondary"
              onClick={toggleHowToPlayModal}
              style={{ marginRight: '15px', padding: '0.2rem 0.6rem', fontSize: '0.7rem', whiteSpace: 'nowrap' }} // Increased spacing from language switcher, smaller font size
            >
              {t('roleSelector.howToPlayButton')}
            </button>
            <div className="language-switcher">
              <button onClick={() => i18n.changeLanguage('en')} disabled={i18n.language === 'en'}>EN</button>
              <button onClick={() => i18n.changeLanguage('th')} disabled={i18n.language === 'th'}>TH</button>
            </div>
          </div>
        </div>
          {error && <p className="error">{t('connectionError', { error: error })}</p>}
          <Suspense fallback={<div className="spinner"></div>}>
            {renderContent()}
                  </Suspense>
                  {showHowToPlayModal && <HowToPlayModal onClose={toggleHowToPlayModal} />}
                <footer style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', borderTop: '1px solid #ccc', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                  <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Developed by:</p>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <a href="https://github.com/ohm41321" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', transition: 'color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#333'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>
                      <img src="/github.svg" alt="GitHub" width="20" height="20" style={{ marginRight: '5px' }} />
                      <span> ohm41321</span>
                    </a>
                    <span>|</span>
                    <span style={{ display: 'flex', alignItems: 'center' }}>✉️ athitfkm@gmail.com</span>
                    <span>|</span>
                    <a href="https://tipme.in.th/athitfkm" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.3s', display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ff6b6b'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>
                      <span>☕ Tipme</span>
                    </a>
                  </div>
                </footer>
              </main>
            );
}


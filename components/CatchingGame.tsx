import React, { useState, useEffect, useCallback, useRef } from 'react';

const CATCHER_WIDTH = 100;
const CATCHER_HEIGHT = 20;
const COIN_SIZE = 25;
const COIN_SPEED = 0.2; // Pixels per millisecond

interface Coin {
  id: number;
  x: number;
  y: number;
}

interface CatchingGameProps {
  onClose: () => void;
}

const CatchingGame: React.FC<CatchingGameProps> = ({ onClose }) => {
  const [catcherX, setCatcherX] = useState(0);
  const [coins, setCoins] = useState<Coin[]>([]);
    const [score, setScore] = useState(0);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    
    // Refs for values that need to be accessed inside the game loop without causing dependency changes
    const coinsRef = useRef<Coin[]>([]);
    const lastTimeRef = useRef<number>(0);
    const coinSpawnTimerRef = useRef<number>(0);
    const catcherXRef = useRef(catcherX);
    useEffect(() => {
      catcherXRef.current = catcherX;
    }, [catcherX]);
  
    // --- Event Listeners Setup ---
  
    useEffect(() => {
      const updateDimensions = () => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
        setCatcherX(window.innerWidth / 2 - CATCHER_WIDTH / 2);
      };
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, []);
    
    useEffect(() => {
      const handlePointerMove = (e: PointerEvent) => {
        if (!dimensions.width) return;
        const newX = e.clientX - CATCHER_WIDTH / 2;
        const clampedX = Math.max(0, Math.min(newX, dimensions.width - CATCHER_WIDTH));
        setCatcherX(clampedX);
      };
      window.addEventListener('pointermove', handlePointerMove);
      return () => window.removeEventListener('pointermove', handlePointerMove);
    }, [dimensions.width]);
  
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
              onClose();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
  
  
    // --- Game Loop ---
    useEffect(() => {
      let animationFrameId: number;
  
      const gameLoop = (timestamp: number) => {
        if (lastTimeRef.current === 0) {
          lastTimeRef.current = timestamp;
          animationFrameId = requestAnimationFrame(gameLoop);
          return;
        }
        
        if (dimensions.width === 0 || dimensions.height === 0) {
          animationFrameId = requestAnimationFrame(gameLoop);
          return;
        }
  
        const deltaTime = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;
        coinSpawnTimerRef.current += deltaTime;
  
        let scoreGainedThisFrame = 0;
  
        // Move coins
        const currentCoins = coinsRef.current.map(coin => ({ ...coin, y: coin.y + COIN_SPEED * deltaTime }));
  
        // Filter out caught and off-screen coins
        const remainingCoins = currentCoins.filter(coin => {
          if (coin.y > dimensions.height) {
            return false; // Remove if off-screen
          }
          const isCaught = 
            coin.y + COIN_SIZE >= dimensions.height - CATCHER_HEIGHT &&
            coin.x + COIN_SIZE > catcherXRef.current &&
            coin.x < catcherXRef.current + CATCHER_WIDTH;
          
          if (isCaught) {
            scoreGainedThisFrame++;
            return false;
          }
          return true;
        });
        
        // Spawn new coins
        if (coinSpawnTimerRef.current > 500) {
          coinSpawnTimerRef.current = 0;
          remainingCoins.push({
              id: Date.now() + Math.random(),
              x: Math.random() * (dimensions.width - COIN_SIZE),
              y: -COIN_SIZE,
          });
        }
        
        // Update the ref for the next loop, and the state to trigger a re-render
        coinsRef.current = remainingCoins;
        setCoins(remainingCoins);
  
        if (scoreGainedThisFrame > 0) {
          setScore(s => s + scoreGainedThisFrame);
        }
  
        animationFrameId = requestAnimationFrame(gameLoop);
      };
  
      animationFrameId = requestAnimationFrame(gameLoop);
  
      return () => {
        cancelAnimationFrame(animationFrameId);
        // Reset refs on cleanup
        lastTimeRef.current = 0;
        coinsRef.current = [];
        coinSpawnTimerRef.current = 0;
      };
    }, [dimensions.width, dimensions.height]);


  const gameAreaStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    cursor: 'none',
    zIndex: 20,
  };

  const catcherStyle: React.CSSProperties = {
    position: 'absolute',
    left: catcherX,
    bottom: 0,
    width: CATCHER_WIDTH,
    height: CATCHER_HEIGHT,
    backgroundColor: 'white',
  };

  const scoreStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    color: 'white',
    fontSize: '24px',
    fontFamily: 'monospace',
    zIndex: 21,
  };

  const coinStyle = (coin: Coin): React.CSSProperties => ({
    position: 'absolute',
    left: coin.x,
    top: coin.y,
    width: COIN_SIZE,
    height: COIN_SIZE,
    backgroundColor: 'gold',
    borderRadius: '50%',
  });

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    color: 'white',
    background: 'none',
    border: '2px solid white',
    borderRadius: '5px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '16px',
    zIndex: 21,
  };


  return (
    <div style={gameAreaStyle}>
      <div style={scoreStyle}>Score: {score}</div>
      <button style={closeButtonStyle} onClick={onClose}>
        Close (Esc)
      </button>
      <div style={catcherStyle} />
      {coins.map(coin => (
        <div key={coin.id} style={coinStyle(coin)} />
      ))}
    </div>
  );
};

export default CatchingGame;

// components/GMDashboard.tsx
import React, { useState } from 'react';
import { GameState, GamePhase, Player } from '../lib/types';
import EventCardView from './EventCardView';

interface GMDashboardProps {
  gameState: GameState;
}

const GMDashboard: React.FC<GMDashboardProps> = ({ gameState }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGMAction = async (apiEndpoint: string) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(apiEndpoint, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Action failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEndGameEarly = async () => {
    if (!confirm('Are you sure you want to end the game now and calculate final scores?')) {
        return;
    }
    await handleGMAction('/api/gm/end-game-early');
  }

  const { gamePhase, currentRound, players, currentEvent } = gameState;
  const playerList = Object.values(players);

  const renderPhaseContent = () => {
    switch (gamePhase) {
      case GamePhase.ALLOCATION:
        const submittedCount = playerList.filter(p => p.currentAllocation).length;
        return (
          <div>
            <p>{submittedCount} / {playerList.length} players have submitted allocations.</p>
            <button onClick={() => handleGMAction('/api/gm/draw-event')} disabled={isLoading || submittedCount < playerList.length}>
              Draw Event Card
            </button>
          </div>
        );
      case GamePhase.EVENT_RESOLUTION:
        const resolvedCount = playerList.filter(p => p.actionRequired === null).length;
         return (
          <div>
            {currentEvent && <EventCardView event={currentEvent} />}
            <p>{resolvedCount} / {playerList.length} players have resolved the event.</p>
            <p>Waiting for players to make their choices...</p>
          </div>
        );
      case GamePhase.EVENT_DRAWN:
        return (
           <div>
            {currentEvent && <EventCardView event={currentEvent} />}
            <p>All events are resolved. You can now end the round.</p>
            <button onClick={() => handleGMAction('/api/gm/end-round')} disabled={isLoading}>
                Calculate & End Round {currentRound}
            </button>
           </div>
         )
      case GamePhase.ROUND_END:
        return (
          <div>
            <h3>Round {currentRound} Results</h3>
            <button onClick={() => handleGMAction('/api/gm/start-round')} disabled={isLoading}>
              Start Round {currentRound + 1}
            </button>
          </div>
        );
      default:
        return <p>Current Phase: {gamePhase}</p>;
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
        <h2>GM Dashboard - Round {currentRound}</h2>
        <div>
            <button onClick={handleEndGameEarly} disabled={isLoading} className="secondary" style={{fontSize: '0.8rem', padding: '0.5rem 1rem'}}>
                End Game Early
            </button>
            <button onClick={() => handleGMAction('/api/gm/reset')} disabled={isLoading} className="danger" style={{fontSize: '0.8rem', padding: '0.5rem 1rem'}}>
                Reset Game
            </button>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      
      <div className='card-container' style={{margin: '2rem 0'}}>
        {renderPhaseContent()}
      </div>

      <h3>Player Status</h3>
      <ul className='player-list' style={{maxHeight: '400px'}}>
        {playerList.map(p => (
            <li key={p.id}>
                <details>
                    <summary>
                        <strong>{p.name}:</strong> {Math.floor(p.totalCoins)} coins | Income: {p.income} | 
                        {gamePhase === GamePhase.ALLOCATION && (p.currentAllocation ? ' ✅ Submitted' : '...Waiting')}
                        {gamePhase === GamePhase.EVENT_RESOLUTION && (p.actionRequired ? '...Choosing' : ' ✅ Done')}
                    </summary>
                    <div style={{paddingLeft: '1rem', marginTop: '0.5rem', fontSize: '0.9rem'}}>
                        <p>Short-term: {p.categoryTotals.short}</p>
                        <p>Long-term: {p.categoryTotals.long}</p>
                        <p>Emergency: {p.categoryTotals.emergency}</p>
                    </div>
                </details>
            </li>
        ))}
      </ul>
    </div>
  );
};

export default GMDashboard;

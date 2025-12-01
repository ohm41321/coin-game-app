// components/GMDashboard.tsx
import React, { useState } from 'react';
import { GameState, GamePhase, Player } from '../lib/types';
import EventCardView from './EventCardView';
import { useTranslation } from 'react-i18next';

interface GMDashboardProps {
  gameState: GameState;
}

const GMDashboard: React.FC<GMDashboardProps> = ({ gameState }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGMAction = async (apiEndpoint: string) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(apiEndpoint, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || t('gmDashboard.actionFailed'));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEndGameEarly = async () => {
    if (!confirm(t('gmDashboard.endGameEarlyConfirm'))) {
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
            <p>{t('gmDashboard.phaseAllocationMessage', { submittedCount, playerListLength: playerList.length })}</p>
            <button onClick={() => handleGMAction('/api/gm/draw-event')} disabled={isLoading || submittedCount < playerList.length}>
              {t('gmDashboard.drawEventCardButton')}
            </button>
          </div>
        );
      case GamePhase.EVENT_RESOLUTION:
        const resolvedCount = playerList.filter(p => p.actionRequired === null).length;
         return (
          <div>
            {currentEvent && <EventCardView event={currentEvent} />}
            <p>{t('gmDashboard.phaseEventResolutionMessage', { resolvedCount, playerListLength: playerList.length })}</p>
            <p>{t('gmDashboard.waitingForPlayerChoices')}</p>
          </div>
        );
      case GamePhase.EVENT_DRAWN:
        return (
           <div>
            {currentEvent && <EventCardView event={currentEvent} />}
            <p>{t('gmDashboard.phaseEventDrawnMessage')}</p>
            <button onClick={() => handleGMAction('/api/gm/end-round')} disabled={isLoading}>
                {t('gmDashboard.calculateAndEndRoundButton', { currentRound })}
            </button>
           </div>
         )
      case GamePhase.ROUND_END:
        return (
          <div>
            <h3>{t('gmDashboard.roundResultsTitle', { currentRound })}</h3>
            <button onClick={() => handleGMAction('/api/gm/start-round')} disabled={isLoading}>
              {t('gmDashboard.startNextRoundButton', { nextRound: currentRound + 1 })}
            </button>
          </div>
        );
      default:
        return <p>{t('gmDashboard.currentPhase', { phase: gamePhase })}</p>;
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
        <h2>{t('gmDashboard.title', { currentRound })}</h2>
        <div>
            <button onClick={handleEndGameEarly} disabled={isLoading} className="secondary" style={{fontSize: '0.8rem', padding: '0.5rem 1rem'}}>
                {t('gmDashboard.endGameEarlyButton')}
            </button>
            <button onClick={() => handleGMAction('/api/gm/reset')} disabled={isLoading} className="danger" style={{fontSize: '0.8rem', padding: '0.5rem 1rem'}}>
                {t('gmDashboard.resetGameButton')}
            </button>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      
      <div className='card-container' style={{margin: '2rem 0'}}>
        {renderPhaseContent()}
      </div>

      <h3>{t('gmDashboard.playerStatusTitle')}</h3>
      <ul className='player-list' style={{maxHeight: '400px'}}>
        {playerList.map(p => (
            <li key={p.id}>
                <details>
                    <summary>
                        <strong>{t('gmDashboard.playerListItem', { name: p.name, totalCoins: Math.floor(p.totalCoins), income: p.income })}</strong>
                        {gamePhase === GamePhase.ALLOCATION && (p.currentAllocation ? t('gmDashboard.submittedStatus') : t('gmDashboard.waitingStatus'))}
                        {gamePhase === GamePhase.EVENT_RESOLUTION && (p.actionRequired ? t('gmDashboard.choosingStatus') : t('gmDashboard.doneStatus'))}
                    </summary>
                    <div style={{paddingLeft: '1rem', marginTop: '0.5rem', fontSize: '0.9rem'}}>
                        <p>{t('gmDashboard.shortTerm')} {p.categoryTotals.short}</p>
                        <p>{t('gmDashboard.longTerm')} {p.categoryTotals.long}</p>
                        <p>{t('gmDashboard.emergency')} {p.categoryTotals.emergency}</p>
                    </div>
                </details>
            </li>
        ))}
      </ul>
    </div>
  );
};

export default GMDashboard;

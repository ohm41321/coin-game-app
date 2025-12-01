// components/PlayerView.tsx
import React, { useState, useEffect } from 'react';
import { GameState, GamePhase, Player, PlayerAllocation } from '../lib/types';
import EventCardView from './EventCardView';
import DistributeLossModal from './DistributeLossModal';
import CoverLossModal from './CoverLossModal';
import AllocateBonusModal from './AllocateBonusModal';
import RoundSummaryModal from './RoundSummaryModal'; // Import the new modal

interface PlayerViewProps {
  gameState: GameState;
  me: Player;
}

const PlayerView: React.FC<PlayerViewProps> = ({ gameState, me }) => {
  const [allocation, setAllocation] = useState<PlayerAllocation>({ food: 0, short: 0, long: 0, emergency: 0 });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAcknowledgedEvent, setHasAcknowledgedEvent] = useState(false);

  const allocationBudget = me.income; // Use income from previous round as budget
  const totalAllocated = Object.values(allocation).reduce((sum, val) => sum + val, 0);

  // Reset acknowledgment when the event itself changes
  useEffect(() => {
    setHasAcknowledgedEvent(false);
  }, [gameState.currentEvent?.id]);

  useEffect(() => {
    if (gameState.gamePhase === GamePhase.ALLOCATION && me.currentAllocation === null) {
      setAllocation({
        food: 0,
        short: 0,
        long: 0,
        emergency: 0
      });
      setError('');
    }
  }, [gameState.gamePhase, me.currentAllocation]);

  const handleAllocationChange = (category: keyof PlayerAllocation, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;
    setAllocation((prev) => ({ ...prev, [category]: numValue }));
  };

  const handleAcknowledgeSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/player/acknowledge-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: me.id }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to acknowledge summary');
      }
      // Polling will handle the UI update
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAllocated !== allocationBudget) {
      setError(`Your allocation must sum to ${allocationBudget}.`);
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/player/submit-allocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: me.id, allocation }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (me.actionRequired) {
      if (!hasAcknowledgedEvent) {
        return (
          <div>
            <EventCardView event={gameState.currentEvent!} />
            <button onClick={() => setHasAcknowledgedEvent(true)} style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem' }}>
              Continue
            </button>
          </div>
        );
      }

      // If acknowledged, show the event and the modal
      return (
        <div>
          <EventCardView event={gameState.currentEvent!} />
          {(() => {
            switch (me.actionRequired.type) {
              case 'DISTRIBUTE_LOSS':
                return <DistributeLossModal player={me} lossAmount={me.actionRequired.value} onClose={() => {}} />;
              case 'COVER_SPECIFIC_LOSS':
                return <CoverLossModal player={me} lossAmount={me.actionRequired.value} targetCategory={me.actionRequired.targetCategory} />;
              case 'ALLOCATE_BONUS':
                return <AllocateBonusModal playerId={me.id} bonusAmount={me.actionRequired.value} />;
              default:
                return null;
            }
          })()}
        </div>
      );
    }

    switch (gameState.gamePhase) {
      case GamePhase.ALLOCATION:
        // Show summary modal first if it exists
        if (me.lastRoundSummary && me.lastRoundSummary.length > 0) {
            return <RoundSummaryModal summary={me.lastRoundSummary} onClose={handleAcknowledgeSummary} isLoading={isLoading} />;
        }

        if (me.currentAllocation) {
          return <p>Waiting for other players to submit their allocation...</p>;
        }
        return (
          <form onSubmit={handleSubmit}>
             {me.eventDebtLog && me.eventDebtLog.length > 0 && (
                <div style={{color: '#fca5a5', marginBottom: '1rem', border: '1px solid #fca5a5', padding: '0.5rem', borderRadius: '8px'}}>
                    {me.eventDebtLog.map((log, i) => <p key={i} style={{margin:0, fontSize: '0.9rem'}}>{log}</p>)}
                </div>
            )}
            <p>Allocate your <strong>{allocationBudget}</strong> coins for this round.</p>
            {/* ... allocation rows ... */}
            <div className='allocation-row'>
                <div className='label-group'>
                    <label>🏠 Food / Housing</label>
                    <p className='category-description'>Cost is 5. Underpayment creates debt. Overpayment will be credited.</p>
                </div>
                <input style={{width: '70px'}} type="number" value={allocation.food} onChange={e => handleAllocationChange('food', e.target.value)} step="1" />
            </div>
            {/* Other rows... */}
            <div className='allocation-row'>
                <div className='label-group'>
                    <label>📈 Short-term Investment</label>
                    <p className='category-description'>3 coins = +1 income</p>
                </div>
                <div style={{flexGrow: 1, textAlign: 'right', marginRight: '1rem', opacity: 0.8}}>Total: {me.categoryTotals.short}</div>
                <input style={{width: '70px'}} type="number" value={allocation.short} onChange={e => handleAllocationChange('short', e.target.value)} step="1" />
            </div>
            <div className='allocation-row'>
                <div className='label-group'>
                    <label>🌳 Long-term Investment</label>
                    <p className='category-description'>4 coins = +1 income, plus bonus</p>
                </div>
                <div style={{flexGrow: 1, textAlign: 'right', marginRight: '1rem', opacity: 0.8}}>Total: {me.categoryTotals.long}</div>
                <input style={{width: '70px'}} type="number" value={allocation.long} onChange={e => handleAllocationChange('long', e.target.value)} step="1" />
            </div>
            <div className='allocation-row'>
                <div className='label-group'>
                    <label>🛡️ Emergency Fund</label>
                     <p className='category-description'>Covers deficits and events</p>
                </div>
                <div style={{flexGrow: 1, textAlign: 'right', marginRight: '1rem', opacity: 0.8}}>Total: {me.categoryTotals.emergency}</div>
                <input style={{width: '70px'}} type="number" value={allocation.emergency} onChange={e => handleAllocationChange('emergency', e.target.value)} step="1" />
            </div>
            <p style={{marginTop: '1.5rem'}}>Total Allocated: {totalAllocated} / {allocationBudget}</p>
            <button type="submit" disabled={isLoading || totalAllocated !== allocationBudget}>Submit</button>
            {error && <p className="error">{error}</p>}
          </form>
        );
      // ... other cases
      case GamePhase.EVENT_RESOLUTION:
        return <p>Waiting for players to resolve the event...</p>;
      case GamePhase.EVENT_DRAWN:
        return (
          <div>
            <EventCardView event={gameState.currentEvent!} />
            <p style={{marginTop: '1.5rem'}}>Event resolved. Waiting for GM.</p>
          </div>
        );
      case GamePhase.ROUND_END:
        return <p>Round {gameState.currentRound} ended. Waiting for next round.</p>;
      default:
        return <p>Please wait...</p>;
    }
  };

  return (
    <div>
      <div style={{textAlign: 'left', marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px'}}>
        <p style={{margin: 0}}><strong>{me.name}</strong></p>
        <p style={{margin: 0}}>Total Coins: {Math.floor(me.totalCoins)}</p>
        {me.foodDebt > 0 && <p style={{margin: 0, color: '#fca5a5'}}>Food Debt: {me.foodDebt}</p>}
        {me.foodDebt < 0 && <p style={{margin: 0, color: '#48bb78'}}>Food Pre-payment: {-me.foodDebt}</p>}
        <p style={{margin: 0}}>Income for next round: {me.income}</p>
      </div>
      <h2>Round {gameState.currentRound}</h2>
      {renderContent()}
    </div>
  );
};

export default PlayerView;

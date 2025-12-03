// components/SinglePlayerGame.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GameState, GamePhase, Player, PlayerAllocation, EventEffect } from '../lib/types';
import { drawEventCard } from '../lib/gameLogic';
import { calculateRound, MAX_ROUNDS } from '../lib/roundCalculator';
import RoundSummaryModal from './RoundSummaryModal';
import EventCardView from './EventCardView';
import SinglePlayerDistributeLossModal from './SinglePlayerDistributeLossModal';
import SinglePlayerCoverLossModal from './SinglePlayerCoverLossModal';
import SinglePlayerAllocateBonusModal from './SinglePlayerAllocateBonusModal';
import Leaderboard from './Leaderboard';

const SinglePlayerGame: React.FC = () => {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [allocation, setAllocation] = useState<PlayerAllocation>({
    food: 0,
    short: 0,
    long: 0,
    emergency: 0,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAcknowledgedEvent, setHasAcknowledgedEvent] = useState(false);

  const player = gameState?.players['player1'];
  const allocationBudget = player?.income ?? 0;
  const totalAllocated = Object.values(allocation).reduce((sum, val) => sum + val, 0);

  useEffect(() => {
    if (gameState?.gamePhase === GamePhase.ALLOCATION && player?.currentAllocation === null) {
      setAllocation({ food: 0, short: 0, long: 0, emergency: 0 });
      setError('');
    }
  }, [gameState?.gamePhase, player?.currentAllocation]);

  const initializeOrResetGame = () => {
    const initialPlayer: Player = {
      id: 'player1',
      name: 'Player 1',
      totalCoins: 0,
      income: 10,
      foodDebt: 0,
      eventDebt: 0,
      eventDebtLog: [],
      categoryTotals: { short: 0, long: 0, emergency: 0 },
      currentAllocation: null,
      actionRequired: null,
      allocationChanges: null,
      hasConfirmed: false,
      lastUpdate: Date.now(),
      foodCostWaived: false,
      lastRoundSummary: null,
      coinsToAllocate: 0,
    };

    const initialGameState: GameState = {
      gamePhase: GamePhase.ROUND_START,
      currentRound: 1,
      players: { player1: initialPlayer },
      gm: { isLoggedIn: false },
      currentEvent: null,
      lastModified: Date.now(),
      leaderboard: [],
    };

    setGameState(initialGameState);
  };

  const handleReset = () => {
    if (window.confirm(t('singlePlayerGame.resetConfirm'))) {
      initializeOrResetGame();
    }
  };

  const handleAllocationChange = (category: keyof PlayerAllocation, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;
    setAllocation((prev) => ({ ...prev, [category]: numValue }));
  };

  const handleAllocationStepChange = (category: keyof PlayerAllocation, step: number) => {
    setAllocation((prev) => {
      const newValue = Math.max(0, prev[category] + step);
      return { ...prev, [category]: newValue };
    });
  };

  const handleAcknowledgeSummary = () => {
    if (!gameState || !player) return;
    const newPlayer = { ...player, lastRoundSummary: null };
    const newPlayers = { ...gameState.players, [player.id]: newPlayer };
    setGameState({ ...gameState, players: newPlayers });
  };
  
  const handleDistributeLoss = (distribution: { short: number; long: number; emergency: number }) => {
    if (!gameState || !player) return;

    const newPlayer = { ...player };
    newPlayer.categoryTotals.short -= distribution.short;
    newPlayer.categoryTotals.long -= distribution.long;
    newPlayer.categoryTotals.emergency -= distribution.emergency;
    newPlayer.actionRequired = null;

    setGameState({ ...gameState, players: { ...gameState.players, [player.id]: newPlayer }, gamePhase: GamePhase.EVENT_RESOLUTION });
  };

  const handleCoverLoss = (coverage: { fromTarget: number; fromEmergency: number }) => {
    if (!gameState || !player || !player.actionRequired || player.actionRequired.type !== 'COVER_SPECIFIC_LOSS') return;

    const newPlayer = { ...player };
    const targetCategory = player.actionRequired.targetCategory;

    newPlayer.categoryTotals[targetCategory] -= coverage.fromTarget;
    newPlayer.categoryTotals.emergency -= coverage.fromEmergency;
    newPlayer.actionRequired = null;
    
    setGameState({ ...gameState, players: { ...gameState.players, [player.id]: newPlayer }, gamePhase: GamePhase.EVENT_RESOLUTION });
  };

  const handleAllocateBonus = (distribution: { short: number; long: number; emergency: number }) => {
    if (!gameState || !player) return;

    const newPlayer = { ...player };
    newPlayer.categoryTotals.short += distribution.short;
    newPlayer.categoryTotals.long += distribution.long;
    newPlayer.categoryTotals.emergency += distribution.emergency;
    newPlayer.actionRequired = null;

    setGameState({ ...gameState, players: { ...gameState.players, [player.id]: newPlayer }, gamePhase: GamePhase.EVENT_RESOLUTION });
  };


  const handleNextPhase = () => {
    if (!gameState || !player) return;

    let newGameState = { ...gameState };

    switch (newGameState.gamePhase) {
      case GamePhase.ROUND_START:
        // Add income from the previous round to total coins at the start of the new round
        const playerWithIncome = { ...player };
        playerWithIncome.totalCoins += playerWithIncome.income;
        newGameState.players['player1'] = playerWithIncome;
        newGameState.gamePhase = GamePhase.ALLOCATION;
        break;
      case GamePhase.ALLOCATION:
        if (totalAllocated !== allocationBudget) {
          setError(t('playerView.allocationSumError', { allocationBudget }));
          return;
        }
        setError('');
        const newPlayer = { ...player, currentAllocation: allocation };
        newGameState.players = { ...newGameState.players, [player.id]: newPlayer };
        const event = drawEventCard();
        newGameState.currentEvent = event;
        setHasAcknowledgedEvent(false); // Reset to ensure event card is shown first
        
        const effect = event.effect;
        if(effect.type === 'COIN_CHANGE' && effect.isPlayerChoice) {
            newGameState.players['player1'].actionRequired = { type: 'DISTRIBUTE_LOSS', value: Math.abs(effect.value) };
        } else if (effect.type === 'COIN_CHANGE' && effect.isCoverable) {
            newGameState.players['player1'].actionRequired = { type: 'COVER_SPECIFIC_LOSS', value: Math.abs(effect.value), targetCategory: effect.category as 'short' | 'long' };
        } else if (effect.type === 'COIN_CHANGE' && effect.value > 0) {
            newGameState.players['player1'].actionRequired = { type: 'ALLOCATE_BONUS', value: effect.value };
        }

        if(newGameState.players['player1'].actionRequired) {
            newGameState.gamePhase = GamePhase.EVENT_RESOLUTION;
        } else {
            newGameState.gamePhase = GamePhase.EVENT_DRAWN;
        }
        break;
      case GamePhase.EVENT_RESOLUTION:
      case GamePhase.EVENT_DRAWN:
        newGameState = calculateRound(newGameState);
        break;
      case GamePhase.ROUND_END:
        newGameState.gamePhase = GamePhase.ROUND_START;
        newGameState.currentRound += 1;
        
        const nextRoundPlayer = { ...newGameState.players['player1'] };
        nextRoundPlayer.currentAllocation = null;

        newGameState.players['player1'] = nextRoundPlayer;
        break;
      case GamePhase.GAME_OVER:
        setGameState(null);
        setAllocation({ food: 0, short: 0, long: 0, emergency: 0 });
        setHasAcknowledgedEvent(false);
        return;
    }

    setGameState(newGameState);
  };

  const renderContent = () => {
    if (!gameState || !player) return null;

    if (gameState.gamePhase === GamePhase.GAME_OVER) {
        return <Leaderboard gameState={gameState} role={'single-player'} />;
    }

    if (player.actionRequired) {
        if (!hasAcknowledgedEvent) {
            return (
              <div>
                <EventCardView event={gameState.currentEvent!} />
                <button onClick={() => setHasAcknowledgedEvent(true)} style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem' }}>
                  {t('playerView.continueButton')}
                </button>
              </div>
            );
          }

        switch (player.actionRequired.type) {
            case 'DISTRIBUTE_LOSS':
              return <SinglePlayerDistributeLossModal player={player} lossAmount={player.actionRequired.value} onSubmit={handleDistributeLoss} />;
            case 'COVER_SPECIFIC_LOSS':
              return <SinglePlayerCoverLossModal player={player} lossAmount={player.actionRequired.value} targetCategory={player.actionRequired.targetCategory} onSubmit={handleCoverLoss} />;
            case 'ALLOCATE_BONUS':
              return <SinglePlayerAllocateBonusModal bonusAmount={player.actionRequired.value} onSubmit={handleAllocateBonus} />;
            default:
              return null;
        }
    }

    switch (gameState.gamePhase) {
      case GamePhase.ALLOCATION:
        if (player.lastRoundSummary && player.lastRoundSummary.length > 0) {
          return <RoundSummaryModal summary={player.lastRoundSummary} onClose={handleAcknowledgeSummary} isLoading={false} />;
        }

        return (
          <form onSubmit={(e) => { e.preventDefault(); handleNextPhase(); }}>
            <p>{t('playerView.allocateCoinsMessage', { allocationBudget })}</p>
            <div style={{ marginBottom: '1rem' }}>
              <div className='allocation-row'>
                  <div className='label-group'>
                      <label>{t('playerView.foodHousingLabel')}</label>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <button type="button" onClick={() => handleAllocationStepChange('food', -1)} style={{width: '30px', height: '30px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>-</button>
                    <input style={{width: '70px', margin: '0 5px'}} type="number" value={allocation.food} onChange={e => handleAllocationChange('food', e.target.value)} step="1" />
                    <button type="button" onClick={() => handleAllocationStepChange('food', 1)} style={{width: '30px', height: '30px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>+</button>
                  </div>
              </div>
              <p className='category-description'>{t('playerView.foodHousingDescription')}</p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div className='allocation-row'>
                  <div className='label-group'>
                      <label>{t('playerView.shortTermInvestmentLabel')}</label>
                  </div>
                  <div style={{flexGrow: 1, textAlign: 'right', marginRight: '1rem', opacity: 0.8, whiteSpace: 'nowrap'}}>Total: {player.categoryTotals.short}</div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <button type="button" onClick={() => handleAllocationStepChange('short', -1)} style={{width: '30px', height: '30px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>-</button>
                    <input style={{width: '70px', margin: '0 5px'}} type="number" value={allocation.short} onChange={e => handleAllocationChange('short', e.target.value)} step="1" />
                    <button type="button" onClick={() => handleAllocationStepChange('short', 1)} style={{width: '30px', height: '30px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>+</button>
                  </div>
              </div>
              <p className='category-description'>{t('playerView.shortTermInvestmentDescription')}</p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div className='allocation-row'>
                  <div className='label-group'>
                      <label>{t('playerView.longTermInvestmentLabel')}</label>
                  </div>
                  <div style={{flexGrow: 1, textAlign: 'right', marginRight: '1rem', opacity: 0.8, whiteSpace: 'nowrap'}}>Total: {player.categoryTotals.long}</div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <button type="button" onClick={() => handleAllocationStepChange('long', -1)} style={{width: '30px', height: '30px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>-</button>
                    <input style={{width: '70px', margin: '0 5px'}} type="number" value={allocation.long} onChange={e => handleAllocationChange('long', e.target.value)} step="1" />
                    <button type="button" onClick={() => handleAllocationStepChange('long', 1)} style={{width: '30px', height: '30px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>+</button>
                  </div>
              </div>
              <p className='category-description'>{t('playerView.longTermInvestmentDescription')}</p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div className='allocation-row'>
                  <div className='label-group'>
                      <label>{t('playerView.emergencyFundLabel')}</label>
                  </div>
                  <div style={{flexGrow: 1, textAlign: 'right', marginRight: '1rem', opacity: 0.8, whiteSpace: 'nowrap'}}>Total: {player.categoryTotals.emergency}</div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <button type="button" onClick={() => handleAllocationStepChange('emergency', -1)} style={{width: '30px', height: '30px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>-</button>
                    <input style={{width: '70px', margin: '0 5px'}} type="number" value={allocation.emergency} onChange={e => handleAllocationChange('emergency', e.target.value)} step="1" />
                    <button type="button" onClick={() => handleAllocationStepChange('emergency', 1)} style={{width: '30px', height: '30px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>+</button>
                  </div>
              </div>
              <p className='category-description'>{t('playerView.emergencyFundDescription')}</p>
            </div>
            <p style={{marginTop: '1.5rem'}}>{t('playerView.totalAllocated', { totalAllocated, allocationBudget })}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min((totalAllocated / allocationBudget) * 100, 100)}%` }}></div>
            </div>
            <button type="submit" disabled={isLoading || totalAllocated !== allocationBudget}>{t('playerView.submitButton')}</button>
            {error && <p className="error">{error}</p>}
          </form>
        );
      case GamePhase.EVENT_DRAWN:
        return (
          <div>
            <EventCardView event={gameState.currentEvent!} />
            <button onClick={handleNextPhase}>{t('singlePlayerGame.nextPhaseButton')}</button>
          </div>
        );
      case GamePhase.ROUND_END:
        if (player.lastRoundSummary) {
          return (
            <div>
              <h4>{t('singlePlayerGame.roundSummary')}</h4>
              <ul>
                {player.lastRoundSummary.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
              <button onClick={handleNextPhase}>{t('singlePlayerGame.nextPhaseButton')}</button>
            </div>
          );
        }
        return null;
      default:
        return <button onClick={handleNextPhase}>{t('singlePlayerGame.nextPhaseButton')}</button>;
    }
  };

  return (
    <div>
      {!gameState || !player ? (
        <>
          <h2>{t('singlePlayerGame.singlePlayerModeTitle')}</h2>
          <button onClick={initializeOrResetGame}>{t('singlePlayerGame.startButton')}</button>
        </>
      ) : (
        <div>
          <button onClick={handleReset} className="secondary" style={{ position: 'absolute', top: '7rem', right: '1rem' }}>{t('singlePlayerGame.resetButton')}</button>
          <div style={{textAlign: 'left', marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px'}}>
            <p style={{margin: 0}}><strong>{t('playerView.playerStatusName', { name: player.name })}</strong></p>
            <p style={{margin: 0}}>{t('playerView.playerStatusTotalCoins', { totalCoins: Math.floor(player.totalCoins) })}</p>
            {player.foodDebt > 0 && <p style={{margin: 0, color: '#fca5a5'}}>{t('playerView.playerStatusFoodDebt', { foodDebt: player.foodDebt })}</p>}
            {player.foodDebt < 0 && <p style={{margin: 0, color: '#48bb78'}}>{t('playerView.playerStatusFoodPrePayment', { foodPrepayment: -player.foodDebt })}</p>}
            <p style={{margin: 0}}>{t('playerView.playerStatusIncomeNextRound', { income: player.income })}</p>
          </div>
          <h2>{t('playerView.roundTitle', { currentRound: gameState.currentRound })}</h2>
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default SinglePlayerGame;



// components/CoverLossModal.tsx
import React, { useState } from 'react';
import { Player } from '../lib/types';
import styles from './Modal.module.css';

interface CoverLossModalProps {
  player: Player;
  lossAmount: number;
  targetCategory: 'short' | 'long';
}

const CoverLossModal: React.FC<CoverLossModalProps> = ({ player, lossAmount, targetCategory }) => {
  const [fromTarget, setFromTarget] = useState(0);
  const [fromEmergency, setFromEmergency] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const totalCovered = fromTarget + fromEmergency;
  const remainingToCover = lossAmount - totalCovered;

  const maxFromTarget = player.categoryTotals[targetCategory];
  const maxFromEmergency = player.categoryTotals.emergency;

  const handleTargetChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num < 0) return;
    if (num > maxFromTarget) {
      setError(`You only have ${maxFromTarget} in ${targetCategory}.`);
      return;
    }
    setError('');
    setFromTarget(num);
  };

  const handleEmergencyChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num < 0) return;
    if (num > maxFromEmergency) {
      setError(`You only have ${maxFromEmergency} in emergency.`);
      return;
    }
    setError('');
    setFromEmergency(num);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/player/cover-loss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            playerId: player.id, 
            lossCoverage: { 
                fromTarget,
                fromEmergency,
                targetCategory,
            }
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Action Required!</h3>
        <p>You have a loss of <strong>{lossAmount}</strong> coins from your {targetCategory} investment.</p>
        <p>Pay what you can using the target category and/or your Emergency Fund.</p>
        
        <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
                <label>From {targetCategory} ({maxFromTarget} available)</label>
                <input type="number" value={fromTarget} onChange={e => handleTargetChange(e.target.value)} min="0" max={lossAmount} />
                
                <label>From Emergency Fund ({maxFromEmergency} available)</label>
                <input type="number" value={fromEmergency} onChange={e => handleEmergencyChange(e.target.value)} min="0" max={lossAmount} />
            </div>

            <p className={styles.remaining}>
                Amount to pay: {totalCovered} / {lossAmount}
            </p>
            
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Confirm Payment'}
            </button>
            {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CoverLossModal;

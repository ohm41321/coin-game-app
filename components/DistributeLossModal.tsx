// components/DistributeLossModal.tsx
import React, { useState } from 'react';
import { Player, PlayerAllocation } from '../lib/types';
import styles from './Modal.module.css';

interface DistributeLossModalProps {
  player: Player;
  lossAmount: number;
  onSubmit: (distribution: { short: number; long: number; emergency: number }) => void;
}

const DistributeLossModal: React.FC<DistributeLossModalProps> = ({ player, lossAmount, onSubmit }) => {
  const [distribution, setDistribution] = useState({ short: 0, long: 0, emergency: 0 });

  const totalDistributed = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  const remainingToDistribute = lossAmount - totalDistributed;

  const handleDistributionChange = (category: keyof typeof distribution, value: string) => {
    const maxAllowed = player.categoryTotals[category] ?? 0;
    const numValue = value === '' ? 0 : parseInt(value, 10);
    
    if (numValue < 0) return;
    if (numValue > maxAllowed) {
        setDistribution(prev => ({ ...prev, [category]: maxAllowed }));
        return;
    }
    setDistribution(prev => ({ ...prev, [category]: numValue }));
  };

  const handleStepChange = (category: keyof typeof distribution, step: number) => {
    const maxAllowed = player.categoryTotals[category] ?? 0;
    setDistribution(prev => {
        const currentValue = prev[category];
        const newValue = Math.max(0, currentValue + step);
        return { ...prev, [category]: Math.min(newValue, maxAllowed) };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(distribution);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Action Required!</h3>
        <p>You must distribute a loss of <strong>{lossAmount}</strong> coins. Pay what you can from your available allocations.</p>
        <p>Food/Housing cannot be used.</p>
        
        <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
                <label>Short-term ({player.categoryTotals.short} available)</label>
                <div className={styles.inputGroup}>
                    <button type="button" onClick={() => handleStepChange('short', -1)}>-</button>
                    <input type="number" value={distribution.short} onChange={e => handleDistributionChange('short', e.target.value)} min="0" max={player.categoryTotals.short} />
                    <button type="button" onClick={() => handleStepChange('short', 1)}>+</button>
                </div>

                <label>Long-term ({player.categoryTotals.long} available)</label>
                <div className={styles.inputGroup}>
                    <button type="button" onClick={() => handleStepChange('long', -1)}>-</button>
                    <input type="number" value={distribution.long} onChange={e => handleDistributionChange('long', e.target.value)} min="0" max={player.categoryTotals.long} />
                    <button type="button" onClick={() => handleStepChange('long', 1)}>+</button>
                </div>

                <label>Emergency ({player.categoryTotals.emergency} available)</label>
                <div className={styles.inputGroup}>
                    <button type="button" onClick={() => handleStepChange('emergency', -1)}>-</button>
                    <input type="number" value={distribution.emergency} onChange={e => handleDistributionChange('emergency', e.target.value)} min="0" max={player.categoryTotals.emergency} />
                    <button type="button" onClick={() => handleStepChange('emergency', 1)}>+</button>
                </div>
            </div>
            <p className={styles.remaining}>
                Amount to pay: {totalDistributed} / {lossAmount}
            </p>
            
            <button type="submit">
                Submit Payment
            </button>
        </form>
      </div>
    </div>
  );
};

export default DistributeLossModal;

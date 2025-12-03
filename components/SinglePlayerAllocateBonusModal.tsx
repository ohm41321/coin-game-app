// components/SinglePlayerAllocateBonusModal.tsx
import React, { useState } from 'react';
import styles from './Modal.module.css';

interface SinglePlayerAllocateBonusModalProps {
  bonusAmount: number;
  onSubmit: (distribution: { short: number; long: number; emergency: number }) => void;
}

const SinglePlayerAllocateBonusModal: React.FC<SinglePlayerAllocateBonusModalProps> = ({ bonusAmount, onSubmit }) => {
  const [distribution, setDistribution] = useState({ short: 0, long: 0, emergency: 0 });
  const [error, setError] = useState('');

  const totalDistributed = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  const remainingToDistribute = bonusAmount - totalDistributed;

  const handleDistributionChange = (category: keyof typeof distribution, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (numValue < 0) return;
    setDistribution(prev => ({ ...prev, [category]: numValue }));
  };

  const handleStepChange = (category: keyof typeof distribution, step: number) => {
    setDistribution(prev => {
        const newValue = Math.max(0, prev[category] + step);
        return { ...prev, [category]: newValue };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingToDistribute !== 0) {
      setError(`You must allocate exactly ${bonusAmount} coins.`);
      return;
    }
    setError('');
    onSubmit(distribution);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>You got a bonus!</h3>
        <p>You received <strong>{bonusAmount}</strong> bonus coins. Where do you want to put them?</p>
        
        <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
                <label>📈 Short-term Investment</label>
                <div className={styles.inputGroup}>
                  <button type="button" onClick={() => handleStepChange('short', -1)}>-</button>
                  <input type="number" value={distribution.short} onChange={e => handleDistributionChange('short', e.target.value)} min="0" />
                  <button type="button" onClick={() => handleStepChange('short', 1)}>+</button>
                </div>
                
                <label>🌳 Long-term Investment</label>
                <div className={styles.inputGroup}>
                  <button type="button" onClick={() => handleStepChange('long', -1)}>-</button>
                  <input type="number" value={distribution.long} onChange={e => handleDistributionChange('long', e.target.value)} min="0" />
                  <button type="button" onClick={() => handleStepChange('long', 1)}>+</button>
                </div>

                <label>🛡️ Emergency Fund</label>
                <div className={styles.inputGroup}>
                  <button type="button" onClick={() => handleStepChange('emergency', -1)}>-</button>
                  <input type="number" value={distribution.emergency} onChange={e => handleDistributionChange('emergency', e.target.value)} min="0" />
                  <button type="button" onClick={() => handleStepChange('emergency', 1)}>+</button>
                </div>
            </div>

            <p className={remainingToDistribute !== 0 ? styles.remainingError : styles.remaining}>
                Remaining to allocate: {remainingToDistribute}
            </p>
            
            <button type="submit" disabled={remainingToDistribute !== 0}>
                Confirm Allocation
            </button>
            {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default SinglePlayerAllocateBonusModal;
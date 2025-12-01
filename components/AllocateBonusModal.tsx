// components/AllocateBonusModal.tsx
import React, { useState } from 'react';
import { Player } from '../lib/types';
import styles from './Modal.module.css';

interface AllocateBonusModalProps {
  playerId: string;
  bonusAmount: number;
}

const AllocateBonusModal: React.FC<AllocateBonusModalProps> = ({ playerId, bonusAmount }) => {
  const [distribution, setDistribution] = useState({ short: 0, long: 0, emergency: 0 });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const totalDistributed = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  const remainingToDistribute = bonusAmount - totalDistributed;

  const handleDistributionChange = (category: keyof typeof distribution, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0) return;
    setDistribution(prev => ({ ...prev, [category]: numValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingToDistribute !== 0) {
      setError(`You must allocate exactly ${bonusAmount} coins.`);
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/player/allocate-bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, bonusAllocation: distribution }),
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
        <h3>You got a bonus!</h3>
        <p>You received <strong>{bonusAmount}</strong> bonus coins. Where do you want to put them?</p>
        
        <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
                <label>📈 Short-term Investment</label>
                <input type="number" value={distribution.short} onChange={e => handleDistributionChange('short', e.target.value)} min="0" />
                
                <label>🌳 Long-term Investment</label>
                <input type="number" value={distribution.long} onChange={e => handleDistributionChange('long', e.target.value)} min="0" />

                <label>🛡️ Emergency Fund</label>
                <input type="number" value={distribution.emergency} onChange={e => handleDistributionChange('emergency', e.target.value)} min="0" />
            </div>

            <p className={remainingToDistribute !== 0 ? styles.remainingError : styles.remaining}>
                Remaining to allocate: {remainingToDistribute}
            </p>
            
            <button type="submit" disabled={isLoading || remainingToDistribute !== 0}>
                {isLoading ? 'Submitting...' : 'Confirm Allocation'}
            </button>
            {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default AllocateBonusModal;

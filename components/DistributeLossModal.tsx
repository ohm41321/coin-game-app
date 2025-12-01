// components/DistributeLossModal.tsx
import React, { useState } from 'react';
import { Player, PlayerAllocation } from '../lib/types';
import styles from './Modal.module.css';

interface DistributeLossModalProps {
  player: Player;
  lossAmount: number;
  onClose: () => void; // Allow closing if needed, though we might not
}

const DistributeLossModal: React.FC<DistributeLossModalProps> = ({ player, lossAmount, onClose }) => {
  const [distribution, setDistribution] = useState({ short: 0, long: 0, emergency: 0 });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const totalDistributed = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  const remainingToDistribute = lossAmount - totalDistributed;

  const handleDistributionChange = (category: keyof typeof distribution, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0) return;
    
    // Prevent distributing more than is available in the category
    const maxAllowed = player.categoryTotals[category] ?? 0;
    if (numValue > maxAllowed) {
        setError(`You only have ${maxAllowed} in ${category}.`);
        return;
    }
    setError('');
    setDistribution(prev => ({ ...prev, [category]: numValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/player/resolve-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, lossDistribution: { ...distribution, food: 0 } }), // Ensure food is always 0
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit.');
      // On success, polling will update the UI, and this modal will disappear.
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
        <p>You must distribute a loss of <strong>{lossAmount}</strong> coins. Pay what you can from your available allocations.</p>
        <p>Food/Housing cannot be used.</p>
        
        <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
                <label>Short-term ({player.categoryTotals.short} available)</label>
                <input type="number" value={distribution.short} onChange={e => handleDistributionChange('short', e.target.value)} min="0" max={player.categoryTotals.short} />

                <label>Long-term ({player.categoryTotals.long} available)</label>
                <input type="number" value={distribution.long} onChange={e => handleDistributionChange('long', e.target.value)} min="0" max={player.categoryTotals.long} />

                <label>Emergency ({player.categoryTotals.emergency} available)</label>
                <input type="number" value={distribution.emergency} onChange={e => handleDistributionChange('emergency', e.target.value)} min="0" max={player.categoryTotals.emergency} />
            </div>
            <p className={styles.remaining}>
                Amount to pay: {totalDistributed} / {lossAmount}
            </p>
            
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Payment'}
            </button> <br />
            {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default DistributeLossModal;

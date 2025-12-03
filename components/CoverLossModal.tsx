// components/CoverLossModal.tsx
import React, { useState } from 'react';
import { Player } from '../lib/types';
import styles from './Modal.module.css';

interface CoverLossModalProps {
  player: Player;
  lossAmount: number;
  targetCategory: 'short' | 'long';
  onSubmit: (coverage: { fromTarget: number; fromEmergency: number }) => void;
}

const CoverLossModal: React.FC<CoverLossModalProps> = ({ player, lossAmount, targetCategory, onSubmit }) => {
  const [fromTarget, setFromTarget] = useState(0);
  const [fromEmergency, setFromEmergency] = useState(0);

  const totalCovered = fromTarget + fromEmergency;
  
  const maxFromTarget = player.categoryTotals[targetCategory];
  const maxFromEmergency = player.categoryTotals.emergency;

  const handleTargetChange = (value: string) => {
    const num = value === '' ? 0 : parseInt(value, 10);
    if (num < 0) return;
    if (num > maxFromTarget) {
      setFromTarget(maxFromTarget);
      return;
    }
    setFromTarget(num);
  };
  
  const handleEmergencyChange = (value: string) => {
    const num = value === '' ? 0 : parseInt(value, 10);
    if (num < 0) return;
    if (num > maxFromEmergency) {
      setFromEmergency(maxFromEmergency);
      return;
    }
    setFromEmergency(num);
  };

  const handleTargetStepChange = (step: number) => {
    setFromTarget(prev => {
      const newValue = Math.max(0, prev + step);
      return Math.min(newValue, maxFromTarget);
    });
  };

  const handleEmergencyStepChange = (step: number) => {
    setFromEmergency(prev => {
      const newValue = Math.max(0, prev + step);
      return Math.min(newValue, maxFromEmergency);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ fromTarget, fromEmergency });
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
                <div className={styles.inputGroup}>
                  <button type="button" onClick={() => handleTargetStepChange(-1)}>-</button>
                  <input type="number" value={fromTarget} onChange={e => handleTargetChange(e.target.value)} min="0" max={maxFromTarget} />
                  <button type="button" onClick={() => handleTargetStepChange(1)}>+</button>
                </div>
                
                <label>From Emergency Fund ({maxFromEmergency} available)</label>
                <div className={styles.inputGroup}>
                  <button type="button" onClick={() => handleEmergencyStepChange(-1)}>-</button>
                  <input type="number" value={fromEmergency} onChange={e => handleEmergencyChange(e.target.value)} min="0" max={maxFromEmergency} />
                  <button type="button" onClick={() => handleEmergencyStepChange(1)}>+</button>
                </div>
            </div>

            <p className={styles.remaining}>
                Amount to pay: {totalCovered} / {lossAmount}
            </p>
            
            <button type="submit">
                Confirm Payment
            </button>
        </form>
      </div>
    </div>
  );
};

export default CoverLossModal;

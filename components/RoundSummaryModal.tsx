// components/RoundSummaryModal.tsx
import React from 'react';
import styles from './Modal.module.css';

interface RoundSummaryModalProps {
  summary: string[];
  onClose: () => void;
  isLoading: boolean;
}

const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({ summary, onClose, isLoading }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ maxWidth: '600px' }}>
        <h3>End of Round Summary</h3>
        <ul style={{ textAlign: 'left', paddingLeft: '1.5rem', lineHeight: '1.6' }}>
          {summary.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <button onClick={onClose} disabled={isLoading} style={{ marginTop: '1rem', width: '100%' }}>
          {isLoading ? 'Please wait...' : 'Start Next Round'}
        </button>
      </div>
    </div>
  );
};

export default RoundSummaryModal;

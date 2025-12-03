// components/HowToPlayModal.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Modal.module.css';

interface HowToPlayModalProps {
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ textAlign: 'left' }}>
        <button className={styles['close-button']} onClick={onClose}>
          &times;
        </button>
        <h2>{t('howToPlay.title')}</h2>
        
        <h3 style={{ padding: '0 1rem' }}>{t('howToPlay.objective')}</h3>
        <p style={{ padding: '0 1rem' }}>{t('howToPlay.objectiveText')}</p>

        <h3 style={{ padding: '0 1rem' }}>{t('howToPlay.gameplay')}</h3>
        <ul style={{ padding: '0 1rem', listStylePosition: 'inside' }}>
          <li style={{ marginBottom: '0.5rem' }}>{t('howToPlay.round')}</li>
          <li style={{ marginBottom: '0.5rem' }}>{t('howToPlay.allocation')}</li>
          <li style={{ marginBottom: '0.5rem' }}>{t('howToPlay.events')}</li>
          <li style={{ marginBottom: '0.5rem' }}>{t('howToPlay.investments')}</li>
          <li style={{ marginBottom: '0.5rem' }}>{t('howToPlay.longTermBonus')}</li>
        </ul>

        <h3 style={{ padding: '0 1rem' }}>{t('howToPlay.winning')}</h3>
        <p style={{ padding: '0 1rem' }}>{t('howToPlay.winningText')}</p>
      </div>
    </div>
  );
};

export default HowToPlayModal;

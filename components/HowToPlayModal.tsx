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
      <div className={styles.modal} style={{ textAlign: 'left', maxWidth: '600px' }}>
        <h2>{t('howToPlay.title')}</h2>
        
        <h3>{t('howToPlay.objective')}</h3>
        <p>{t('howToPlay.objectiveText')}</p>

        <h3>{t('howToPlay.gameplay')}</h3>
        <ul>
          <li>{t('howToPlay.round')}</li>
          <li>{t('howToPlay.allocation')}</li>
          <li>{t('howToPlay.events')}</li>
          <li>{t('howToPlay.investments')}</li>
          <li>{t('howToPlay.longTermBonus')}</li>
        </ul>

        <h3>{t('howToPlay.winning')}</h3>
        <p>{t('howToPlay.winningText')}</p>

        <button onClick={onClose} style={{ marginTop: '1.5rem', width: '100%' }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default HowToPlayModal;

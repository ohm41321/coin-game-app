// components/RoleSelector.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

interface RoleSelectorProps {
  onSelectRole: (role: 'player' | 'gm') => void;
  onPlayGame: () => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole, onPlayGame }) => {
  const { t } = useTranslation();

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div className="coin-fall">
        <div>🪙</div>
        <div>🪙</div>
        <div>🪙</div>
      </div>

      <button 
        onClick={onPlayGame}
        style={{
            position: 'absolute',
            top: '-100px', // Adjust as needed
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'none',
            border: 'none',
            fontSize: '4rem',
            cursor: 'pointer',
            padding: '1rem',
            lineHeight: '1',
            transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
      >
        🪙
      </button>

      <h2>{t('roleSelector.title')}</h2>
      <p>{t('roleSelector.description')}</p>
      <div>
        <button onClick={() => onSelectRole('player')}>{t('roleSelector.playerButton')}</button>
        <button className="secondary" onClick={() => onSelectRole('gm')}>{t('roleSelector.gmButton')}</button>
      </div>
    </div>
  );
};

export default RoleSelector;

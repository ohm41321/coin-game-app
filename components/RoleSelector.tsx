// components/RoleSelector.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

interface RoleSelectorProps {
  onSelectRole: (role: 'player' | 'gm') => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  const { t } = useTranslation();

  return (
    <div>
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

// components/RoleSelector.tsx
import React from 'react';

interface RoleSelectorProps {
  onSelectRole: (role: 'player' | 'gm') => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div>
      <h2>Choose Your Role</h2>
      <p>Are you here to play or to run the game?</p>
      <div>
        <button onClick={() => onSelectRole('player')}>Join as Player</button>
        <button className="secondary" onClick={() => onSelectRole('gm')}>Login as Game Master</button>
      </div>
    </div>
  );
};

export default RoleSelector;

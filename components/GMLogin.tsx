import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface GMLoginProps {
  // onBack: () => void; // Removed as global back button handles this
}

const GMLogin: React.FC<GMLoginProps> = () => { // Removed { onBack } from destructuring
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/gm-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      // On success, the main page's polling will detect the state change
      // and automatically render the GM Dashboard.
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>{t('gmLogin.title')}</h2>
      <form onSubmit={handleLogin}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('gmLogin.passwordPlaceholder')}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? t('gmLogin.loggingInButton') : t('gmLogin.loginButton')}
        </button>
        {error && <p className="error">{error}</p>}

      </form>
    </div>
  );
};

export default GMLogin;

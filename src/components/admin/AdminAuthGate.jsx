import React, { useEffect, useState } from 'react';
import {
  ADMIN_PANEL_PASSWORD,
  getAdminLoggedIn,
  setAdminLoggedIn,
  clearAdminLoggedIn,
} from '../../utils/storage';

export default function AdminAuthGate({ children, onLogoutNavigate }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setIsAuthenticated(getAdminLoggedIn());
    setAuthChecked(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PANEL_PASSWORD) {
      setAdminLoggedIn();
      setIsAuthenticated(true);
      setError('');
      setPassword('');
    } else {
      setError('Yanlış parol. Yenidən cəhd edin.');
    }
  };

  const handleAdminLogout = () => {
    clearAdminLoggedIn();
    setIsAuthenticated(false);
    setPassword('');
    setError('');
    onLogoutNavigate?.();
  };

  if (!authChecked) {
    return (
      <div className="admin-auth-loading">
        <div className="admin-auth-spinner" aria-hidden="true" />
        <span>Admin paneli yoxlanılır...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-auth-gate">
        <div className="card admin-auth-card">
          <div className="admin-auth-icon">🛡️</div>
          <h2 className="admin-auth-title">Admin Paneli</h2>
          <p className="admin-auth-subtitle">
            Davam etmək üçün admin parolunu daxil edin.
          </p>

          <form onSubmit={handleSubmit} className="admin-auth-form">
            <div className="input-group">
              <label className="input-label" htmlFor="admin-password">
                Parol
              </label>
              <input
                id="admin-password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="auth-banner auth-banner-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Daxil Ol
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-session-bar">
        <span className="admin-session-label">🛡️ Admin sessiyası aktiv</span>
        <button
          type="button"
          className="btn btn-outline btn-sm admin-logout-btn"
          onClick={handleAdminLogout}
        >
          Çıxış
        </button>
      </div>
      {children}
    </>
  );
}

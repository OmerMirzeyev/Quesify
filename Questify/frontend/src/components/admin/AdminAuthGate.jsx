import React, { useEffect, useState } from 'react';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  getAdminLoggedIn,
  setAdminLoggedIn,
  clearAdminLoggedIn,
} from '../../utils/storage';

export default function AdminAuthGate({ children, onLogoutNavigate }) {
  // authChecked prevents showing the gate form before localStorage is read (SSR/hydration safety)
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Hydration-safe localStorage read ──────────────────────────────────────
  // Wrapped in useEffect so it never runs during SSR, preventing "window is not defined"
  // and React hydration mismatch errors.
  useEffect(() => {
    const alreadyLoggedIn = getAdminLoggedIn();
    setIsAuthenticated(alreadyLoggedIn);
    setAuthChecked(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (
      trimmedEmail === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      // Persist admin session in localStorage so page refreshes don't require re-login
      setAdminLoggedIn();
      setIsAuthenticated(true);
      setError('');
      setEmail('');
      setPassword('');
    } else {
      setError('Yanlış e-poçt və ya parol. Yenidən cəhd edin.');
    }
  };

  const handleAdminLogout = () => {
    // Clear the localStorage key so next visit shows the login gate
    clearAdminLoggedIn();
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setError('');
    onLogoutNavigate?.();
  };

  // ── Loading state (brief flash while useEffect reads localStorage) ─────────
  if (!authChecked) {
    return (
      <div className="admin-auth-loading">
        <div className="admin-auth-spinner" aria-hidden="true" />
        <span>Admin paneli yoxlanılır...</span>
      </div>
    );
  }

  // ── Login gate ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="admin-auth-gate">
        <div className="card admin-auth-card">
          <div className="admin-auth-icon">🛡️</div>
          <h2 className="admin-auth-title">Admin Paneli</h2>
          <p className="admin-auth-subtitle">
            Davam etmək üçün admin məlumatlarınızı daxil edin.
          </p>

          <form onSubmit={handleSubmit} className="admin-auth-form">
            {/* Email field */}
            <div className="input-group">
              <label className="input-label" htmlFor="admin-email">
                E-poçt ünvanı
              </label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  id="admin-email"
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="admin@gmail.com"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="input-group">
              <label className="input-label" htmlFor="admin-password">
                Parol
              </label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <span className="input-icon">🔐</span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: 'var(--text-muted)',
                    padding: 0,
                    lineHeight: 1,
                  }}
                  aria-label={showPassword ? 'Parolu gizlət' : 'Parolu göstər'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-banner auth-banner-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              🛡️ Daxil Ol
            </button>
          </form>

          <p className="admin-auth-hint">
            Bu panel yalnız sistem administratorları üçün nəzərdə tutulmuşdur.
          </p>
        </div>
      </div>
    );
  }

  // ── Authenticated: show session bar + children ─────────────────────────────
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

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AuthPage() {
  const { register, login, t } = useApp();
  const [mode, setMode] = useState('register');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    setTimeout(() => {
      const result = register({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      setLoading(false);

      if (!result.ok) {
        setError(
          result.error === 'email_taken'
            ? 'Bu e-poçt artıq qeydiyyatdan keçib. Daxil olun.'
            : 'Qeydiyyat uğursuz oldu.'
        );
        return;
      }

      setSuccessMsg('Qeydiyyat uğurla tamamlandı! İndi daxil olun.');
      setMode('login');
    }, 700);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    setTimeout(() => {
      const result = login(form.email, form.password);
      setLoading(false);

      if (!result.ok) {
        setError('E-poçt və ya şifrə yanlışdır.');
      }
    }, 700);
  };

  const handleSubmit = mode === 'register' ? handleRegister : handleLogin;

  const features = [
    {
      icon: '⚔️',
      title: 'Real-World Quests',
      desc: 'Praktiki tapşırıqlarla C#, Java, Python məntiqini inkişaf etdir',
    },
    {
      icon: '📈',
      title: 'Level Up System',
      desc: 'Tapşırıqları həll etdikcə XP qazan və səviyyə atla',
    },
    {
      icon: '🪙',
      title: 'Gold & Rewards',
      desc: 'Qızıl sikkələrlə mağazadan eksklüziv gaming avatar və əşyalar al',
    },
  ];

  return (
    <div className="auth-container" style={{ animation: 'fadeIn 0.6s ease' }}>
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">Q</div>
          <span className="auth-brand-name">QUESTIFY</span>
        </div>

        <div className="auth-hero">
          <h1 className="auth-headline">
            Oyun oynayaraq
            <br />
            <span style={{ color: 'var(--accent-cyan)' }}>dil öyrən</span>
          </h1>
          <p className="auth-subheadline">
            Sıxıcı dərsləri unudun. Questify ilə proqramlaşdırma öyrənmək bir RPG oyunu oynamaq kimidir.
            Kod yazın, qızıl qazanın, zirvəyə qalxın!
          </p>

          <div className="auth-features">
            {features.map((f, i) => (
              <div key={i} className="auth-feature-card" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="auth-feature-icon">{f.icon}</div>
                <div>
                  <h3 className="auth-feature-title">{f.title}</h3>
                  <p className="auth-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-glow" style={{ top: '10%', left: '20%', background: 'var(--accent-purple)' }} />
        <div className="auth-glow" style={{ bottom: '10%', right: '20%', background: 'var(--accent-cyan)' }} />
      </div>

      <div className="auth-right">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2 className="auth-form-title">
              {mode === 'login' ? 'Xoş Gəldiniz! 👋' : 'Səyahətə Başla 🚀'}
            </h2>
            <p className="auth-form-subtitle">
              {mode === 'login'
                ? 'Davam etmək üçün hesabınıza daxil olun'
                : 'Pulsuz qeydiyyatdan keçin və macəranıza başlayın'}
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--accent-red)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: 'var(--accent-green)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                animation: 'fadeIn 0.4s ease',
              }}
            >
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <div className="input-group">
                <label className="input-label">İstifadəçi adı</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Məs: KodNinzya"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">E-poçt ünvanı</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  className="input-field"
                  placeholder="ad@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Şifrə</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-xl ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                fontFamily: 'var(--font-display)',
                letterSpacing: '1px',
              }}
            >
              {loading ? t('loading') : mode === 'login' ? t('loginBtn') : t('registerBtn')}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'login' ? (
              <>
                {t('noAccount')}{' '}
                <button
                  id="auth-toggle-register"
                  className="auth-toggle-btn"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setSuccessMsg('');
                  }}
                >
                  {t('registerBtn')}
                </button>
              </>
            ) : (
              <>
                {t('alreadyHaveAccount')}{' '}
                <button
                  id="auth-toggle-login"
                  className="auth-toggle-btn"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                >
                  {t('loginBtn')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

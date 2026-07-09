import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const AVATAR_OPTIONS = [
  { emoji: '🎮', label: 'Gamer',    color: '#8b5cf6' },
  { emoji: '🧙', label: 'Wizard',   color: '#06b6d4' },
  { emoji: '⚔️', label: 'Warrior',  color: '#ef4444' },
  { emoji: '🦊', label: 'Fox',      color: '#f97316' },
  { emoji: '🐉', label: 'Dragon',   color: '#22c55e' },
  { emoji: '🚀', label: 'Rocket',   color: '#3b82f6' },
  { emoji: '🤖', label: 'Robot',    color: '#a855f7' },
  { emoji: '🦸', label: 'Hero',     color: '#fbbf24' },
];

const STEPS = ['Hesab', 'Avatar', 'Başlayaq'];

export default function AuthPage() {
  const { register, login, t } = useApp();

  const [mode, setMode] = useState('register');  // 'register' | 'login'
  const [step, setStep] = useState(1);            // 1 | 2 | 3 (register only)
  const [slideDir, setSlideDir] = useState('right');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);

  const switchMode = (newMode) => {
    setSlideDir(newMode === 'login' ? 'left' : 'right');
    setMode(newMode);
    setStep(1);
    setError('');
    setSuccessMsg('');
  };

  /* ── Step 1 → 2 ── */
  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Ad və Soyad doldurulmalıdır.');
      return;
    }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      setError('Düzgün e-poçt daxil edin.');
      return;
    }
    if (form.password.length < 6) {
      setError('Şifrə ən az 6 simvol olmalıdır.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Şifrələr uyğun gəlmir.');
      return;
    }
    setError('');
    setStep(2);
  };

  /* ── Step 2 → 3 (submit) ── */
  const handleRegister = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const result = register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        emoji: selectedAvatar.emoji,
      });
      setLoading(false);
      if (!result.ok) {
        setError(
          result.error === 'email_taken'
            ? 'Bu e-poçt artıq qeydiyyatdan keçib.'
            : 'Qeydiyyat uğursuz oldu.'
        );
        setStep(1);
        return;
      }
      setStep(3);
      setShowWelcomeSplash(true);
      setTimeout(() => {
        setShowWelcomeSplash(false);
        switchMode('login');
        setSuccessMsg('Qeydiyyat tamamlandı! İndi daxil olun.');
      }, 3200);
    }, 700);
  };

  /* ── Login ── */
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setTimeout(() => {
      const result = login(form.email, form.password);
      setLoading(false);
      if (!result.ok) setError('E-poçt və ya şifrə yanlışdır.');
    }, 700);
  };

  const features = [
    { icon: '⚔️', title: 'Real-World Quests',   desc: 'Praktiki tapşırıqlarla C#, Java, Python məntiqini inkişaf etdir' },
    { icon: '📈', title: 'Level Up System',      desc: 'Tapşırıqları həll etdikcə XP qazan və səviyyə atla' },
    { icon: '🪙', title: 'Gold & Rewards',       desc: 'Qızıl sikkələrlə mağazadan eksklüziv gaming avatar və əşyalar al' },
  ];

  return (
    <div className="auth-container" style={{ animation: 'fadeIn 0.6s ease' }}>

      {/* ── Welcome Splash Overlay ── */}
      {showWelcomeSplash && (
        <div className="auth-welcome-splash">
          <div className="auth-welcome-inner">
            <div className="auth-welcome-avatar">{selectedAvatar.emoji}</div>
            <h1 className="auth-welcome-title">Xoş Gəldiniz!</h1>
            <p className="auth-welcome-name">{form.firstName} {form.lastName}</p>
            <div className="auth-welcome-bonuses">
              <div className="auth-welcome-bonus-chip gold">
                <span>🪙</span>
                <span>+100 Qızıl Bonus</span>
              </div>
              <div className="auth-welcome-bonus-chip heart">
                <span>❤️</span>
                <span>3 Can Başlanğıc</span>
              </div>
            </div>
            <p className="auth-welcome-sub">Questify macəranız başlayır...</p>
            <div className="auth-welcome-particles">
              {[...Array(12)].map((_, i) => (
                <span key={i} className="auth-welcome-particle" style={{
                  '--delay': `${i * 0.15}s`,
                  '--angle': `${(360 / 12) * i}deg`,
                }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Left Hero Panel ── */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">Q</div>
          <span className="auth-brand-name">QUESTIFY</span>
        </div>

        <div className="auth-hero">
          <h1 className="auth-headline">
            Oyun oynayaraq<br />
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

      {/* ── Right Form Panel ── */}
      <div className="auth-right">
        <div className={`auth-form-card auth-slide-${slideDir}`} key={mode}>

          {/* Error / Success banners */}
          {error && (
            <div className="auth-banner auth-banner-error">⚠️ {error}</div>
          )}
          {successMsg && (
            <div className="auth-banner auth-banner-success">✅ {successMsg}</div>
          )}

          {/* ─────────── REGISTER FLOW ─────────── */}
          {mode === 'register' && (
            <>
              {/* Step indicator */}
              <div className="auth-step-indicator">
                {STEPS.map((label, i) => {
                  const s = i + 1;
                  const done = step > s;
                  const active = step === s;
                  return (
                    <React.Fragment key={s}>
                      <div className={`auth-step-node ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
                        {done ? '✓' : s}
                        <span className="auth-step-label">{label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`auth-step-line ${done ? 'done' : ''}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* ── STEP 1: Account Info ── */}
              {step === 1 && (
                <>
                  <div className="auth-form-header">
                    <h2 className="auth-form-title">Hesab Yarat 🚀</h2>
                    <p className="auth-form-subtitle">Pulsuz qeydiyyatdan keçin — 30 saniyə!</p>
                  </div>
                  <form onSubmit={handleStep1} className="auth-form">
                    <div className="auth-name-row">
                      <div className="input-group">
                        <label className="input-label">Ad</label>
                        <div className="input-with-icon">
                          <span className="input-icon">👤</span>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Adınız"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label className="input-label">Soyad</label>
                        <div className="input-with-icon">
                          <span className="input-icon">👥</span>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Soyadınız"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>

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

                    <div className="input-group">
                      <label className="input-label">Şifrəni təsdiqlə</label>
                      <div className="input-with-icon">
                        <span className="input-icon">🔑</span>
                        <input
                          type="password"
                          className="input-field"
                          placeholder="••••••••"
                          value={form.confirmPassword}
                          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    {/* Welcome bonus preview */}
                    <div className="auth-welcome-preview">
                      <span>🎁</span>
                      <span>Qeydiyyat bonusu: <strong style={{ color: 'var(--accent-gold-light)' }}>+100 🪙</strong> + <strong style={{ color: '#ef4444' }}>❤️ 3 Can</strong></span>
                    </div>

                    <button
                      type="submit"
                      id="auth-register-next-btn"
                      className="btn btn-primary btn-xl"
                      style={{ width: '100%', marginTop: '0.5rem', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}
                    >
                      Növbəti →
                    </button>
                  </form>
                </>
              )}

              {/* ── STEP 2: Avatar Picker ── */}
              {step === 2 && (
                <>
                  <div className="auth-form-header">
                    <h2 className="auth-form-title">Avatarını Seç 🎭</h2>
                    <p className="auth-form-subtitle">Sənin qəhrəmanın kimdir?</p>
                  </div>

                  <div className="auth-avatar-grid">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.emoji}
                        type="button"
                        className={`auth-avatar-option ${selectedAvatar.emoji === av.emoji ? 'selected' : ''}`}
                        style={{ '--av-color': av.color }}
                        onClick={() => setSelectedAvatar(av)}
                      >
                        <span className="auth-avatar-emoji">{av.emoji}</span>
                        <span className="auth-avatar-label">{av.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="auth-avatar-preview">
                    <span className="auth-avatar-preview-emoji">{selectedAvatar.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{form.firstName} {form.lastName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedAvatar.label} · Yeni Oyunçu</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-xl"
                      style={{ flex: 1 }}
                      onClick={() => { setStep(1); setError(''); }}
                    >
                      ← Geri
                    </button>
                    <button
                      id="auth-register-submit-btn"
                      type="button"
                      className={`btn btn-primary btn-xl ${loading ? 'btn-loading' : ''}`}
                      style={{ flex: 2, fontFamily: 'var(--font-display)', letterSpacing: '1px' }}
                      disabled={loading}
                      onClick={handleRegister}
                    >
                      {loading ? t('loading') : '🚀 Qeydiyyat'}
                    </button>
                  </div>
                </>
              )}

              {/* ── STEP 3: Splash loading state ── */}
              {step === 3 && !showWelcomeSplash && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
                  <p style={{ fontWeight: 700 }}>Yönləndirilir...</p>
                </div>
              )}
            </>
          )}

          {/* ─────────── LOGIN FLOW ─────────── */}
          {mode === 'login' && (
            <>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Xoş Gəldiniz! 👋</h2>
                <p className="auth-form-subtitle">Davam etmək üçün hesabınıza daxil olun</p>
              </div>

              <form onSubmit={handleLogin} className="auth-form">
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
                  id="auth-login-btn"
                  className={`btn btn-primary btn-xl ${loading ? 'btn-loading' : ''}`}
                  disabled={loading}
                  style={{ width: '100%', marginTop: '0.5rem', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}
                >
                  {loading ? t('loading') : t('loginBtn')}
                </button>
              </form>
            </>
          )}

          {/* ── Mode switcher ── */}
          <div className="auth-switch">
            {mode === 'login' ? (
              <>
                {t('noAccount')}{' '}
                <button id="auth-toggle-register" className="auth-toggle-btn" onClick={() => switchMode('register')}>
                  {t('registerBtn')}
                </button>
              </>
            ) : step === 1 ? (
              <>
                {t('alreadyHaveAccount')}{' '}
                <button id="auth-toggle-login" className="auth-toggle-btn" onClick={() => switchMode('login')}>
                  {t('loginBtn')}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

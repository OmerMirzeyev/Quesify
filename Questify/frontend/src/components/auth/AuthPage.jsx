import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../utils/api';
import { clearAuthSession, setAdminLoggedIn, getRegisteredUsers } from '../../utils/storage';

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
  const { register, login, setCurrentTab, t } = useApp();

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

  // Validation errors object
  const [validationErrors, setValidationErrors] = useState({});

  // Custom avatar upload state
  const [customAvatarFile, setCustomAvatarFile] = useState(null);   // File object
  const [customAvatarPreview, setCustomAvatarPreview] = useState(null); // DataURL
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);

  // ── Login: password visibility toggle ──
  const [showPassword, setShowPassword] = useState(false);

  // ── Register: password visibility toggle ──
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // ── Forgot Password Modal ──
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [fpView, setFpView] = useState('email'); // 'email' | 'code' | 'reset'
  const [fpEmail, setFpEmail] = useState('');
  const [fpCode, setFpCode] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState('');
  const [fpSuccess, setFpSuccess] = useState('');
  const [fpShowNew, setFpShowNew] = useState(false);
  const [fpShowConfirm, setFpShowConfirm] = useState(false);

  const switchMode = (newMode) => {
    setSlideDir(newMode === 'login' ? 'left' : 'right');
    setMode(newMode);
    setStep(1);
    setError('');
    setSuccessMsg('');
    setValidationErrors({});
    setShowPassword(false);
    setShowRegPassword(false);
    setShowRegConfirmPassword(false);
  };

  /* ── Custom avatar file handler ── */
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Yalnız şəkil faylı seçin.');
      return;
    }
    setCustomAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCustomAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
    // Deselect any emoji avatar so the custom one takes priority
    setSelectedAvatar(null);
  };

  const clearCustomAvatar = () => {
    setCustomAvatarFile(null);
    setCustomAvatarPreview(null);
    setSelectedAvatar(AVATAR_OPTIONS[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Step 1 → 2 ── */
  const handleStep1 = (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = 'Bu xana boş qala bilməz!';
    if (!form.lastName.trim()) errors.lastName = 'Bu xana boş qala bilməz!';
    if (!form.email.trim()) errors.email = 'Bu xana boş qala bilməz!';
    if (!form.password.trim()) errors.password = 'Bu xana boş qala bilməz!';
    if (!form.confirmPassword.trim()) errors.confirmPassword = 'Bu xana boş qala bilməz!';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setValidationErrors({ email: 'Düzgün e-poçt daxil edin.' });
      return;
    }
    if (form.password.length < 6) {
      setValidationErrors({ password: 'Şifrə ən az 6 simvol olmalıdır.' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setValidationErrors({ confirmPassword: 'Şifrələr uyğun gəlmir.' });
      return;
    }

    setValidationErrors({});
    setError('');
    setStep(2);
  };

  /* ── Step 2 → 3 (submit) ── */
  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const chosenEmoji = selectedAvatar ? selectedAvatar.emoji : '🖼️';
      // Register with the backend database
      const response = await fetch('http://localhost:5271/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          emoji: chosenEmoji,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        setError(
          response.status === 409
            ? 'Bu e-poçt artıq qeydiyyatdan keçib.'
            : (data.message || 'Qeydiyyat uğursuz oldu.')
        );
        setStep(1);
        return;
      }

      // Backend registration succeeded. Save auth tokens.
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.role);
      if (data.expiration) {
        localStorage.setItem('authTokenExpiration', data.expiration);
      }
      if (data.role === 'Admin') {
        setAdminLoggedIn();
      }

      // Now register locally in context (so local state, XP, gold, etc are initialized)
      const localRegResult = register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        emoji: chosenEmoji,
      });

      if (!localRegResult.ok) {
        console.error('Lokal qeydiyyat xətası:', localRegResult);
        setLoading(false);
        setError('Lokal qeydiyyat uğursuz oldu.');
        setStep(1);
        return;
      }

      // Log in locally in context
      const localLoginResult = login(form.email, form.password);
      if (!localLoginResult.ok) {
        console.error('Lokal giriş xətası:', localLoginResult);
        setLoading(false);
        setError('Lokal giriş uğursuz oldu.');
        setStep(1);
        return;
      }

      setLoading(false);
      setStep(3);
      setShowWelcomeSplash(true);
      setTimeout(() => {
        setShowWelcomeSplash(false);
        if (data.role === 'Admin') {
          setCurrentTab('admin');
        }
      }, 3200);

    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Serverə qoşulmaq mümkün olmadı. Backend işlədiyindən əmin olun.');
      setStep(1);
    }
  };

  /* ── Login ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.email.trim()) errors.email = 'Bu xana boş qala bilməz!';
    if (!form.password.trim()) errors.password = 'Bu xana boş qala bilməz!';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch('http://localhost:5271/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      if (!response.ok) {
        setError('E-poçt və ya şifrə yanlışdır.');
        return;
      }

      const { token, role, expiration } = await response.json();

      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role);
      if (expiration) {
        localStorage.setItem('authTokenExpiration', expiration);
      }
      if (role === 'Admin') {
        setAdminLoggedIn();
      }

      // Auto-sync local storage with backend login response if missing locally
      const users = getRegisteredUsers();
      const localUser = users.find(u => u.email === form.email.trim().toLowerCase());
      if (!localUser) {
        register({
          firstName: role === 'Admin' ? 'Admin' : 'İstifadəçi',
          lastName: 'Questify',
          email: form.email.trim(),
          password: form.password,
          emoji: role === 'Admin' ? '🛡️' : '🎮'
        });
      }

      const result = login(form.email, form.password);
      if (!result.ok) {
        clearAuthSession();
        setError('E-poçt və ya şifrə yanlışdır.');
        return;
      }

      if (role === 'Admin') {
        setCurrentTab('admin');
      }
    } catch {
      clearAuthSession();
      setError('Serverə qoşulmaq mümkün olmadı. Backend işlədiyindən əmin olun.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Forgot Password Handlers ── */
  const openForgotModal = () => {
    setFpView('email');
    setFpEmail('');
    setFpCode('');
    setFpNewPassword('');
    setFpConfirmPassword('');
    setFpError('');
    setFpSuccess('');
    setFpLoading(false);
    setShowForgotModal(true);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
  };

  // Step 1: send verification code to email (actual call with mock fallback)
  const handleFpSendCode = async (e) => {
    e.preventDefault();
    if (!fpEmail.trim()) {
      setFpError('Bu xana boş qala bilməz!');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(fpEmail)) {
      setFpError('Düzgün e-poçt daxil edin.');
      return;
    }
    setFpLoading(true);
    setFpError('');
    setFpSuccess('');
    try {
      const response = await fetch('http://localhost:5271/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFpError(data.message || 'Xəta baş verdi.');
        return;
      }
      // Notify user to check their email inbox for the code
      setFpSuccess(data.message || 'Doğrulama kodu e-poçt ünvanınıza göndərildi.');
      setTimeout(() => {
        setFpSuccess('');
        setFpView('code');
      }, 2500);
    } catch (err) {
      setFpError('Serverə qoşulmaq mümkün olmadı.');
    } finally {
      setFpLoading(false);
    }
  };

  // Step 2: verify code
  const handleFpVerifyCode = async (e) => {
    e.preventDefault();
    if (!fpCode.trim()) {
      setFpError('Doğrulama kodu boş qala bilməz!');
      return;
    }
    setFpError('');
    setFpView('reset');
  };

  // Step 3: reset password
  const handleFpResetPassword = async (e) => {
    e.preventDefault();
    if (!fpNewPassword.trim()) {
      setFpError('Yeni şifrə boş qala bilməz!');
      return;
    }
    if (fpNewPassword.length < 6) {
      setFpError('Şifrə ən az 6 simvol olmalıdır.');
      return;
    }
    if (fpNewPassword !== fpConfirmPassword) {
      setFpError('Şifrələr uyğun gəlmir.');
      return;
    }
    setFpLoading(true);
    setFpError('');
    setFpSuccess('');
    try {
      const response = await fetch('http://localhost:5271/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fpEmail.trim(),
          code: fpCode.trim(),
          password: fpNewPassword
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFpError(data.message || 'Şifrə yenilənmədi.');
        return;
      }
      setFpSuccess('Şifrəniz uğurla yeniləndi!');
      setTimeout(() => {
        closeForgotModal();
        setSuccessMsg('Şifrəniz yeniləndi. İndi daxil ola bilərsiniz.');
      }, 1600);
    } catch (err) {
      setFpError('Serverə qoşulmaq mümkün olmadı.');
    } finally {
      setFpLoading(false);
    }
  };

  const features = [
    { icon: '⚔️', title: 'Real-World Quests',   desc: 'Praktiki tapşırıqlarla C#, Java, Python məntiqini inkişaf etdir' },
    { icon: '📈', title: 'Level Up System',      desc: 'Tapşırıqları həll etdikcə XP qazan və səviyyə atla' },
    { icon: '🪙', title: 'Gold & Rewards',       desc: 'Qızıl sikkələrlə mağazadan eksklüziv gaming avatar və əşyalar al' },
  ];

  const avatarDisplayEmoji = selectedAvatar ? selectedAvatar.emoji : '🖼️';

  return (
    <div className="auth-container" style={{ animation: 'fadeIn 0.6s ease' }}>

      {/* ── Welcome Splash Overlay ── */}
      {showWelcomeSplash && (
        <div className="auth-welcome-splash">
          <div className="auth-welcome-inner">
            <div className="auth-welcome-avatar">
              {customAvatarPreview
                ? <img src={customAvatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : avatarDisplayEmoji}
            </div>
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

      {/* ── Forgot Password Modal ── */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={closeForgotModal}>
          <div className="modal-content fp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeForgotModal} aria-label="Close">✕</button>

            {/* ── View: Email entry ── */}
            {fpView === 'email' && (
              <>
                <div className="fp-modal-header">
                  <div className="fp-modal-icon">🔑</div>
                  <h2 className="fp-modal-title">Şifrəni Sıfırla</h2>
                  <p className="fp-modal-sub">Qeydiyyatlı e-poçtunuzu daxil edin — doğrulama kodu göndərəcəyik.</p>
                </div>
                <form onSubmit={handleFpSendCode} className="fp-modal-form" noValidate>
                  {fpError && <div className="auth-banner auth-banner-error">⚠️ {fpError}</div>}
                  {fpSuccess && <div className="auth-banner auth-banner-success" style={{ whiteSpace: 'pre-wrap' }}>✅ {fpSuccess}</div>}
                  <div className="input-group">
                    <label className="input-label">E-poçt ünvanı</label>
                    <div className="input-with-icon">
                      <span className="input-icon">✉️</span>
                      <input
                        type="email"
                        className="input-field"
                        placeholder="ad@email.com"
                        value={fpEmail}
                        onChange={(e) => setFpEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`btn btn-primary fp-submit-btn ${fpLoading ? 'btn-loading' : ''}`}
                    disabled={fpLoading}
                  >
                    {fpLoading ? 'Göndərilir...' : 'Kodu Göndər →'}
                  </button>
                </form>
              </>
            )}

            {/* ── View: Code entry ── */}
            {fpView === 'code' && (
              <>
                <div className="fp-modal-header">
                  <div className="fp-modal-icon">📨</div>
                  <h2 className="fp-modal-title">Kodu Daxil Et</h2>
                  <p className="fp-modal-sub">Müvəqqəti doğrulama kodunu daxil edin.</p>
                </div>
                <form onSubmit={handleFpVerifyCode} className="fp-modal-form" noValidate>
                  {fpError && <div className="auth-banner auth-banner-error">⚠️ {fpError}</div>}
                  <div className="input-group">
                    <label className="input-label">Doğrulama Kodu</label>
                    <input
                      type="text"
                      className="input-field fp-code-input"
                      placeholder="000000"
                      maxLength={6}
                      value={fpCode}
                      onChange={(e) => setFpCode(e.target.value.replace(/\D/g, ''))}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="fp-resend-row">
                    <button type="button" className="fp-resend-link" onClick={() => setFpView('email')}>
                      Kodu yenidən göndər
                    </button>
                  </div>
                  <button
                    type="submit"
                    className={`btn btn-primary fp-submit-btn ${fpLoading ? 'btn-loading' : ''}`}
                    disabled={fpLoading}
                  >
                    {fpLoading ? 'Yoxlanılır...' : 'Təsdiqlə →'}
                  </button>
                </form>
              </>
            )}

            {/* ── View: New password ── */}
            {fpView === 'reset' && (
              <>
                <div className="fp-modal-header">
                  <div className="fp-modal-icon">🔒</div>
                  <h2 className="fp-modal-title">Yeni Şifrə</h2>
                  <p className="fp-modal-sub">Hesabınız üçün güclü yeni bir şifrə seçin.</p>
                </div>
                <form onSubmit={handleFpResetPassword} className="fp-modal-form" noValidate>
                  {fpError && <div className="auth-banner auth-banner-error">⚠️ {fpError}</div>}
                  {fpSuccess && <div className="auth-banner auth-banner-success">✅ {fpSuccess}</div>}
                  <div className="input-group">
                    <label className="input-label">Yeni Şifrə</label>
                    <div className="input-with-icon">
                      <span className="input-icon">🔒</span>
                      <input
                        type={fpShowNew ? 'text' : 'password'}
                        className="input-field"
                        placeholder="••••••••"
                        value={fpNewPassword}
                        onChange={(e) => setFpNewPassword(e.target.value)}
                        required
                        minLength={6}
                        autoFocus
                        style={{ paddingRight: '2.8rem' }}
                      />
                      <button
                        type="button"
                        className="pw-toggle-btn"
                        onClick={() => setFpShowNew((v) => !v)}
                        aria-label={fpShowNew ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                      >
                        {fpShowNew ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Şifrəni Təsdiqlə</label>
                    <div className="input-with-icon">
                      <span className="input-icon">🔑</span>
                      <input
                        type={fpShowConfirm ? 'text' : 'password'}
                        className="input-field"
                        placeholder="••••••••"
                        value={fpConfirmPassword}
                        onChange={(e) => setFpConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{ paddingRight: '2.8rem' }}
                      />
                      <button
                        type="button"
                        className="pw-toggle-btn"
                        onClick={() => setFpShowConfirm((v) => !v)}
                        aria-label={fpShowConfirm ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                      >
                        {fpShowConfirm ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`btn btn-primary fp-submit-btn ${fpLoading ? 'btn-loading' : ''}`}
                    disabled={fpLoading}
                  >
                    {fpLoading ? 'Saxlanılır...' : '✅ Şifrəni Yenilə'}
                  </button>
                </form>
              </>
            )}
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
                  <form onSubmit={handleStep1} className="auth-form" noValidate>
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
                            onChange={(e) => {
                              setForm({ ...form, firstName: e.target.value });
                              if (validationErrors.firstName) {
                                setValidationErrors({ ...validationErrors, firstName: '' });
                              }
                            }}
                            required
                          />
                        </div>
                        {validationErrors.firstName && (
                          <span className="field-error-text" style={{ color: 'var(--accent-red)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                            {validationErrors.firstName}
                          </span>
                        )}
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
                            onChange={(e) => {
                              setForm({ ...form, lastName: e.target.value });
                              if (validationErrors.lastName) {
                                setValidationErrors({ ...validationErrors, lastName: '' });
                              }
                            }}
                            required
                          />
                        </div>
                        {validationErrors.lastName && (
                          <span className="field-error-text" style={{ color: 'var(--accent-red)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                            {validationErrors.lastName}
                          </span>
                        )}
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
                          onChange={(e) => {
                            setForm({ ...form, email: e.target.value });
                            if (validationErrors.email) {
                              setValidationErrors({ ...validationErrors, email: '' });
                            }
                          }}
                          required
                        />
                      </div>
                      {validationErrors.email && (
                        <span className="field-error-text" style={{ color: 'var(--accent-red)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                          {validationErrors.email}
                        </span>
                      )}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Şifrə</label>
                      <div className="input-with-icon">
                        <span className="input-icon">🔒</span>
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          className="input-field"
                          placeholder="••••••••"
                          value={form.password}
                          onChange={(e) => {
                            setForm({ ...form, password: e.target.value });
                            if (validationErrors.password) {
                              setValidationErrors({ ...validationErrors, password: '' });
                            }
                          }}
                          required
                          minLength={6}
                          style={{ paddingRight: '2.8rem' }}
                        />
                        <button
                          type="button"
                          className="pw-toggle-btn"
                          onClick={() => setShowRegPassword((v) => !v)}
                          aria-label={showRegPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                        >
                          {showRegPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {validationErrors.password && (
                        <span className="field-error-text" style={{ color: 'var(--accent-red)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                          {validationErrors.password}
                        </span>
                      )}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Şifrəni təsdiqlə</label>
                      <div className="input-with-icon">
                        <span className="input-icon">🔑</span>
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          className="input-field"
                          placeholder="••••••••"
                          value={form.confirmPassword}
                          onChange={(e) => {
                            setForm({ ...form, confirmPassword: e.target.value });
                            if (validationErrors.confirmPassword) {
                              setValidationErrors({ ...validationErrors, confirmPassword: '' });
                            }
                          }}
                          required
                          minLength={6}
                          style={{ paddingRight: '2.8rem' }}
                        />
                        <button
                          type="button"
                          className="pw-toggle-btn"
                          onClick={() => setShowRegConfirmPassword((v) => !v)}
                          aria-label={showRegConfirmPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                        >
                          {showRegConfirmPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {validationErrors.confirmPassword && (
                        <span className="field-error-text" style={{ color: 'var(--accent-red)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                          {validationErrors.confirmPassword}
                        </span>
                      )}
                    </div>

                    {/* Welcome bonus preview */}
                    <div className="auth-welcome-preview">
                      <span>🎁</span>
                      <span>Qeydiyyat bonusu: <strong style={{ color: 'var(--accent-gold-light)' }}>+100 🪙</strong> + <strong style={{ color: '#ef4444' }}>❤️ 3 Can</strong></span>
                    </div>

                    <button
                      type="submit"
                      id="auth-register-next-btn"
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '0.25rem' }}
                    >
                      Növbəti →
                    </button>
                  </form>
                </>
              )}

              {/* ── STEP 2: Avatar Picker + Custom Upload ── */}
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
                        className={`auth-avatar-option ${selectedAvatar && selectedAvatar.emoji === av.emoji ? 'selected' : ''}`}
                        style={{ '--av-color': av.color }}
                        onClick={() => { setSelectedAvatar(av); clearCustomAvatar(); }}
                      >
                        <span className="auth-avatar-emoji">{av.emoji}</span>
                        <span className="auth-avatar-label">{av.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* ── Custom Image Upload ── */}
                  <div className="auth-avatar-upload-zone">
                    <p className="auth-avatar-upload-label">— və ya öz şəklinizi yükləyin —</p>
                    <div className="auth-avatar-upload-row">
                      <label htmlFor="avatar-file-input" className="btn btn-outline auth-upload-btn">
                        📁 Şəkil Seç
                      </label>
                      <input
                        id="avatar-file-input"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="auth-upload-input-hidden"
                        onChange={handleAvatarFileChange}
                      />
                      {customAvatarPreview && (
                        <div className="auth-custom-avatar-preview">
                          <img
                            src={customAvatarPreview}
                            alt="Custom avatar preview"
                            className="auth-custom-avatar-img"
                          />
                          <span className="auth-custom-avatar-name">
                            {customAvatarFile?.name?.length > 18
                              ? customAvatarFile.name.slice(0, 16) + '…'
                              : customAvatarFile?.name}
                          </span>
                          <button
                            type="button"
                            className="auth-custom-avatar-remove"
                            onClick={clearCustomAvatar}
                            aria-label="Remove custom avatar"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="auth-avatar-preview">
                    <span className="auth-avatar-preview-emoji">
                      {customAvatarPreview
                        ? <img src={customAvatarPreview} alt="preview" style={{ width: '3rem', height: '3rem', objectFit: 'cover', borderRadius: '50%' }} />
                        : avatarDisplayEmoji}
                    </span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{form.firstName} {form.lastName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {customAvatarPreview ? 'Öz şəkliniz' : (selectedAvatar?.label ?? 'Avatar')} · Yeni Oyunçu
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ flex: 1 }}
                      onClick={() => { setStep(1); setError(''); }}
                    >
                      ← Geri
                    </button>
                    <button
                      id="auth-register-submit-btn"
                      type="button"
                      className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
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

              <form onSubmit={handleLogin} className="auth-form" noValidate>
                <div className="input-group">
                  <label className="input-label">E-poçt ünvanı</label>
                  <div className="input-with-icon">
                    <span className="input-icon">✉️</span>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="ad@email.com"
                      value={form.email}
                      onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        if (validationErrors.email) {
                          setValidationErrors({ ...validationErrors, email: '' });
                        }
                      }}
                      required
                    />
                  </div>
                  {validationErrors.email && (
                    <span className="field-error-text" style={{ color: 'var(--accent-red)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      {validationErrors.email}
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Şifrə</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => {
                        setForm({ ...form, password: e.target.value });
                        if (validationErrors.password) {
                          setValidationErrors({ ...validationErrors, password: '' });
                        }
                      }}
                      required
                      minLength={6}
                      style={{ paddingRight: '2.8rem' }}
                    />
                    <button
                      type="button"
                      id="login-pw-toggle"
                      className="pw-toggle-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <span className="field-error-text" style={{ color: 'var(--accent-red)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      {validationErrors.password}
                    </span>
                  )}
                </div>

                {/* Forgot password link */}
                <div className="fp-link-row">
                  <button
                    type="button"
                    id="forgot-password-link"
                    className="fp-link-btn"
                    onClick={openForgotModal}
                  >
                    Şifrəni unutdunuz?
                  </button>
                </div>

                <button
                  type="submit"
                  id="auth-login-btn"
                  className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
                  disabled={loading}
                  style={{ width: '100%', marginTop: '0.25rem', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}
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

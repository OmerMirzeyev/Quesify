import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import {
  clearAuthSession, setAuthSession, getRegisteredUsers,
  normalizeRole, isAdminRole, updateRegisteredUserByEmail, updateUserProgressFields,
} from '../../utils/storage';
import { TiltCard, ParticleField, TermsCheckbox, LiveStatsPanel } from './AuthVisualExtras';
import TechGlobe3D from './TechGlobe3D';
import AuthTopNav from './AuthTopNav';
import LandingSections from './LandingSections';
import GoogleSignInButton from './GoogleSignInButton';
import OtpDigitInput from './OtpDigitInput';
import OtpCountdown from './OtpCountdown';

const OTP_TTL_MS = 10 * 60 * 1000; // matches backend EmailOtpTtlMinutes

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

export default function AuthPage() {
  const { register, login, setCurrentTab, t } = useApp();
  const STEPS = [t('authStepAccount'), t('authStepAvatar'), t('authStepStart')];

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

  // ── Real per-course enrollment counts (GET /api/courses/stats), keyed by Course.Slug — feeds
  // both the globe tooltips and the stat cards below it. Empty until it resolves, so both
  // consumers fall back to an em dash instead of a stale/fake number.
  const [courseStats, setCourseStats] = useState({});
  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/courses/stats')
      .then(({ ok, data }) => {
        if (cancelled || !ok || !Array.isArray(data)) return;
        const bySlug = {};
        data.forEach((c) => { bySlug[c.slug] = c.students; });
        setCourseStats(bySlug);
      })
      .catch(() => { /* offline — keep showing the em-dash fallback */ });
    return () => { cancelled = true; };
  }, []);

  // ── Security / human-verification checkbox (Step 1 gate) ──
  const [securityChecked, setSecurityChecked] = useState(false);

  // ── Email OTP step — set once register issues a verification challenge instead of a token ──
  const [pendingAuth, setPendingAuth] = useState(null); // { mode: 'register', email }
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);

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
  const [fpExpiresAt, setFpExpiresAt] = useState(null);

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

  const openForgotModal = () => {
    setFpView('email');
    setFpEmail('');
    setFpCode('');
    setFpNewPassword('');
    setFpConfirmPassword('');
    setFpError('');
    setFpSuccess('');
    setFpLoading(false);
    setFpExpiresAt(null);
    setShowForgotModal(true);
  };

  /* ── Custom avatar file handler ── */
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t('errImageOnly'));
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
    if (!form.firstName.trim()) errors.firstName = t('errFirstNameRequired');
    if (!form.lastName.trim()) errors.lastName = t('errLastNameRequired');
    if (!form.email.trim()) errors.email = t('errEmailInvalid');
    if (!form.password.trim()) errors.password = t('errPasswordRequired');
    if (!form.confirmPassword.trim()) errors.confirmPassword = t('errConfirmPasswordMismatch');

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setValidationErrors({ email: t('errEmailInvalid') });
      return;
    }
    if (form.password.length < 6) {
      setValidationErrors({ password: t('errPasswordMinLength') });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setValidationErrors({ confirmPassword: t('errConfirmPasswordMismatch') });
      return;
    }

    if (!securityChecked) {
      setValidationErrors({ security: t('errTermsRequired') });
      return;
    }

    setValidationErrors({});
    setError('');
    setStep(2);
  };

  /* ── Register completion — runs once /verify-otp returns a real AuthResponse. This is exactly
     the tail-end logic that used to run directly after register's fetch, before OTP existed.
     (Login no longer goes through OTP at all — see completeLogin below — so this is register-only.) ── */
  const completeAuthWithBackendData = (data) => {
    const { role } = data;
    setAuthSession({ token: data.token, role: data.role, expiration: data.expiration });

    const chosenEmoji = selectedAvatar ? selectedAvatar.emoji : '🖼️';
    const localRegResult = register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      emoji: chosenEmoji,
      avatarUrl: customAvatarPreview || chosenEmoji,
    });

    if (!localRegResult.ok) {
      console.error('Lokal qeydiyyat xətası:', localRegResult);
      setOtpError(t('errRegisterFailed'));
      return;
    }

    const localLoginResult = login(form.email, form.password, data);
    if (!localLoginResult.ok) {
      console.error('Lokal giriş xətası:', localLoginResult);
      setOtpError(t('errRegisterFailed'));
      return;
    }

    setPendingAuth(null);
    setStep(3);
    setShowWelcomeSplash(true);
    setTimeout(() => {
      setShowWelcomeSplash(false);
      if (role === 'Admin') setCurrentTab('admin');
    }, 3200);
  };

  /* ── Login completion — login no longer requires OTP, so this runs directly off /api/auth/login's
     response (same shape/logic that used to run after OTP verification). ── */
  // `emailOverride`/`passwordOverride` let Google Sign-In (which has no login-form fields to
  // read from) drive the exact same local-account bookkeeping as a normal password login.
  const completeLogin = (data, emailOverride, passwordOverride) => {
    const { role, avatarUrl, emoji } = data;
    setAuthSession({ token: data.token, role: data.role, expiration: data.expiration });

    const loginEmail = (emailOverride ?? data.email ?? form.email).trim();
    const loginPassword = passwordOverride ?? form.password;
    const normalizedLoginEmail = loginEmail.toLowerCase();
    const users = getRegisteredUsers();
    const localUser = users.find((u) => u.email === normalizedLoginEmail);
    if (!localUser) {
      register({
        firstName: role === 'Admin' ? 'Admin' : 'İstifadəçi',
        lastName: 'Questify',
        email: loginEmail,
        password: loginPassword,
        emoji: role === 'Admin' ? '🛡️' : (emoji || '🎮'),
        avatarUrl: avatarUrl || '',
        role,
      });
    } else if (isAdminRole(role) !== isAdminRole(localUser.role)) {
      // Self-heal: the backend's JWT role is authoritative. If this browser's cached local
      // role (registeredUsers entry + per-user progress.user.role, both read by the map-unlock
      // and leaderboard-exclusion logic) ever drifted out of sync with it — e.g. an account
      // promoted to Admin before this reconciliation existed — fix it on every login instead of
      // requiring a manual localStorage wipe.
      const fixedRole = normalizeRole(role);
      updateRegisteredUserByEmail(normalizedLoginEmail, { role: fixedRole });
      updateUserProgressFields(normalizedLoginEmail, { role: fixedRole });
    }

    const result = login(loginEmail, loginPassword, data);
    if (!result.ok) {
      clearAuthSession();
      setError(t('errEmailOrPasswordWrong'));
      return;
    }

    if (role === 'Admin') setCurrentTab('admin');
  };

  /* ── Google Sign-In — verified server-side in /api/auth/google, which returns the same
     AuthResponse shape as login (now including email/avatarUrl/emoji) so completeLogin can
     drive it without ever needing the login form's email/password fields. ── */
  const handleGoogleCredential = async (credential) => {
    setLoading(true);
    setError('');
    try {
      const { ok, data } = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: { credential },
      });
      if (!ok) {
        setError(data?.message || t('errGoogleFailed'));
        return;
      }
      // Local-only mirror password — never sent anywhere, just keeps the localStorage auth
      // mirror (see storage.js authenticateUser) consistent across repeated Google sign-ins.
      const localPassword = `google-oauth:${data.token.slice(-32)}`;
      completeLogin(data, data.email, localPassword);
    } catch {
      setError(t('errServerUnreachable'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleUnavailable = () => setError(t('googleNotConfigured'));

  /* ── Step 2 → 3 (submit): request the backend account + issue an OTP challenge ── */
  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const chosenEmoji = selectedAvatar ? selectedAvatar.emoji : '🖼️';
      const { ok, status, data } = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          emoji: chosenEmoji,
          avatarUrl: customAvatarPreview || '',
        },
      });

      if (!ok) {
        setLoading(false);
        setError(
          status === 409
            ? t('errEmailTaken')
            : (data?.message || t('errRegisterFailed'))
        );
        setStep(1);
        return;
      }

      // Registration succeeded — an email verification challenge was issued instead of a token.
      setPendingAuth({ mode: 'register', email: data.email });
      setOtpCode('');
      setOtpError('');
      setOtpInfo(data.message || t('otpReadyMsg'));
      setOtpExpiresAt(Date.now() + OTP_TTL_MS);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(t('errServerUnreachable'));
      setStep(1);
    }
  };

  /* ── Login: request an OTP challenge (never issues a token directly anymore) ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.email.trim()) errors.email = t('errEmailInvalid');
    if (!form.password.trim()) errors.password = t('errPasswordRequired');

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const { ok, status, data } = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: form.email.trim(),
          password: form.password,
        },
      });

      if (!ok) {
        setError(
          status === 403
            ? (data?.message || t('errEmailOrPasswordWrong'))
            : t('errEmailOrPasswordWrong')
        );
        return;
      }

      // No OTP step for login — straight in with the real token.
      completeLogin(data);
    } catch {
      setError(t('errServerUnreachable'));
    } finally {
      setLoading(false);
    }
  };

  /* ── Email OTP verify/resend/cancel ── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!pendingAuth) return;
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setOtpError(t('errOtpCodeLength'));
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const { ok, data } = await apiFetch('/api/auth/verify-email-otp', {
        method: 'POST',
        body: { email: pendingAuth.email, code: otpCode.trim() },
      });
      if (!ok) {
        setOtpError(data?.message || t('errOtpWrong'));
        return;
      }
      completeAuthWithBackendData(data);
    } catch {
      setOtpError(t('errServerUnreachable'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingAuth) return;
    setOtpLoading(true);
    setOtpError('');
    try {
      const { ok, data } = await apiFetch('/api/auth/resend-otp', {
        method: 'POST',
        body: { email: pendingAuth.email },
      });
      setOtpInfo(ok ? (data?.message || t('otpResentMsg')) : '');
      if (ok) {
        setOtpCode('');
        setOtpExpiresAt(Date.now() + OTP_TTL_MS);
      } else {
        setOtpError(data?.message || t('errOtpResendFailed'));
      }
    } catch {
      setOtpError(t('errServerUnreachable'));
    } finally {
      setOtpLoading(false);
    }
  };

  const cancelOtp = () => {
    setPendingAuth(null);
    setOtpCode('');
    setOtpError('');
    setOtpInfo('');
    setOtpExpiresAt(null);
    setLoading(false);
  };

  // remove the old openForgotModal that was inline — now defined above in switchMode block

  const closeForgotModal = () => {
    setShowForgotModal(false);
  };

  // Step 1: request a password-reset OTP code, emailed by the backend
  const handleFpSendCode = async (e) => {
    e.preventDefault();
    if (!fpEmail.trim()) {
      setFpError(t('errEmailInvalid'));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(fpEmail)) {
      setFpError(t('errEmailInvalid'));
      return;
    }
    setFpLoading(true);
    setFpError('');
    setFpSuccess('');
    try {
      const { ok, data } = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: { email: fpEmail.trim() },
      });
      if (!ok) {
        setFpError(data?.message || t('fpErrGeneric'));
        return;
      }
      // The backend never returns the code itself in the response (that used to be a full
      // account-takeover hole — anyone who knew a victim's email could read it back). It's
      // emailed (or dev-logged) server-side; move to the code-entry step.
      setFpSuccess(data?.message || t('fpCodeReady'));
      setFpCode('');
      setFpExpiresAt(Date.now() + OTP_TTL_MS);
      setFpView('code');
    } catch {
      setFpError(t('errServerUnreachable'));
    } finally {
      setFpLoading(false);
    }
  };

  const handleFpResendCode = async () => {
    setFpLoading(true);
    setFpError('');
    try {
      const { ok, data } = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: { email: fpEmail.trim() },
      });
      if (ok) {
        setFpSuccess(data?.message || t('fpCodeReady'));
        setFpCode('');
        setFpExpiresAt(Date.now() + OTP_TTL_MS);
      } else {
        setFpError(data?.message || t('fpErrGeneric'));
      }
    } catch {
      setFpError(t('errServerUnreachable'));
    } finally {
      setFpLoading(false);
    }
  };

  // Step 2: verify code
  const handleFpVerifyCode = async (e) => {
    e.preventDefault();
    if (!fpCode.trim()) {
      setFpError(t('fpErrCodeRequired'));
      return;
    }
    setFpError('');
    setFpView('reset');
  };

  // Step 3: reset password
  const handleFpResetPassword = async (e) => {
    e.preventDefault();
    if (!fpNewPassword.trim()) {
      setFpError(t('fpErrNewPasswordRequired'));
      return;
    }
    if (fpNewPassword.length < 6) {
      setFpError(t('fpErrPasswordMinLength'));
      return;
    }
    if (fpNewPassword !== fpConfirmPassword) {
      setFpError(t('fpErrPasswordMismatch'));
      return;
    }
    setFpLoading(true);
    setFpError('');
    setFpSuccess('');
    try {
      const { ok, data } = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: {
          email: fpEmail.trim(),
          code: fpCode.trim(),
          password: fpNewPassword
        },
      });
      if (!ok) {
        setFpError(data?.message || t('fpErrPasswordNotUpdated'));
        return;
      }
      setFpSuccess(t('fpSuccessUpdated'));
      setTimeout(() => {
        closeForgotModal();
        setSuccessMsg(t('fpSuccessLoginNow'));
      }, 1600);
    } catch {
      setFpError(t('errServerUnreachable'));
    } finally {
      setFpLoading(false);
    }
  };

  const features = [
    { icon: '⚔️', titleKey: 'featureQuestTitle',       descKey: 'featureQuestDesc',       glow: '#8b5cf6' },
    { icon: '🪙', titleKey: 'featureRewardsTitle',     descKey: 'featureRewardsDesc',     glow: '#f59e0b' },
    { icon: '🏆', titleKey: 'featureLeaderboardTitle', descKey: 'featureLeaderboardDesc', glow: '#22d3ee' },
  ];

  const avatarDisplayEmoji = selectedAvatar ? selectedAvatar.emoji : '🖼️';

  return (
    <div className="auth-page-shell">
      <AuthTopNav
        onLoginClick={() => switchMode('login')}
        onStartClick={() => switchMode('register')}
      />
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
            <h1 className="auth-welcome-title">{t('welcomeTitle')}</h1>
            <p className="auth-welcome-name">{form.firstName} {form.lastName}</p>
            <div className="auth-welcome-bonuses">
              <div className="auth-welcome-bonus-chip gold">
                <span>🪙</span>
                <span>{t('welcomeGoldBonus')}</span>
              </div>
              <div className="auth-welcome-bonus-chip heart">
                <span>❤️</span>
                <span>{t('welcomeHeartStart')}</span>
              </div>
            </div>
            <p className="auth-welcome-sub">{t('welcomeSub')}</p>
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
                  <h2 className="fp-modal-title">{t('fpResetTitle')}</h2>
                  <p className="fp-modal-sub">
                    {t('fpResetSub')}
                  </p>
                </div>

                <form onSubmit={handleFpSendCode} className="fp-modal-form" noValidate>
                  {fpError && <div className="auth-banner auth-banner-error">⚠️ {fpError}</div>}
                  <div className="input-group">
                    <label className="input-label">{t('emailAddressLabel')}</label>
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
                    {fpLoading ? t('preparing') : t('getResetCodeBtn')}
                  </button>
                </form>
              </>
            )}


            {/* ── View: Code entry ── */}
            {fpView === 'code' && (
              <>
                <div className="fp-modal-header">
                  <div className="fp-modal-icon">📨</div>
                  <h2 className="fp-modal-title">{t('enterCodeTitle')}</h2>
                  <p className="fp-modal-sub">
                    {fpSuccess || t('enterCodeSub')}
                  </p>
                </div>
                <form onSubmit={handleFpVerifyCode} className="fp-modal-form" noValidate>
                  {fpError && <div className="auth-banner auth-banner-error">⚠️ {fpError}</div>}
                  <div className="input-group">
                    <label className="input-label">{t('verificationCodeLabel')}</label>
                    <OtpDigitInput value={fpCode} onChange={setFpCode} disabled={fpLoading} autoFocus />
                    {fpExpiresAt && (
                      <div className="otp-countdown-row">
                        <span>{t('otpExpiresIn')}</span>
                        <OtpCountdown expiresAt={fpExpiresAt} onExpire={() => setFpError(t('errOtpExpired'))} />
                      </div>
                    )}
                  </div>
                  <div className="fp-resend-row">
                    <button type="button" className="fp-resend-link" onClick={handleFpResendCode} disabled={fpLoading}>
                      {t('resendCode')}
                    </button>
                  </div>
                  <button
                    type="submit"
                    className={`btn btn-primary fp-submit-btn ${fpLoading ? 'btn-loading' : ''}`}
                    disabled={fpLoading || fpCode.length < 6}
                  >
                    {fpLoading ? t('verifying') : t('confirmArrow')}
                  </button>
                </form>
              </>
            )}

            {/* ── View: New password ── */}
            {fpView === 'reset' && (
              <>
                <div className="fp-modal-header">
                  <div className="fp-modal-icon">🔒</div>
                  <h2 className="fp-modal-title">{t('newPasswordTitle')}</h2>
                  <p className="fp-modal-sub">{t('newPasswordSub')}</p>
                </div>
                <form onSubmit={handleFpResetPassword} className="fp-modal-form" noValidate>
                  {fpError && <div className="auth-banner auth-banner-error">⚠️ {fpError}</div>}
                  {fpSuccess && <div className="auth-banner auth-banner-success">✅ {fpSuccess}</div>}
                  <div className="input-group">
                    <label className="input-label">{t('newPasswordLabel')}</label>
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
                        aria-label={fpShowNew ? t('hidePassword') : t('showPassword')}
                      >
                        {fpShowNew ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t('confirmPasswordLabel')}</label>
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
                        aria-label={fpShowConfirm ? t('hidePassword') : t('showPassword')}
                      >
                        {fpShowConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`btn btn-primary fp-submit-btn ${fpLoading ? 'btn-loading' : ''}`}
                    disabled={fpLoading}
                  >
                    {fpLoading ? t('saving') : t('updatePasswordBtn')}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Left Hero Panel — 2.5D glass cards + particles + floating badges ── */}
      <div className="auth-left">
        <ParticleField count={22} colors={['#8b5cf6', '#22d3ee', '#f59e0b']} />

        <motion.div
          className="auth-community-badge"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="auth-community-avatars" aria-hidden="true">
            <span>🎮</span><span>🧙</span><span>⚔️</span><span>🦊</span>
          </span>
          <span>
            <strong>20,000+</strong> {t('authJoinedSuffix')}
          </span>
        </motion.div>

        <div className="auth-hero" style={{ position: 'relative' }}>
          <motion.h1
            className="auth-headline"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
          >
            {t('authHeadlineLine1')}<br />
            <span style={{ color: 'var(--accent-cyan)' }}>{t('authHeadlineLine2')}</span>
          </motion.h1>
          <motion.p
            className="auth-subheadline"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
          >
            {t('authSubheadline')}
          </motion.p>

          {/* ── 3D Tech Globe — the 6 official courses (C#/Java/Python/SQL/C++/React) orbiting a
               glowing sphere, tooltips backed by real enrollment counts ── */}
          <motion.div
            id="auth-courses"
            className="tech-globe-section"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative' }}
          >
            <TechGlobe3D courseStats={courseStats} />
          </motion.div>

          {/* ── Live learning stats ── */}
          <LiveStatsPanel courseStats={courseStats} />

          {/* ── Expanded feature cards ── */}
          <div id="auth-features" className="auth-features">
            {features.map((f, i) => (
              <TiltCard key={f.titleKey} delay={0.25 + i * 0.12} glowColor={f.glow}>
                <div className="auth-feature-icon">{f.icon}</div>
                <div>
                  <h3 className="auth-feature-title">{t(f.titleKey)}</h3>
                  <p className="auth-feature-desc">{t(f.descKey)}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        <div className="auth-glow auth-glow-animated" style={{ top: '10%', left: '20%', background: 'var(--accent-purple)' }} />
        <div className="auth-glow auth-glow-animated" style={{ bottom: '10%', right: '20%', background: 'var(--accent-cyan)', animationDelay: '3s' }} />
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-right">
        <div className={`auth-form-card auth-slide-${slideDir}`} key={mode}>
        <AnimatePresence mode="wait">
        {pendingAuth ? (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            {/* ── OTP / 2FA verification step ── */}
            <div className="auth-form-header">
              <h2 className="auth-form-title">{t('otpTitle')}</h2>
              <p className="auth-form-subtitle">
                {otpInfo || t('otpSubtitleFallback', { email: pendingAuth.email })}
              </p>
            </div>
            {otpError && <div className="auth-banner auth-banner-error">⚠️ {otpError}</div>}
            <form onSubmit={handleVerifyOtp} className="auth-form" noValidate>
              <div className="input-group">
                <label className="input-label">{t('verificationCodeLabel')}</label>
                <OtpDigitInput value={otpCode} onChange={setOtpCode} disabled={otpLoading} autoFocus />
                {otpExpiresAt && (
                  <div className="otp-countdown-row">
                    <span>{t('otpExpiresIn')}</span>
                    <OtpCountdown expiresAt={otpExpiresAt} onExpire={() => setOtpError(t('errOtpExpired'))} />
                  </div>
                )}
              </div>
              <div className="fp-resend-row">
                <button type="button" className="fp-resend-link" onClick={handleResendOtp} disabled={otpLoading}>
                  {t('resendCode')}
                </button>
                <button type="button" className="fp-resend-link" onClick={cancelOtp}>
                  {t('goBack')}
                </button>
              </div>
              <button
                type="submit"
                className={`btn btn-primary fp-submit-btn ${otpLoading ? 'btn-loading' : ''}`}
                disabled={otpLoading || otpCode.length < 6}
              >
                {otpLoading ? t('verifying') : t('confirmAndLogin')}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="auth-form"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
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
                    <h2 className="auth-form-title">{t('createAccountTitle')}</h2>
                    <p className="auth-form-subtitle">{t('createAccountSub')}</p>
                  </div>
                  <form onSubmit={handleStep1} className="auth-form" noValidate>
                    <div className="auth-name-row">
                      <div className="input-group">
                        <label className="input-label">{t('firstNameLabel')}</label>
                        <div className="input-with-icon">
                          <span className="input-icon">👤</span>
                          <input
                            type="text"
                            className="input-field"
                            placeholder={t('firstNamePlaceholder')}
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
                        <label className="input-label">{t('lastNameLabel')}</label>
                        <div className="input-with-icon">
                          <span className="input-icon">👥</span>
                          <input
                            type="text"
                            className="input-field"
                            placeholder={t('lastNamePlaceholder')}
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
                      <label className="input-label">{t('emailAddressLabel')}</label>
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
                      <label className="input-label">{t('passwordLabel')}</label>
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
                          aria-label={showRegPassword ? t('hidePassword') : t('showPassword')}
                        >
                          {showRegPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                      {validationErrors.password && (
                        <span className="field-error-text" style={{ color: 'var(--accent-red)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                          {validationErrors.password}
                        </span>
                      )}
                    </div>

                    <div className="input-group">
                      <label className="input-label">{t('confirmPasswordFieldLabel')}</label>
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
                          aria-label={showRegConfirmPassword ? t('hidePassword') : t('showPassword')}
                        >
                          {showRegConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
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
                      <span>{t('registerBonusPreview')} <strong style={{ color: 'var(--accent-gold-light)' }}>+100 🪙</strong> + <strong style={{ color: '#ef4444' }}>❤️ 3</strong></span>
                    </div>

                    {/* Terms of Service / Privacy Policy acknowledgement — gates progressing to Step 2 */}
                    <TermsCheckbox
                      checked={securityChecked}
                      onChange={(v) => {
                        setSecurityChecked(v);
                        if (v && validationErrors.security) {
                          setValidationErrors({ ...validationErrors, security: '' });
                        }
                      }}
                      error={!!validationErrors.security}
                    />
                    {validationErrors.security && (
                      <span className="field-error-text" style={{ color: 'var(--accent-red)', fontSize: '0.75rem', display: 'block', marginTop: '-0.5rem' }}>
                        {validationErrors.security}
                      </span>
                    )}

                    <button
                      type="submit"
                      id="auth-register-next-btn"
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '0.25rem' }}
                    >
                      {t('nextArrow')}
                    </button>

                    <div className="auth-divider"><span>{t('orDivider')}</span></div>
                    <GoogleSignInButton
                      disabled={loading}
                      onCredential={handleGoogleCredential}
                      onUnavailable={handleGoogleUnavailable}
                    />
                  </form>
                </>
              )}

              {/* ── STEP 2: Avatar Picker + Custom Upload ── */}
              {step === 2 && (
                <>
                  <div className="auth-form-header">
                    <h2 className="auth-form-title">{t('chooseAvatarTitle')}</h2>
                    <p className="auth-form-subtitle">{t('chooseAvatarSub')}</p>
                  </div>

                  <div className="auth-avatar-grid">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.emoji}
                        type="button"
                        className={`auth-avatar-option ${selectedAvatar && selectedAvatar.emoji === av.emoji ? 'selected' : ''}`}
                        style={{ '--av-color': av.color }}
                        onClick={() => {
                          setSelectedAvatar(av);
                          // Clear any uploaded custom image so emoji takes priority
                          setCustomAvatarFile(null);
                          setCustomAvatarPreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        <span className="auth-avatar-emoji">{av.emoji}</span>
                        <span className="auth-avatar-label">{av.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* ── Custom Image Upload ── */}
                  <div className="auth-avatar-upload-zone">
                    <p className="auth-avatar-upload-label">{t('uploadOwnPhoto')}</p>
                    <div className="auth-avatar-upload-row">
                      <label htmlFor="avatar-file-input" className="btn btn-outline auth-upload-btn">
                        {t('chooseImageBtn')}
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
                        {customAvatarPreview ? t('ownPhotoLabel') : (selectedAvatar?.label ?? 'Avatar')} · {t('newPlayerLabel')}
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
                      {t('backArrow')}
                    </button>
                    <button
                      id="auth-register-submit-btn"
                      type="button"
                      className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
                      style={{ flex: 2, fontFamily: 'var(--font-display)', letterSpacing: '1px' }}
                      disabled={loading}
                      onClick={handleRegister}
                    >
                      {loading ? t('loading') : t('registerSubmitBtn')}
                    </button>
                  </div>
                </>
              )}

              {/* ── STEP 3: Splash loading state ── */}
              {step === 3 && !showWelcomeSplash && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
                  <p style={{ fontWeight: 700 }}>{t('redirecting')}</p>
                </div>
              )}
            </>
          )}

          {/* ─────────── LOGIN FLOW ─────────── */}
          {mode === 'login' && (
            <>
              <div className="auth-form-header">
                <h2 className="auth-form-title">{t('loginWelcomeTitle')}</h2>
                <p className="auth-form-subtitle">{t('loginWelcomeSub')}</p>
              </div>

              <form onSubmit={handleLogin} className="auth-form" noValidate>
                <div className="input-group">
                  <label className="input-label">{t('emailAddressLabel')}</label>
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
                  <label className="input-label">{t('passwordLabel')}</label>
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
                      aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
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
                    {t('forgotPassword')}
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

                <div className="auth-divider"><span>{t('orDivider')}</span></div>
                <GoogleSignInButton
                  disabled={loading}
                  onCredential={handleGoogleCredential}
                  onUnavailable={handleGoogleUnavailable}
                />
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
          </motion.div>
        )}
        </AnimatePresence>
        </div>
      </div>
      </div>

      <LandingSections onStart={() => switchMode('register')} onSelectCourse={() => switchMode('register')} />
    </div>
  );
}

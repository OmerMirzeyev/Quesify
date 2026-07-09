import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { shopItems } from '../../data/mockData';

export default function ProfilePage() {
  const {
    user, t, setCurrentTab,
    ownedAvatarIds, activeAvatarId, equipAvatar,
    activeAvatarUrl, setActiveAvatarUrl,
    updateUsername,
    customProfileImage, setCustomProfileImage, clearCustomProfilePhoto,
    failedQuestions, solveFailedQuestion, achievements
  } = useApp();

  const [usernameInput, setUsernameInput] = useState(user.username);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Mistakes Booklet local retry states
  const [activeRetryIdx, setActiveRetryIdx] = useState(null);
  const [retrySelectedOption, setRetrySelectedOption] = useState(null);
  const [retryChecked, setRetryChecked] = useState(false);
  const [retryFeedback, setRetryFeedback] = useState('');
  const [retryIsCorrect, setRetryIsCorrect] = useState(false);

  // All avatar-type shop items
  const allAvatars = shopItems.filter(i => i.itemType === 'avatar');

  // Resolve currently displayed avatar: custom image (activeAvatarUrl / customProfileImage) or active avatar emoji
  const activeAvatarEmoji = activeAvatarUrl || (activeAvatarId
    ? (shopItems.find(i => i.id === activeAvatarId)?.emoji ?? user.emoji)
    : user.emoji);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Yalnız şəkil faylları dəstəklənir (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Fayl həcmi 5MB-dan kiçik olmalıdır.');
      return;
    }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomProfileImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUsername = () => {
    const trimmed = usernameInput.trim();
    if (!trimmed) return;
    updateUsername(trimmed);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const handleEquip = () => {
    if (selectedAvatarId === null) return;
    equipAvatar(selectedAvatarId);
    setSelectedAvatarId(null);
  };

  const rarityClass = (rarity) => {
    if (rarity === 'Legendary') return 'rarity-legendary';
    if (rarity === 'Epic') return 'rarity-epic';
    if (rarity === 'Rare') return 'rarity-rare';
    return 'rarity-common';
  };

  const gameAssets = [
    { icon: '⭐', label: t('assetLevel'), value: user.level, color: 'var(--accent-gold-light)' },
    { icon: '🔷', label: t('assetXp'), value: `${user.xp} / ${user.maxXp}`, color: 'var(--accent-cyan)' },
    { icon: '🪙', label: t('assetGold'), value: user.gold.toLocaleString(), color: 'var(--accent-gold-light)' },
    { icon: '❤️', label: t('assetHearts'), value: `${user.hearts} / 3`, color: '#ef4444' },
    { icon: '🃏', label: t('assetJokers'), value: user.jokers, color: 'var(--accent-purple-light)' },
  ];

  // List of Achievements
  const achievementList = [
    { id: 'firstQuest', title: t('achFirstQuestTitle') || 'İlk Addım', desc: t('achFirstQuestDesc') || 'İlk sualını düzgün cavablandıraraq dərsi bitir.', icon: '🏆', unlocked: achievements?.firstQuest },
    { id: 'goldSaver', title: t('achGoldSaverTitle') || 'Qənaətçil', desc: t('achGoldSaverDesc') || 'Kassanda 500-dən çox qızıl topla.', icon: '💰', unlocked: achievements?.goldSaver },
    { id: 'streakMaster', title: t('achStreakMasterTitle') || 'Ardıcıl Oyunçu', desc: t('achStreakMasterDesc') || '3 günlük aktivlik seriyasını saxla.', icon: '🔥', unlocked: achievements?.streakMaster },
  ];

  // Handle retry within Səhvlər Kitabçası
  const handleCheckRetry = (item) => {
    if (retrySelectedOption === null) {
      setRetryFeedback(t('selectOptionMsg'));
      return;
    }
    const correct = retrySelectedOption === item.correctIndex;
    setRetryIsCorrect(correct);
    setRetryChecked(true);

    if (correct) {
      setRetryFeedback(t('solvedSuccess') || 'Düzgün cavab! Sual kitabçadan silindi.');
      setTimeout(() => {
        solveFailedQuestion(item.questId, item.question);
        // Clear booklet states
        setActiveRetryIdx(null);
        setRetrySelectedOption(null);
        setRetryChecked(false);
        setRetryFeedback('');
      }, 1800);
    } else {
      setRetryFeedback(t('incorrectRetry') || 'Yanlış cavab! Yenidən cəhd edin.');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Page Header ── */}
      <div className="section-header">
        <div>
          <div className="section-title">{t('profileTabTitle')}</div>
          <div className="section-subtitle">{t('profileTabSubtitle')}</div>
        </div>
        {/* Active avatar preview pill */}
        <div className="profile-active-avatar-pill">
          <span style={{ fontSize: '1.7rem', lineHeight: 1, width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', overflow: 'hidden' }}>
            {activeAvatarEmoji && (activeAvatarEmoji.startsWith('data:image') || activeAvatarEmoji.length > 20) ? (
              <img src={activeAvatarEmoji} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              activeAvatarEmoji
            )}
          </span>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('activeAvatar')}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{user.username}</div>
          </div>
        </div>
      </div>

      {/* ── Top Row: Edit + Assets ── */}
      <div className="profile-page-grid">

        {/* SECTION A — Profile Edit */}
        <div className="card profile-edit-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 10% 90%, rgba(139,92,246,0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0,
              }}>✏️</div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{t('profileEditTitle')}</div>
            </div>

            {/* Large Avatar Display — shows custom photo OR emoji */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <div className="profile-edit-avatar-display" style={{ overflow: 'hidden' }}>
                {activeAvatarEmoji && (activeAvatarEmoji.startsWith('data:image') || activeAvatarEmoji.length > 20) ? (
                  <img
                    src={activeAvatarEmoji}
                    alt="Profil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', position: 'relative', zIndex: 1 }}
                  />
                ) : (
                  <span style={{ fontSize: '3.2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>
                    {activeAvatarEmoji}
                  </span>
                )}
                {saveSuccess && <div className="profile-edit-success-ring" />}
              </div>
            </div>

            {/* Username Input */}
            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label className="input-label" htmlFor="profile-username-input">
                {t('profileUsernameLabel')}
              </label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  id="profile-username-input"
                  className="input-field"
                  type="text"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveUsername()}
                  maxLength={30}
                  placeholder={user.username}
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              id="profile-save-btn"
              className={`btn ${saveSuccess ? 'btn-success-flash' : 'btn-primary'} btn-lg`}
              style={{ width: '100%', marginBottom: '1rem' }}
              onClick={handleSaveUsername}
              disabled={!usernameInput.trim()}
            >
              {saveSuccess ? '✅ ' + t('profileSaved') : '💾 ' + t('profileSaveBtn')}
            </button>

            {/* ─── Custom Photo Upload ─── */}
            <div style={{
              border: '1px dashed rgba(139,92,246,0.45)',
              borderRadius: 'var(--radius)',
              padding: '1rem',
              background: 'rgba(139,92,246,0.04)',
              display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'center'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent-purple-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>📷</span> Xüsusi Profil Şəkli Yüklə
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                PNG, JPG, WEBP — maks. 5MB. Şəkil dərhal profilinizə tətbiq edilir.
              </p>
              <label
                htmlFor="profile-photo-upload"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1.2rem',
                  background: 'var(--gradient-primary)',
                  borderRadius: '100px',
                  cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 700,
                  color: 'white',
                  boxShadow: 'var(--glow-purple)',
                  transition: 'filter 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                📁 Şəkil Seç
              </label>
              <input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              {uploadError && (
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--accent-red)', fontWeight: 600 }}>⚠️ {uploadError}</p>
              )}
              {customProfileImage && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: 700 }}>✅ Şəkil tətbiq edildi!</span>
                  <button
                    type="button"
                    style={{ background: 'none', color: 'var(--accent-red)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: 'none' }}
                    onClick={clearCustomProfilePhoto}
                  >
                    ✕ Sil
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION C — Game Assets */}
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 90% 10%, rgba(34,211,238,0.07) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0,
              }}>🎮</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{t('gameAssetsTitle')}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('gameAssetsSubtitle')}</div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600,
              }}>
                <span>{t('assetXp')} {t('profileXpProgress') || 'Progress'}</span>
                <span>{user.xp} / {user.maxXp}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, (user.xp / user.maxXp) * 100)}%` }} />
              </div>
            </div>

            {/* Asset Pills Grid */}
            <div className="asset-summary-grid">
              {gameAssets.map((asset) => (
                <div key={asset.label} className="asset-pill">
                  <div className="asset-pill-icon">{asset.icon}</div>
                  <div className="asset-pill-info">
                    <div className="asset-pill-label">{asset.label}</div>
                    <div className="asset-pill-value" style={{ color: asset.color }}>{asset.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hearts visual row */}
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {t('assetHearts')}
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[1, 2, 3].map(i => (
                  <span key={i} style={{
                    fontSize: '1.4rem',
                    filter: i <= user.hearts
                      ? 'drop-shadow(0 0 6px rgba(239,68,68,0.6))'
                      : 'grayscale(1) opacity(0.22)',
                  }}>❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION D — Səhvlər Kitabçası (Mistakes Review Booklet) ── */}
      <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 10% 10%, rgba(239, 68, 68, 0.05) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <div className="section-title">{t('mistakesTitle')}</div>
              <div className="section-subtitle">{t('mistakesSubtitle')}</div>
            </div>
            <span
              className="badge"
              style={{
                background: failedQuestions.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 211, 238, 0.08)',
                color: failedQuestions.length > 0 ? 'var(--accent-red)' : 'var(--accent-cyan)',
                border: '1px solid currentColor',
                fontWeight: 'bold'
              }}
            >
              {failedQuestions.length} Səhv
            </span>
          </div>

          {failedQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', background: 'var(--bg-input)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✨</div>
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>{t('mistakesEmpty')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {failedQuestions.map((item, idx) => {
                const isRetrying = activeRetryIdx === idx;
                return (
                  <div
                    key={idx}
                    className="mistake-item-card"
                    style={{
                      border: isRetrying ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius)',
                      padding: '1.25rem',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <span className="badge badge-hard" style={{ fontSize: '0.65rem', marginBottom: '0.4rem' }}>{t('level') || 'Level'} {item.questId}</span>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'pre-line' }}>{item.question}</p>
                      </div>
                      <button
                        className={`btn ${isRetrying ? 'btn-danger' : 'btn-primary'} btn-sm`}
                        onClick={() => {
                          if (isRetrying) {
                            setActiveRetryIdx(null);
                            setRetrySelectedOption(null);
                            setRetryChecked(false);
                            setRetryFeedback('');
                          } else {
                            setActiveRetryIdx(idx);
                            setRetrySelectedOption(null);
                            setRetryChecked(false);
                            setRetryFeedback('');
                          }
                        }}
                      >
                        {isRetrying ? t('closeBooklet') : t('retryBtn')}
                      </button>
                    </div>

                    {isRetrying && (
                      <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                          {item.options.map((opt, optIdx) => {
                            const isSelected = retrySelectedOption === optIdx;
                            let btnBg = 'var(--bg-card)';
                            let btnBorder = '1px solid var(--border-color)';
                            
                            if (isSelected) {
                              btnBg = 'rgba(139, 92, 246, 0.08)';
                              btnBorder = '1px solid var(--accent-purple)';
                            }
                            
                            if (retryChecked && isSelected) {
                              if (optIdx === item.correctIndex) {
                                btnBg = 'rgba(34, 197, 94, 0.1)';
                                btnBorder = '2px solid var(--accent-green)';
                              } else {
                                btnBg = 'rgba(239, 68, 68, 0.1)';
                                btnBorder = '2px solid var(--accent-red)';
                              }
                            } else if (retryChecked && optIdx === item.correctIndex) {
                              btnBg = 'rgba(34, 197, 94, 0.05)';
                              btnBorder = '2px solid var(--accent-green)';
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => !retryChecked && setRetrySelectedOption(optIdx)}
                                style={{
                                  padding: '0.75rem 1rem', borderRadius: '8px', background: btnBg, border: btnBorder,
                                  color: 'var(--text-primary)', textAlign: 'left', cursor: retryChecked ? 'default' : 'pointer',
                                  fontSize: '0.85rem', width: '100%', display: 'flex', gap: '0.5rem', alignItems: 'center'
                                }}
                              >
                                <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{String.fromCharCode(65 + optIdx)}.</span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                            💡 <strong>{t('hint')}:</strong> {item.hint}
                          </span>
                          {!retryChecked && (
                            <button
                              className="btn btn-gold btn-sm"
                              onClick={() => handleCheckRetry(item)}
                            >
                              {t('solveBtn')}
                            </button>
                          )}
                        </div>

                        {retryFeedback && (
                          <div style={{
                            marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: 600,
                            color: retryIsCorrect ? 'var(--accent-green)' : 'var(--accent-red)',
                            display: 'flex', alignItems: 'center', gap: '0.3rem'
                          }}>
                            {retryIsCorrect ? '🎉' : '❌'} {retryFeedback}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION E — Achievements Badge Showcase ── */}
      <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 90% 10%, rgba(245, 158, 11, 0.05) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <div className="section-title">{t('achSectionTitle')}</div>
              <div className="section-subtitle">{t('achSectionSubtitle')}</div>
            </div>
          </div>

          <div className="achievements-badge-grid">
            {achievementList.map(ach => (
              <div
                key={ach.id}
                className={`achievement-badge-card ${ach.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-badge-icon">{ach.icon}</div>
                <div className="achievement-badge-content">
                  <div className="achievement-badge-title">{ach.title}</div>
                  <div className="achievement-badge-desc">{ach.desc}</div>
                </div>
                <div className="achievement-badge-status-label">
                  {ach.unlocked ? (
                    <span className="badge badge-easy" style={{ fontSize: '0.65rem' }}>✓ UNLOCKED</span>
                  ) : (
                    <span className="badge badge-common" style={{ fontSize: '0.65rem' }}>LOCKED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION B — Avatar Collection ── */}
      <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(139,92,246,0.09) 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header row */}
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <div className="section-title">{t('avatarCollectionTitle')}</div>
              <div className="section-subtitle">{t('avatarCollectionSubtitle')}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Equip button — visible only when a different owned avatar is selected */}
              {selectedAvatarId !== null
                && selectedAvatarId !== activeAvatarId
                && ownedAvatarIds.includes(selectedAvatarId) && (
                <button
                  id="profile-equip-btn"
                  className="btn btn-primary"
                  onClick={handleEquip}
                >
                  {t('equipBtn')}
                </button>
              )}
              <button
                id="profile-goto-shop-btn"
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentTab('shop')}
              >
                {t('goToShopBtn')}
              </button>
            </div>
          </div>

          {/* Avatar Grid */}
          <div className="avatar-collection-grid">
            {allAvatars.map(avatar => {
              const isOwned = ownedAvatarIds.includes(avatar.id);
              const isActive = activeAvatarId === avatar.id;
              const isSelected = selectedAvatarId === avatar.id;

              return (
                <div
                  key={avatar.id}
                  id={`avatar-card-${avatar.id}`}
                  className={[
                    'avatar-card',
                    isOwned ? 'owned' : 'locked',
                    isActive ? 'active' : '',
                    isSelected ? 'selected' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => isOwned && setSelectedAvatarId(isSelected ? null : avatar.id)}
                  title={isOwned ? avatar.name : `${avatar.name} — ${avatar.price} 🪙`}
                  role={isOwned ? 'button' : undefined}
                  tabIndex={isOwned ? 0 : undefined}
                  onKeyDown={e => isOwned && e.key === 'Enter' && setSelectedAvatarId(isSelected ? null : avatar.id)}
                >
                  {/* Lock overlay for unowned */}
                  {!isOwned && (
                    <div className="avatar-lock-overlay">
                      <span className="avatar-lock-icon">🔒</span>
                      <span className="avatar-lock-price">🪙 {avatar.price}</span>
                    </div>
                  )}

                  {/* Active glow ring */}
                  {isActive && <div className="avatar-active-ring" />}

                  <div className="avatar-card-emoji">{avatar.emoji}</div>

                  <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                    <span className={`badge ${rarityClass(avatar.rarity)}`}>{avatar.rarity}</span>
                  </div>

                  <div className="avatar-card-name">{avatar.name}</div>

                  {/* Status label */}
                  <div className="avatar-card-status">
                    {isActive ? (
                      <span className="avatar-status-active">{t('activeAvatar')}</span>
                    ) : isOwned ? (
                      isSelected
                        ? <span className="avatar-status-selected">→ {t('equipBtn')}</span>
                        : <span className="avatar-status-owned">✓ Owned</span>
                    ) : (
                      <span className="avatar-status-locked">{t('lockedAvatar')}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty collection hint */}
          {ownedAvatarIds.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '1.25rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              borderTop: '1px solid var(--border-subtle)',
              marginTop: '1rem',
            }}>
              🛒 {t('goToShopBtn')} — avatar almaq üçün dükkana gedin!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


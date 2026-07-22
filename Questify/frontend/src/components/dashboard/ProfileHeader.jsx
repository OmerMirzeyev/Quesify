import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { shopItems } from '../../data/mockData';

export default function ProfileHeader() {
  const { user, t, timeUntilNextHeart, activeAvatarId, activeAvatarUrl } = useApp();
  const isAdmin = user.role === 'Admin' || user.role === 'AdminRole';

  // Resolve the displayed avatar: activeAvatarUrl > active avatar emoji > user default emoji
  const resolvedAvatar = activeAvatarUrl || (activeAvatarId
    ? (shopItems.find(i => i.id === activeAvatarId)?.emoji ?? user.emoji)
    : user.emoji);

  const formatTime = (ms) => {
    if (ms <= 0) return t('fullHearts');
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isImageAvatar = resolvedAvatar && (resolvedAvatar.startsWith('data:image') || resolvedAvatar.length > 20);

  return (
    <div className="profile-header card" style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="profile-avatar" style={{ overflow: isImageAvatar ? 'hidden' : 'visible', padding: isImageAvatar ? 0 : undefined }}>
        {isImageAvatar ? (
          <img
            src={resolvedAvatar}
            alt="Profil"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : resolvedAvatar}
      </div>

      {/* Info */}
      <div className="profile-info">
        <div className="profile-name">{user.username}</div>
        <div className="profile-level-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span>{t('profileProgrammer')} · {t('level')} {user.level}</span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.55rem',
              borderRadius: '100px',
              background: isAdmin ? 'rgba(245,158,11,0.15)' : 'rgba(139,92,246,0.15)',
              border: `1px solid ${isAdmin ? 'rgba(245,158,11,0.4)' : 'rgba(139,92,246,0.4)'}`,
              color: isAdmin ? 'var(--accent-gold-light)' : 'var(--accent-purple-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            {isAdmin && <ShieldCheck size={12} />}
            {isAdmin ? t('adminRole') : t('userRole')}
          </span>
        </div>
        <div className="profile-xp-label">
          <span>{t('profileXpProgress')}</span>
          <span>{user.xp} / {user.maxXp} XP</span>
        </div>
        <div className="profile-xp-bar">
          <div
            className="profile-xp-fill"
            style={{ width: `${(user.xp / user.maxXp) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats right side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', minWidth: '150px' }}>
        <div className="profile-gold-box">
          <span className="profile-gold-icon">🪙</span>
          <span className="profile-gold-amount">{isAdmin ? '∞' : user.gold.toLocaleString()}</span>
        </div>

        {/* Hearts UI */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            padding: '0.4rem 0.8rem',
            borderRadius: '8px',
            width: '100%'
          }}
        >
          <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.2rem' }}>
            {[1, 2, 3].map(i => (
              <span 
                key={i} 
                style={{ 
                  fontSize: '1.2rem',
                  filter: i <= user.hearts ? 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.5))' : 'grayscale(1) opacity(0.3)'
                }}
              >
                ❤️
              </span>
            ))}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {user.hearts < 3 ? `${t('newHeartIn')} ${formatTime(timeUntilNextHeart)}` : t('fullHearts')}
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getWeeklyResetRemainingMs, formatWeeklyCountdown } from '../../utils/storage';
import { apiFetch } from '../../utils/api';

const trophies = {
  1: { emoji: '🥇', class: 'rank-1' },
  2: { emoji: '🥈', class: 'rank-2' },
  3: { emoji: '🥉', class: 'rank-3' },
};

const TRACK_TABS = [
  {
    id: 'Global',
    icon: '🌐',
    label: 'Global',
    primaryColor: '#8b5cf6',
    secondaryColor: '#22d3ee',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
    podiumGradient: ['linear-gradient(180deg,#8b5cf6,#7c3aed)', 'linear-gradient(180deg,#94a3b8,#64748b)', 'linear-gradient(180deg,#22d3ee,#0891b2)'],
    tagline: 'Bütün dillər üzrə ümumi sıralama',
    statLabel: 'Ümumi XP',
    glowColor: 'rgba(139,92,246,0.25)',
    borderColor: 'rgba(139,92,246,0.4)',
    bgColor: 'rgba(139,92,246,0.06)',
  },
  {
    id: 'C#',
    icon: '📦',
    label: 'C#',
    primaryColor: '#a855f7',
    secondaryColor: '#7c3aed',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    podiumGradient: ['linear-gradient(180deg,#a855f7,#7c3aed)', 'linear-gradient(180deg,#94a3b8,#64748b)', 'linear-gradient(180deg,#c084fc,#a855f7)'],
    tagline: 'C# proqramçılarının mübarizəsi',
    statLabel: 'C# XP',
    glowColor: 'rgba(168,85,247,0.25)',
    borderColor: 'rgba(168,85,247,0.4)',
    bgColor: 'rgba(168,85,247,0.06)',
  },
  {
    id: 'Python',
    icon: '🐍',
    label: 'Python',
    primaryColor: '#3b82f6',
    secondaryColor: '#fbbf24',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #fbbf24 100%)',
    podiumGradient: ['linear-gradient(180deg,#3b82f6,#1d4ed8)', 'linear-gradient(180deg,#94a3b8,#64748b)', 'linear-gradient(180deg,#fbbf24,#d97706)'],
    tagline: 'Python ustaları arasında yarışın',
    statLabel: 'Python XP',
    glowColor: 'rgba(59,130,246,0.25)',
    borderColor: 'rgba(59,130,246,0.4)',
    bgColor: 'rgba(59,130,246,0.06)',
  },
  {
    id: 'Java',
    icon: '☕',
    label: 'Java',
    primaryColor: '#f97316',
    secondaryColor: '#ea580c',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    podiumGradient: ['linear-gradient(180deg,#f97316,#ea580c)', 'linear-gradient(180deg,#94a3b8,#64748b)', 'linear-gradient(180deg,#fb923c,#f97316)'],
    tagline: 'Java geliştiricilerinin savaşı',
    statLabel: 'Java XP',
    glowColor: 'rgba(249,115,22,0.25)',
    borderColor: 'rgba(249,115,22,0.4)',
    bgColor: 'rgba(249,115,22,0.06)',
  },
];

export default function Leaderboard() {
  const { getLeaderboard, user, t, customProfileImage, trackStats, sessionEmail } = useApp();
  const [activeTrack, setActiveTrack] = useState('Global');
  const [weeklyRemaining, setWeeklyRemaining] = useState(getWeeklyResetRemainingMs());

  useEffect(() => {
    const interval = setInterval(() => {
      setWeeklyRemaining(getWeeklyResetRemainingMs());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const trackConfig = TRACK_TABS.find((t) => t.id === activeTrack) || TRACK_TABS[0];

  const rawList = getLeaderboard(activeTrack);

  // Pull every player's *current* DB-persisted avatar (not just what happened to be cached in
  // this browser) so custom photos/avatars uploaded elsewhere show up here too.
  const [dbAvatars, setDbAvatars] = useState({});
  useEffect(() => {
    const emails = rawList.map((u) => u.email).filter(Boolean);
    if (emails.length === 0) return;
    let cancelled = false;
    apiFetch('/api/users/avatars', { method: 'POST', auth: true, body: { emails } })
      .then(({ ok, data }) => {
        if (!cancelled && ok && Array.isArray(data)) {
          const map = {};
          data.forEach((u) => { map[u.email] = u; });
          setDbAvatars(map);
        }
      })
      .catch(() => { /* offline — fall back to locally-cached emoji below */ });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrack, rawList.length]);

  const preparedList = rawList.map((u) => {
    const dbAvatar = dbAvatars[u.email];
    if (u.isCurrentUser) {
      if (activeTrack === 'Global') {
        return { ...u, name: user.username, level: user.level, emoji: user.emoji, customProfileImage };
      }
      const myTrack = trackStats[activeTrack] || { xp: 0, gold: 0 };
      return { ...u, name: user.username, level: user.level, gold: myTrack.gold, xp: myTrack.xp, emoji: user.emoji, customProfileImage };
    }
    return {
      ...u,
      emoji: dbAvatar?.emoji || u.emoji,
      customProfileImage: dbAvatar?.avatarUrl || null,
    };
  });

  const sorted = [...preparedList].sort((a, b) => b.xp - a.xp || b.gold - a.gold);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="section-header">
        <div>
          <div className="section-title">{t('lbTitle')}</div>
          <div className="section-subtitle" style={{ color: trackConfig.primaryColor, fontWeight: 700 }}>
            {trackConfig.tagline}
          </div>
        </div>
      </div>

      {/* ── Track tab switcher ── */}
      <div
        className="card lb-track-switcher"
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.65rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          borderColor: activeTrack ? trackConfig.borderColor : 'var(--border-color)',
          boxShadow: `0 0 24px ${trackConfig.glowColor}`,
          transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
        }}
      >
        {TRACK_TABS.map((tab) => {
          const isActive = activeTrack === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={`lb-tab-${tab.id.toLowerCase()}`}
              className={`btn btn-sm lb-track-tab ${isActive ? 'lb-track-tab-active' : ''}`}
              onClick={() => setActiveTrack(tab.id)}
              style={{
                flex: '1 1 90px',
                fontWeight: 800,
                background: isActive ? tab.gradient : 'transparent',
                color: isActive ? '#fff' : tab.primaryColor,
                border: `2px solid ${isActive ? 'transparent' : tab.primaryColor + '55'}`,
                boxShadow: isActive ? `0 0 20px ${tab.glowColor}` : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Weekly reset + prize badge ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'stretch' }}>
        <div
          className="card"
          style={{
            flex: '1 1 240px',
            padding: '0.85rem 1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            border: `1px solid ${trackConfig.borderColor}`,
            background: trackConfig.bgColor,
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>⏳</span>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Həftəlik Sıfırlama
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: trackConfig.primaryColor }}>
              Həftəlik mükafat üçün qalan vaxt:{' '}
              <span style={{ fontFamily: 'monospace' }}>{formatWeeklyCountdown(weeklyRemaining)}</span>
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            flex: '1 1 200px',
            padding: '0.85rem 1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            border: `1px solid rgba(245, 158, 11, 0.35)`,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(234,88,12,0.06) 100%)',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)',
          }}
        >
          <span style={{ fontSize: '1.6rem' }}>🏆</span>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold-light)', fontWeight: 800, textTransform: 'uppercase' }}>
              1-ci Yer Mükafatı
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-gold-light)' }}>
              +500 🪙 Gold
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '0.5rem 1rem',
            background: trackConfig.bgColor,
            border: `1px solid ${trackConfig.borderColor}`,
            borderRadius: '100px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: trackConfig.primaryColor,
            alignSelf: 'center',
          }}
        >
          {sorted.length} {t('programmers')} · {trackConfig.icon} {trackConfig.label}
        </div>
      </div>

      {/* ── Empty state ── */}
      {sorted.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-secondary)',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius)',
            border: '1px dashed var(--border-color)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏁</div>
          <p style={{ margin: 0, fontWeight: 600 }}>{activeTrack} liderlər cədvəlində hələ oyunçu yoxdur.</p>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Qeydiyyatdan keçin və bu dil yolunda XP qazanmağa başlayın!
          </p>
        </div>
      ) : (
        <>
          {/* ── Podium (top 3) ── */}
          {sorted.length >= 3 && (
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
              }}
            >
              {sorted.slice(0, 3).map((userItem, idx) => {
                const rank = idx + 1;
                const trophy = trophies[rank];
                const heights = [140, 110, 90];
                const delays = ['0.1s', '0.05s', '0.15s'];

                return (
                  <div
                    key={userItem.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      animation: `fadeIn 0.5s ease ${delays[idx]} both`,
                      order: idx === 0 ? 0 : idx === 1 ? -1 : 1,
                    }}
                  >
                    {rank === 1 && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '100px',
                          background: 'rgba(245,158,11,0.2)',
                          border: '1px solid rgba(245,158,11,0.5)',
                          color: 'var(--accent-gold-light)',
                        }}
                      >
                        +500 🪙
                      </span>
                    )}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: rank === 1 ? `2px solid ${trackConfig.primaryColor}` : 'none',
                        boxShadow: rank === 1 ? `0 0 12px ${trackConfig.glowColor}` : 'none',
                      }}
                    >
                      {userItem.customProfileImage ? (
                        <img src={userItem.customProfileImage} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : userItem.emoji}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{userItem.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {t('level')} {userItem.level} · {trackConfig.label}
                    </div>
                    <div
                      style={{
                        width: 90,
                        height: heights[idx],
                        background: trackConfig.podiumGradient[idx],
                        borderRadius: '12px 12px 0 0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        paddingTop: '0.6rem',
                        fontSize: '1.8rem',
                        boxShadow: rank === 1 ? `0 0 20px ${trackConfig.glowColor}` : 'none',
                      }}
                    >
                      {trophy.emoji}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Full table ── */}
          <div className="leaderboard-table">
            {sorted.map((userItem, idx) => {
              const rank = idx + 1;
              const trophy = trophies[rank];

              return (
                <div
                  key={userItem.id}
                  id={`lb-row-${userItem.id}`}
                  className={`leaderboard-row ${userItem.isCurrentUser ? 'current-user' : ''}`}
                  style={{
                    animationDelay: `${idx * 0.05}s`,
                    borderLeft: userItem.isCurrentUser ? `3px solid ${trackConfig.primaryColor}` : '3px solid transparent',
                  }}
                >
                  <div className={`rank-badge ${trophy ? trophy.class : 'rank-other'}`}>
                    {trophy ? trophy.emoji : rank}
                  </div>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                      flexShrink: 0,
                      borderRadius: '50%',
                      overflow: 'hidden',
                    }}
                  >
                    {userItem.customProfileImage ? (
                      <img src={userItem.customProfileImage} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : userItem.emoji}
                  </div>
                  <div className="lb-user-info">
                    <div className="lb-user-name">
                      {userItem.name}
                      {userItem.isCurrentUser && <span className="you-badge">{t('youBadge')}</span>}
                      {rank === 1 && (
                        <span
                          style={{
                            marginLeft: '0.35rem',
                            fontSize: '0.62rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '100px',
                            background: 'rgba(245,158,11,0.15)',
                            color: 'var(--accent-gold-light)',
                            fontWeight: 800,
                          }}
                        >
                          +500🪙
                        </span>
                      )}
                    </div>
                    <div className="lb-user-level">
                      ⚔️ {t('level')} {userItem.level} · {trackConfig.icon} {trackConfig.label}
                    </div>
                  </div>
                  <div className="lb-stats">
                    <div className="lb-stat">
                      <span className="lb-stat-value xp" style={{ color: trackConfig.primaryColor }}>⚡ {userItem.xp.toLocaleString()}</span>
                      <span className="lb-stat-label">{trackConfig.statLabel}</span>
                    </div>
                    <div className="lb-stat">
                      <span className="lb-stat-value gold">🪙 {userItem.gold.toLocaleString()}</span>
                      <span className="lb-stat-label">{t('gold')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

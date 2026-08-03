import React, { useState, useEffect } from 'react';
import { Crown, Trophy, Medal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getWeeklyResetRemainingMs, formatWeeklyCountdown } from '../../utils/storage';
import { apiFetch } from '../../utils/api';

const trophies = {
  1: { emoji: '🥇', class: 'rank-1' },
  2: { emoji: '🥈', class: 'rank-2' },
  3: { emoji: '🥉', class: 'rank-3' },
};

// Top-3 podium reward tiers — icon, glow/border color, and the translated reward copy shown
// on the podium card and in the full-table reward badge.
const PODIUM_REWARDS = {
  1: { Icon: Crown, color: '#fbbf24', glow: 'rgba(251,191,36,0.55)', rewardKey: 'podiumGoldReward' },
  2: { Icon: Trophy, color: '#cbd5e1', glow: 'rgba(203,213,225,0.5)', rewardKey: 'podiumSilverReward' },
  3: { Icon: Medal, color: '#d97706', glow: 'rgba(217,119,6,0.45)', rewardKey: 'podiumBronzeReward' },
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
  const { getLeaderboard, loadTrackLeaderboard, user, t, customProfileImage } = useApp();
  const [activeTrack, setActiveTrack] = useState('Global');
  const [weeklyRemaining, setWeeklyRemaining] = useState(getWeeklyResetRemainingMs());

  useEffect(() => {
    const interval = setInterval(() => {
      setWeeklyRemaining(getWeeklyResetRemainingMs());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Per-course tabs are backend-authoritative (see LeaderboardController's ?course= branch) —
  // fetch that track's rows the moment its tab is selected. Global is loaded once at login (see
  // AppContext) and refreshed elsewhere, so it's excluded here.
  useEffect(() => {
    if (activeTrack !== 'Global') loadTrackLeaderboard(activeTrack);
  }, [activeTrack, loadTrackLeaderboard]);

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
      // Every track is backend-authoritative now — xp/streak come from the live row (u); only
      // cosmetic identity fields are refreshed locally.
      return { ...u, name: user.username, emoji: user.emoji, customProfileImage };
    }
    return {
      ...u,
      emoji: dbAvatar?.emoji || u.emoji,
      customProfileImage: dbAvatar?.avatarUrl || u.customProfileImage || null,
    };
  });

  const sorted = [...preparedList].sort((a, b) => b.xp - a.xp || (b.gold || 0) - (a.gold || 0));

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
              {t('lbWeeklyReset')}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: trackConfig.primaryColor }}>
              {t('lbWeeklyRemaining')}{' '}
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
              {t('lbFirstPlacePrize')}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-gold-light)' }}>
              {t('podiumGoldReward')}
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
          <p style={{ margin: 0, fontWeight: 600 }}>{activeTrack} {t('lbEmptyTitle')}</p>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('lbEmptySubtitle')}
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
                const reward = PODIUM_REWARDS[rank];
                const RewardIcon = reward.Icon;
                const heights = [140, 110, 90];
                const delays = ['0.1s', '0.05s', '0.15s'];

                return (
                  <div
                    key={userItem.id}
                    className="podium-card"
                    title={t(reward.rewardKey)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '1rem 0.85rem 0.75rem',
                      borderRadius: 'var(--radius)',
                      border: `1.5px solid ${reward.color}`,
                      boxShadow: `0 0 26px ${reward.glow}, 0 0 8px ${reward.glow} inset`,
                      background: `linear-gradient(180deg, ${reward.color}14 0%, transparent 65%)`,
                      animation: `fadeIn 0.5s ease ${delays[idx]} both`,
                      order: idx === 0 ? 0 : idx === 1 ? -1 : 1,
                    }}
                  >
                    <RewardIcon size={22} color={reward.color} style={{ filter: `drop-shadow(0 0 6px ${reward.glow})` }} />
                    <span
                      className="podium-reward-tag"
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '100px',
                        background: `${reward.color}22`,
                        border: `1px solid ${reward.color}88`,
                        color: reward.color,
                        textAlign: 'center',
                        maxWidth: '110px',
                      }}
                    >
                      {t(reward.rewardKey)}
                    </span>
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
                        border: `2px solid ${reward.color}`,
                        boxShadow: `0 0 12px ${reward.glow}`,
                      }}
                    >
                      {userItem.customProfileImage ? (
                        <img src={userItem.customProfileImage} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : userItem.emoji}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{userItem.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {t('lbStreakDays', { count: userItem.streak || 0 })}
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
                        boxShadow: `0 0 20px ${reward.glow}`,
                      }}
                    >
                      {trophies[rank].emoji}
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
                      {PODIUM_REWARDS[rank] && (
                        <span
                          title={t(PODIUM_REWARDS[rank].rewardKey)}
                          style={{
                            marginLeft: '0.35rem',
                            fontSize: '0.62rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '100px',
                            background: `${PODIUM_REWARDS[rank].color}22`,
                            border: `1px solid ${PODIUM_REWARDS[rank].color}88`,
                            color: PODIUM_REWARDS[rank].color,
                            fontWeight: 800,
                            cursor: 'help',
                          }}
                        >
                          {t('podiumRewardLabel')} 🎁
                        </span>
                      )}
                    </div>
                    <div className="lb-user-level">
                      {t('lbStreakDays', { count: userItem.streak || 0 })}
                    </div>
                  </div>
                  <div className="lb-stats">
                    <div className="lb-stat">
                      <span className="lb-stat-value xp" style={{ color: trackConfig.primaryColor }}>⚡ {userItem.xp.toLocaleString()}</span>
                      <span className="lb-stat-label">{trackConfig.statLabel}</span>
                    </div>
                    <div className="lb-stat">
                      <span className="lb-stat-value gold">🔥 {(userItem.streak || 0).toLocaleString()}</span>
                      <span className="lb-stat-label">{t('lbStreakStat')}</span>
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

import React from 'react';
import { useApp } from '../../context/AppContext';

const trophies = {
  1: { emoji: '🥇', class: 'rank-1' },
  2: { emoji: '🥈', class: 'rank-2' },
  3: { emoji: '🥉', class: 'rank-3' },
};

export default function Leaderboard() {
  const { usersList, user, t, customProfileImage } = useApp();

  const preparedList = usersList.map(u => {
    if (u.isCurrentUser) {
      return {
        ...u,
        name: user.username,
        level: user.level,
        gold: user.gold,
        xp: user.xp,
        emoji: user.emoji,
        customProfileImage: customProfileImage
      };
    }
    return u;
  });

  const sorted = [...preparedList].sort((a, b) => b.xp - a.xp);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="section-header">
        <div>
          <div className="section-title">{t('lbTitle')}</div>
          <div className="section-subtitle">{t('lbSubtitle')}</div>
        </div>
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-gold-light)' }}>
          {sorted.length} {t('programmers')}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)', background: 'var(--bg-input)', borderRadius: 'var(--radius)', border: '1px dashed var(--border-color)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏁</div>
          <p style={{ margin: 0, fontWeight: 600 }}>Hələ heç bir oyunçu yoxdur.</p>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qeydiyyatdan keçən hesablar burada görünəcək.</p>
        </div>
      ) : (
        <>
      {sorted.length >= 3 && (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {sorted.slice(0, 3).map((userItem, idx) => {
            const rank = idx + 1;
            const trophy = trophies[rank];
            const heights = [140, 110, 90];
            const delays = ['0.1s', '0.05s', '0.15s'];

            return (
              <div key={userItem.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', animation: `fadeIn 0.5s ease ${delays[idx]} both`, order: idx === 0 ? 0 : idx === 1 ? -1 : 1 }}>
                <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', borderRadius: '50%', overflow: 'hidden' }}>
                  {userItem.customProfileImage ? (
                    <img src={userItem.customProfileImage} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    userItem.emoji
                  )}
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{userItem.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  {t('level')} {userItem.level}
                </div>
                <div style={{ width: 90, height: heights[idx], background: rank === 1 ? 'linear-gradient(180deg, #f59e0b, #d97706)' : rank === 2 ? 'linear-gradient(180deg, #94a3b8, #64748b)' : 'linear-gradient(180deg, #b45309, #92400e)', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '0.6rem', fontSize: '1.8rem', boxShadow: rank === 1 ? '0 0 20px rgba(245,158,11,0.5)' : rank === 2 ? '0 0 15px rgba(148,163,184,0.3)' : '0 0 15px rgba(180,83,9,0.3)' }}>
                  {trophy.emoji}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="leaderboard-table">
        {sorted.map((userItem, idx) => {
          const rank = idx + 1;
          const trophy = trophies[rank];

          return (
            <div key={userItem.id} id={`lb-row-${userItem.id}`} className={`leaderboard-row ${userItem.isCurrentUser ? 'current-user' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className={`rank-badge ${trophy ? trophy.class : 'rank-other'}`}>
                {trophy ? trophy.emoji : rank}
              </div>
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0, borderRadius: '50%', overflow: 'hidden' }}>
                {userItem.customProfileImage ? (
                  <img src={userItem.customProfileImage} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  userItem.emoji
                )}
              </div>
              <div className="lb-user-info">
                <div className="lb-user-name">
                  {userItem.name}
                  {userItem.isCurrentUser && <span className="you-badge">{t('youBadge')}</span>}
                </div>
                <div className="lb-user-level">⚔️ {t('level')} {userItem.level} {t('profileProgrammer')}</div>
              </div>
              <div className="lb-stats">
                <div className="lb-stat">
                  <span className="lb-stat-value xp">⚡ {userItem.xp.toLocaleString()}</span>
                  <span className="lb-stat-label">XP</span>
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

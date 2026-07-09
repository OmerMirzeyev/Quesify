import React from 'react';
import { useApp } from '../../context/AppContext';
import ProfileHeader from './ProfileHeader';
import DailyStreak from './DailyStreak';
import QuestsGrid from './QuestsGrid';
import OnboardSelector from './OnboardSelector';

const TRACK_META = {
  'C#': { icon: '📦', color: 'var(--accent-purple-light)' },
  Java: { icon: '☕', color: 'var(--accent-gold-light)' },
  Python: { icon: '🐍', color: 'var(--accent-cyan)' },
};

export default function Dashboard() {
  const {
    activeProgrammingLanguage,
    setActiveProgrammingLanguage,
    unlockedLanguages,
    unlockLanguage,
    ALL_TRACKS,
    t,
  } = useApp();

  if (!activeProgrammingLanguage || unlockedLanguages.length === 0) {
    return (
      <div className="page-content--scrollable" style={{ height: '100%', overflowY: 'auto' }}>
        <OnboardSelector />
      </div>
    );
  }

  const lockedTracks = ALL_TRACKS.filter((lang) => !unlockedLanguages.includes(lang));

  return (
    <div className="dashboard-game-layout h-full overflow-hidden">
      <div className="dashboard-fixed-chrome">
        {/* Track switcher */}
        <div
          className="card"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.65rem 1rem',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🎓</span>
            <div>
              <strong style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('switchTrackLabel')}
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Kurs: <strong style={{ color: 'var(--accent-purple-light)' }}>{activeProgrammingLanguage}</strong>
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {unlockedLanguages.map((lang) => {
              const isActive = activeProgrammingLanguage === lang;
              const meta = TRACK_META[lang];
              return (
                <button
                  key={lang}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                  style={{ minWidth: '64px', fontWeight: 700, padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                  onClick={() => setActiveProgrammingLanguage(lang)}
                >
                  {meta?.icon} {lang}
                </button>
              );
            })}
          </div>
        </div>

        {lockedTracks.length > 0 && (
          <div
            className="card"
            style={{
              padding: '0.65rem 1rem',
              border: '1px dashed rgba(139, 92, 246, 0.45)',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(6,182,212,0.04) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--accent-purple-light)' }}>
              🌍 Yeni Dil Əlavə Et
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {lockedTracks.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => unlockLanguage(lang)}
                  style={{ fontWeight: 700, fontSize: '0.72rem' }}
                >
                  + {lang}
                </button>
              ))}
            </div>
          </div>
        )}

        <ProfileHeader />
        <DailyStreak />
      </div>

      {/* Independent scrollable game map board */}
      <QuestsGrid />
    </div>
  );
}

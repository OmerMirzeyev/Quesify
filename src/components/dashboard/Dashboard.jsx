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
    return <OnboardSelector />;
  }

  const lockedTracks = ALL_TRACKS.filter((lang) => !unlockedLanguages.includes(lang));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        animation: 'fadeIn 0.4s ease',
      }}
    >
      {/* Active track switcher — only unlocked languages */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.85rem 1.25rem',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🎓</span>
          <div>
            <strong
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t('switchTrackLabel')}
            </strong>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Kurs:{' '}
              <strong style={{ color: 'var(--accent-purple-light)' }}>
                {activeProgrammingLanguage}
              </strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {unlockedLanguages.map((lang) => {
            const isActive = activeProgrammingLanguage === lang;
            const meta = TRACK_META[lang];
            return (
              <button
                key={lang}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  minWidth: '70px',
                  fontWeight: 700,
                  boxShadow: isActive ? 'var(--glow-purple)' : 'none',
                  borderColor: isActive ? 'var(--accent-purple)' : 'var(--border-color)',
                  padding: '0.35rem 0.65rem',
                }}
                onClick={() => setActiveProgrammingLanguage(lang)}
              >
                {meta?.icon} {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Yeni Dil Əlavə Et panel */}
      {lockedTracks.length > 0 && (
        <div
          className="card"
          style={{
            padding: '1rem 1.25rem',
            border: '1px dashed rgba(139, 92, 246, 0.45)',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(6,182,212,0.04) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: lockedTracks.length ? '0.85rem' : 0,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: 'var(--accent-purple-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>🌍</span> Yeni Dil Əlavə Et
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Profilinizə rəsmi olaraq yeni proqramlaşdırma yolu əlavə edin və aralarında keçid edin.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {lockedTracks.map((lang) => {
              const meta = TRACK_META[lang];
              return (
                <button
                  key={lang}
                  type="button"
                  className="btn btn-outline"
                  onClick={() => unlockLanguage(lang)}
                  style={{
                    flex: '1 1 140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontWeight: 700,
                    borderColor: 'rgba(139, 92, 246, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-purple)';
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{meta?.icon}</span>
                  <span style={{ color: meta?.color }}>{lang}</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '100px',
                      background: 'var(--gradient-primary)',
                      color: 'white',
                      fontWeight: 800,
                    }}
                  >
                    ƏLAVƏ ET
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <ProfileHeader />
      <DailyStreak />
      <QuestsGrid />
    </div>
  );
}

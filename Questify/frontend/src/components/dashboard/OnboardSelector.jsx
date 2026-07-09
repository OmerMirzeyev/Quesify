import React from 'react';
import { useApp } from '../../context/AppContext';

export default function OnboardSelector() {
  const { selectPrimaryLanguage, t } = useApp();

  const tracks = [
    {
      id: 'C#',
      logo: '📦',
      color: 'rgba(139, 92, 246, 0.4)',
      hoverGlow: 'var(--glow-purple)',
      title: 'C#',
      desc: t('onboardCardDescCSharp'),
    },
    {
      id: 'Java',
      logo: '☕',
      color: 'rgba(245, 158, 11, 0.4)',
      hoverGlow: 'var(--glow-gold)',
      title: 'Java',
      desc: t('onboardCardDescJava'),
    },
    {
      id: 'Python',
      logo: '🐍',
      color: 'rgba(34, 211, 238, 0.4)',
      hoverGlow: 'var(--glow-cyan)',
      title: 'Python',
      desc: t('onboardCardDescPython'),
    },
  ];

  return (
    <div className="onboard-container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h1 className="onboard-title">{t('onboardTitle')}</h1>
      <p className="onboard-subtitle">{t('onboardSubtitle')}</p>
      <p
        style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          maxWidth: 520,
          margin: '0 auto 1.5rem',
        }}
      >
        Əvvəlcə əsas dilinizi seçin. Digər dilləri (Java, Python) daha sonra paneldən əlavə edə bilərsiniz.
      </p>

      <div className="onboard-grid">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="onboard-card"
            style={{
              '--card-glow': track.color,
              '--card-hover-glow': track.hoverGlow,
            }}
            onClick={() => selectPrimaryLanguage(track.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && selectPrimaryLanguage(track.id)}
          >
            <div className="onboard-card-logo">{track.logo}</div>
            <h2 className="onboard-card-title">{track.title}</h2>
            <p className="onboard-card-desc">{track.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

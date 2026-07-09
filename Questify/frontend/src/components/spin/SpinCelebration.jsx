import React, { useMemo } from 'react';

const CONFETTI_COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4', '#22c55e', '#ec4899', '#ef4444', '#fbbf24'];

export default function SpinCelebration({ result, onClose }) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.8}s`,
        duration: `${2.2 + Math.random() * 1.5}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
      })),
    []
  );

  if (!result) return null;

  const { reward } = result;
  const isWin = reward.value > 0;
  const isGold = reward.type === 'gold';
  const isXp = reward.type === 'xp';

  const headline = isWin ? 'TƏBRİKLƏR! 🎡' : 'Yenidən Cəhd Et! 💪';
  const rewardLine = isGold && isWin
    ? `+${reward.value} Qızıl qazandınız!`
    : isXp && isWin
      ? `+${reward.value} XP qazandınız!`
      : 'Bu dəfə şans sizin tərəfinizdə deyil.';

  return (
    <div className="spin-celebration-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="spin-confetti-layer" aria-hidden="true">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="spin-confetti-piece"
            style={{
              left: c.left,
              animationDelay: c.delay,
              animationDuration: c.duration,
              background: c.color,
              width: c.size,
              height: c.size * 0.55,
              transform: `rotate(${c.rotate}deg)`,
            }}
          />
        ))}
      </div>

      <div
        className={`spin-victory-card ${isWin ? 'spin-victory-win' : 'spin-victory-neutral'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="spin-victory-glow" />
        <div className="spin-victory-icon">{isGold ? '🪙' : isXp ? '⚡' : '🎰'}</div>
        <h2 className="spin-victory-headline">{headline}</h2>
        <p className="spin-victory-reward">{rewardLine}</p>
        {isWin && (
          <div className="spin-victory-burst">
            {'✨🎊⭐🎉💫'.split('').map((e, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.12}s` }}>{e}</span>
            ))}
          </div>
        )}
        <button type="button" className="btn btn-primary btn-xl spin-victory-btn" onClick={onClose}>
          Əla!
        </button>
      </div>
    </div>
  );
}

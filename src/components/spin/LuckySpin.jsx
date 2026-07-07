import React, { useState, useRef, useEffect } from 'react';
import { spinRewards } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

const NUM_SEG = spinRewards.length;
const SEG_DEG = 360 / NUM_SEG;
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LuckySpin() {
  const { addGold, addXp, t, lastSpinTime, recordSpin } = useApp();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSpinTime !== null) {
        const elapsed = Date.now() - lastSpinTime;
        const remaining = Math.max(0, COOLDOWN_MS - elapsed);
        setCountdown(remaining);
      } else {
        setCountdown(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSpinTime]);

  const canSpin = lastSpinTime === null || Date.now() - lastSpinTime >= COOLDOWN_MS;

  const SIZE = 310;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = CX - 8;
  const INNER_R = 28;

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;

    const winIndex = Math.floor(Math.random() * NUM_SEG);
    const reward = spinRewards[winIndex];

    const winAngle = winIndex * SEG_DEG + SEG_DEG / 2;
    const targetVisual = (360 - winAngle + 360) % 360;
    const currentVisual = rotation % 360;
    let delta = (targetVisual - currentVisual + 360) % 360;
    if (delta < SEG_DEG) delta += 360;
    const totalDelta = 5 * 360 + delta;

    setRotation(prev => prev + totalDelta);
    setIsSpinning(true);
    setResult(null);
    const spinTimestamp = Date.now();
    recordSpin(spinTimestamp);
    setCountdown(COOLDOWN_MS);

    setTimeout(() => {
      setIsSpinning(false);
      setResult({ reward, index: winIndex });
      setShowModal(true);
      if (reward.type === 'gold') addGold(reward.value);
      else if (reward.type === 'xp') addXp(reward.value);
    }, 4200);
  };

  const closeModal = () => setShowModal(false);

  const resultEmoji =
    result?.reward.type === 'gold' ? '🪙' :
    result?.reward.type === 'xp' ? '⚡' : '🎰';

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="section-header">
        <div>
          <div className="section-title">{t('spinTitle')}</div>
          <div className="section-subtitle">{t('spinSubtitle')}</div>
        </div>
        {/* Cooldown / Ready badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1.25rem',
          background: canSpin ? 'rgba(34,197,94,0.1)' : 'rgba(139,92,246,0.1)',
          border: `1px solid ${canSpin ? 'rgba(34,197,94,0.35)' : 'var(--border-color)'}`,
          borderRadius: '100px', fontWeight: 700, fontSize: '0.88rem',
          color: canSpin ? 'var(--accent-green)' : 'var(--accent-purple-light)',
          fontFamily: canSpin ? 'inherit' : 'monospace',
          minWidth: 140, justifyContent: 'center'
        }}>
          {canSpin ? '✅ Fırlanmağa Hazır!' : `⏳ ${formatCountdown(countdown)}`}
        </div>
      </div>

      {/* Cooldown info bar */}
      {!canSpin && (
        <div style={{
          background: 'rgba(139,92,246,0.06)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          fontSize: '0.85rem', color: 'var(--text-secondary)'
        }}>
          <span style={{ fontSize: '1.3rem' }}>🎡</span>
          <span>
            Növbəti fırlanma hüququnuz: <strong style={{ color: 'var(--accent-purple-light)', fontFamily: 'monospace', fontSize: '1rem' }}>{formatCountdown(countdown)}</strong> sonra.
            Gündəlik spin limiti — 1 dəfə / 24 saat.
          </span>
        </div>
      )}

      <div className="spin-container">
        <div className="wheel-wrapper">
          <div className="wheel-pointer" />
          <div className="wheel-svg-wrapper">
            <div style={{ width: SIZE, height: SIZE, transform: `rotate(${rotation}deg)`, transformOrigin: 'center', transition: isSpinning ? 'transform 4.2s cubic-bezier(0.17, 0.67, 0.08, 0.99)' : 'none' }}>
              <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                {spinRewards.map((reward, i) => {
                  const startAngle = i * SEG_DEG;
                  const endAngle = (i + 1) * SEG_DEG;
                  const midAngle = startAngle + SEG_DEG / 2;
                  const textR = R * 0.63;
                  const textPt = polarToCartesian(CX, CY, textR, midAngle);
                  return (
                    <g key={i}>
                      <path d={slicePath(CX, CY, R, startAngle, endAngle)} fill={reward.color} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
                      <text x={textPt.x} y={textPt.y} textAnchor="middle" dominantBaseline="middle" fontSize={reward.label.length > 7 ? '9' : '11'} fontWeight="700" fill="white" style={{ userSelect: 'none' }} transform={`rotate(${midAngle}, ${textPt.x}, ${textPt.y})`}>
                        {reward.label}
                      </text>
                    </g>
                  );
                })}
                {spinRewards.map((_, i) => {
                  const angle = i * SEG_DEG;
                  const pt = polarToCartesian(CX, CY, R, angle);
                  return <line key={`line-${i}`} x1={CX} y1={CY} x2={pt.x} y2={pt.y} stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />;
                })}
                <circle cx={CX} cy={CY} r={INNER_R} fill="#07071a" stroke="#8b5cf6" strokeWidth="3" />
                <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="18" style={{ userSelect: 'none' }}>
                  {isSpinning ? '⭐' : '🎯'}
                </text>
              </svg>
            </div>
          </div>
        </div>

        <button
          id="spin-btn"
          className={`btn btn-primary btn-xl ${isSpinning || !canSpin ? 'btn-disabled' : ''}`}
          onClick={handleSpin}
          disabled={isSpinning || !canSpin}
          style={{
            fontFamily: 'var(--font-display)', letterSpacing: '2px', minWidth: 200, fontSize: '1rem',
            animation: !isSpinning && canSpin ? 'glowPulse 2s ease-in-out infinite' : 'none',
            opacity: !canSpin && !isSpinning ? 0.55 : 1
          }}
        >
          {isSpinning ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spinStar 0.6s linear infinite', display: 'inline-block', flexShrink: 0 }} />
              {t('spinning')}
            </span>
          ) : !canSpin ? (
            <span>⏳ {formatCountdown(countdown)}</span>
          ) : t('spinBtn')}
        </button>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 400 }}>
          {spinRewards.map((r) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600, background: `${r.color}22`, border: `1px solid ${r.color}44`, color: r.color }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
              {r.label}
            </div>
          ))}
        </div>
      </div>

      {showModal && result && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <span className="spin-result-emoji">{resultEmoji}</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', background: result.reward.type === 'gold' ? 'var(--gradient-gold)' : 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem' }}>
              {result.reward.value > 0 ? 'Təbriklər! 🎉' : 'Yenidən Cəhd Et! 💪'}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {result.reward.type === 'gold' && result.reward.value > 0 && <>Siz <strong style={{ color: 'var(--accent-gold-light)', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>+{result.reward.value} 🪙</strong> qızıl sikkə qazandınız!</>}
              {result.reward.type === 'xp' && <>Siz <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>+{result.reward.value} ⚡ XP</strong> qazandınız!</>}
              {result.reward.type === 'none' && 'Bu dəfə şans sizin tərəfinizdə deyil. Növbəti cəhddə uğurlar!'}
            </p>
            <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 'var(--radius)', padding: '0.6rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ⏳ Növbəti spin: <strong style={{ color: 'var(--accent-purple-light)', fontFamily: 'monospace' }}>{formatCountdown(countdown)}</strong> sonra
            </div>
            {result.reward.value > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '1.5rem', marginBottom: '1.25rem', animation: 'fadeIn 0.5s ease' }}>
                {'🎊🎉✨🎊🎉'.split('').map((e, i) => <span key={i} style={{ animationDelay: `${i * 0.1}s`, animation: 'coinBounce 0.8s ease infinite' }}>{e}</span>)}
              </div>
            )}
            <button id="spin-modal-close-btn" className="btn btn-primary btn-xl" style={{ width: '100%', fontFamily: 'var(--font-display)', letterSpacing: '1px' }} onClick={closeModal}>
              ✅ {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

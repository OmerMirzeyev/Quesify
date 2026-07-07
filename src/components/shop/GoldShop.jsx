import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { shopItems } from '../../data/mockData';

function formatWeekCountdown(purchasedAt) {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const elapsed = Date.now() - purchasedAt;
  const remaining = Math.max(0, WEEK_MS - elapsed);
  if (remaining === 0) return null;
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hrs = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const mins = Math.floor((remaining % (60 * 60 * 1000)) / 60000);
  if (days > 0) return `${days}g ${hrs}s`;
  if (hrs > 0) return `${hrs}s ${mins}d`;
  return `${mins}d`;
}

export default function GoldShop() {
  const { user, purchasedItems, buyItem, t, heartPotionPurchasedAt } = useApp();
  const [tick, setTick] = useState(0);

  // Refresh countdown every minute
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const heartPotionLocked = heartPotionPurchasedAt !== null && (Date.now() - heartPotionPurchasedAt) < WEEK_MS;

  const rarityClass = (rarity) =>
    rarity === 'Legendary' ? 'rarity-legendary' :
    rarity === 'Epic' ? 'rarity-epic' :
    rarity === 'Rare' ? 'rarity-rare' : 'rarity-common';

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="section-header">
        <div>
          <div className="section-title">{t('shopTitle')}</div>
          <div className="section-subtitle">{t('shopSubtitle')}</div>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-gold-light)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.4rem 1rem', borderRadius: '100px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          🪙 {user.gold.toLocaleString()}
        </div>
      </div>

      <div className="shop-grid">
        {shopItems.map((item) => {
          const isAvatarOrBadge = item.itemType === 'avatar' || item.itemType === 'badge';
          const isOwned = isAvatarOrBadge && purchasedItems.includes(item.id);
          const canAfford = user.gold >= item.price;
          const isPotionLocked = item.itemType === 'potion_heart' && heartPotionLocked;
          const weekCountdown = item.itemType === 'potion_heart' && heartPotionPurchasedAt
            ? formatWeekCountdown(heartPotionPurchasedAt)
            : null;

          let actionBtn;
          if (isOwned) {
            actionBtn = (
              <button className="btn btn-outline btn-disabled" disabled style={{ width: '100%', marginTop: 'auto', fontSize: '0.82rem' }}>
                ✅ {t('owned')}
              </button>
            );
          } else if (isPotionLocked) {
            actionBtn = (
              <button className="btn btn-disabled" disabled style={{ width: '100%', marginTop: 'auto', fontSize: '0.75rem', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: 'var(--accent-red)' }}>
                ⚠️ Stokda yoxdur{weekCountdown ? ` — ${weekCountdown}` : ''}
              </button>
            );
          } else {
            actionBtn = (
              <button
                className={`btn btn-gold ${!canAfford ? 'btn-disabled' : ''}`}
                disabled={!canAfford}
                onClick={() => buyItem(item)}
                style={{ width: '100%', marginTop: 'auto', fontSize: '0.82rem' }}
              >
                {t('buyFor', { price: item.price })}
              </button>
            );
          }

          return (
            <div
              key={item.id}
              className={`shop-card ${isOwned ? 'owned' : ''}`}
              style={{
                background: item.gameBg,
                borderColor: isOwned ? 'rgba(34,197,94,0.4)' : item.gameBorder,
                position: 'relative', overflow: 'hidden'
              }}
            >
              {/* Game label badge */}
              <div style={{
                position: 'absolute', top: '0.5rem', right: '0.5rem',
                fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.5px',
                color: item.gameColor, background: `${item.gameColor}18`,
                border: `1px solid ${item.gameColor}44`,
                borderRadius: '100px', padding: '0.1rem 0.45rem',
                textTransform: 'uppercase'
              }}>
                {item.game}
              </div>

              {/* Big emoji with glow */}
              <div className="shop-item-emoji" style={{ filter: `drop-shadow(0 0 12px ${item.gameColor}88)` }}>
                {item.emoji}
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span className={`badge ${rarityClass(item.rarity)}`}>{item.rarity}</span>
                <span className="badge" style={{ background: 'var(--bg-input)', fontSize: '0.65rem' }}>{item.type}</span>
              </div>

              <div className="shop-item-name">{item.name}</div>

              {/* Description */}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.45, marginBottom: '0.75rem', paddingHorizontal: '0.25rem' }}>
                {item.desc}
              </div>

              {actionBtn}
            </div>
          );
        })}
      </div>
    </div>
  );
}

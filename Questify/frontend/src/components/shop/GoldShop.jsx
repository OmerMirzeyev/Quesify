import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Minus, Plus, Infinity as InfinityIcon, CheckCircle2, Shirt } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { shopItems as staticShopItems } from '../../data/mockData';

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

const RARITY_OPTS = ['Common', 'Rare', 'Epic', 'Legendary'];
const TYPE_OPTS = ['Avatar', 'Nişan', 'İksir', 'Joker', 'Çərçivə', 'Tema'];
const ITEM_TYPE_OPTS = ['avatar', 'badge', 'potion_heart', 'joker_5050', 'streak_freeze', 'double_xp', 'frame', 'theme'];
const EQUIPPABLE_TYPES = ['avatar', 'frame', 'theme'];

const defaultNewItem = {
  name: '', emoji: '⭐', type: 'Avatar', itemType: 'avatar', price: 100,
  rarity: 'Common', game: 'Questify', gameColor: '#8b5cf6',
  gameBg: 'linear-gradient(135deg,#8b5cf622 0%,#5b21b622 100%)',
  gameBorder: 'rgba(139,92,246,0.4)', desc: '', stock: null
};

export default function GoldShop() {
  const {
    user, purchasedItems, buyItem, t, heartPotionPurchasedAt,
    dynamicShopItems, adminAddShopItem, adminDeleteShopItem, adminSetShopItemStock,
    coins, hasUnlimitedCoins, marketInventory, equipMarketItem
  } = useApp();

  const [tick, setTick] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState(defaultNewItem);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const isAdmin = user?.role === 'Admin';

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

  // Use dynamic items from backend if available, otherwise fall back to static mock data
  const shopItems = dynamicShopItems.length > 0 ? dynamicShopItems : staticShopItems;

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    adminAddShopItem(newItem);
    setShowAddModal(false);
    setNewItem(defaultNewItem);
  };

  const handleDeleteConfirm = (itemId) => {
    const item = shopItems.find(i => i.id === itemId);
    if (item) adminDeleteShopItem(itemId, item.name);
    setDeleteConfirmId(null);
  };

  const adjustStock = (item, delta) => {
    const current = item.stock ?? 0;
    const next = Math.max(0, current + delta);
    adminSetShopItemStock(item.id, next);
  };

  const setUnlimitedStock = (item) => {
    adminSetShopItemStock(item.id, null, true);
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="section-header">
        <div>
          <div className="section-title">{t('shopTitle')}</div>
          <div className="section-subtitle">{t('shopSubtitle')}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <PlusCircle size={15} /> Yeni İtem
            </button>
          )}
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-gold-light)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.4rem 1rem', borderRadius: '100px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            🪙 {hasUnlimitedCoins ? '∞' : coins.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="shop-grid">
        {shopItems.map((item) => {
          const singleOwnedTypes = ['avatar', 'badge', 'frame', 'theme'];
          const inventoryRow = marketInventory.find((i) => i.shopItemId === item.id);
          const isOwned = singleOwnedTypes.includes(item.itemType) && !!inventoryRow;
          const isEquippable = EQUIPPABLE_TYPES.includes(item.itemType);
          const isEquipped = isOwned && isEquippable && inventoryRow?.isEquipped;
          const canAfford = hasUnlimitedCoins || coins >= item.price;
          const isPotionLocked = item.itemType === 'potion_heart' && heartPotionLocked;
          const weekCountdown = item.itemType === 'potion_heart' && heartPotionPurchasedAt
            ? formatWeekCountdown(heartPotionPurchasedAt)
            : null;
          const hasLimitedStock = typeof item.stock === 'number';
          const outOfStock = hasLimitedStock && item.stock <= 0;

          let actionBtn;
          if (isOwned && isEquippable) {
            actionBtn = isEquipped ? (
              <button className="btn btn-outline btn-disabled" disabled style={{ width: '100%', marginTop: 'auto', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={15} /> Taxılıb
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => equipMarketItem(item.id)}
                style={{ width: '100%', marginTop: 'auto', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
              >
                <Shirt size={15} /> Geyin
              </button>
            );
          } else if (isOwned) {
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
          } else if (outOfStock) {
            actionBtn = (
              <button className="btn btn-disabled" disabled style={{ width: '100%', marginTop: 'auto', fontSize: '0.75rem', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: 'var(--accent-red)' }}>
                📦 Stok bitib
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

              {/* Admin delete button */}
              {isAdmin && (
                <button
                  onClick={() => setDeleteConfirmId(item.id)}
                  style={{
                    position: 'absolute', top: '0.5rem', left: '0.5rem',
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                    color: 'var(--accent-red)', borderRadius: '6px',
                    padding: '0.1rem 0.4rem', fontSize: '0.68rem', cursor: 'pointer',
                    fontWeight: 700
                  }}
                  title="Bu itemi sil"
                >
                  <Trash2 size={13} />
                </button>
              )}

              {/* Big emoji with glow */}
              <div className="shop-item-emoji" style={{ filter: `drop-shadow(0 0 12px ${item.gameColor}88)` }}>
                {item.emoji}
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span className={`badge ${rarityClass(item.rarity)}`}>{item.rarity}</span>
                <span className="badge" style={{ background: 'var(--bg-input)', fontSize: '0.65rem' }}>{item.type}</span>
                {hasLimitedStock && (
                  <span
                    className="badge"
                    style={{
                      background: outOfStock ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.08)',
                      color: outOfStock ? 'var(--accent-red)' : 'var(--accent-green)',
                      fontSize: '0.65rem',
                    }}
                  >
                    📦 {item.stock}
                  </span>
                )}
              </div>

              <div className="shop-item-name">{item.name}</div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                {item.desc}
              </div>

              {/* Admin stock controls */}
              {isAdmin && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  marginBottom: '0.6rem', padding: '0.3rem 0.5rem',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed var(--border-color)',
                }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.1rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}
                    onClick={() => adjustStock(item, -1)}
                    disabled={!hasLimitedStock || item.stock <= 0}
                    title="Stoku azalt"
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, minWidth: '54px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                    {hasLimitedStock ? `Stok: ${item.stock}` : <><InfinityIcon size={13} /> Limitsiz</>}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.1rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}
                    onClick={() => hasLimitedStock ? adjustStock(item, 1) : adminSetShopItemStock(item.id, 10)}
                    title={hasLimitedStock ? 'Stoku artır' : 'Limitli stok təyin et (10)'}
                  >
                    <Plus size={12} />
                  </button>
                  {hasLimitedStock ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.1rem 0.5rem', fontSize: '0.68rem', display: 'flex', alignItems: 'center' }}
                      onClick={() => setUnlimitedStock(item)}
                      title="Limiti götür"
                    >
                      <InfinityIcon size={13} />
                    </button>
                  ) : null}
                </div>
              )}

              {actionBtn}
            </div>
          );
        })}
      </div>

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.25rem', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ➕ Yeni Mağaza İtemi
            </h3>

            {[
              { label: 'Ad', key: 'name', type: 'text' },
              { label: 'Emoji', key: 'emoji', type: 'text' },
              { label: 'Qiymət (Gold)', key: 'price', type: 'number' },
              { label: 'Oyun adı (Game)', key: 'game', type: 'text' },
              { label: 'Təsvir (Desc)', key: 'desc', type: 'text' },
              { label: 'Rəng (GameColor hex)', key: 'gameColor', type: 'text' },
            ].map(field => (
              <div key={field.key} className="input-group">
                <label className="input-label">{field.label}</label>
                <input
                  type={field.type}
                  className="input-field"
                  value={newItem[field.key]}
                  onChange={e => setNewItem(prev => ({ ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                />
              </div>
            ))}

            <div className="input-group">
              <label className="input-label">Növ (Type)</label>
              <select className="input-field" value={newItem.type} onChange={e => setNewItem(prev => ({ ...prev, type: e.target.value }))}>
                {TYPE_OPTS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Item Type (itemType)</label>
              <select className="input-field" value={newItem.itemType} onChange={e => setNewItem(prev => ({ ...prev, itemType: e.target.value }))}>
                {ITEM_TYPE_OPTS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Stok (boş = limitsiz)</label>
              <input
                type="number"
                min={0}
                className="input-field"
                value={newItem.stock ?? ''}
                placeholder="Limitsiz"
                onChange={e => setNewItem(prev => ({ ...prev, stock: e.target.value === '' ? null : Number(e.target.value) }))}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Nadir dərəcəsi (Rarity)</label>
              <select className="input-field" value={newItem.rarity} onChange={e => setNewItem(prev => ({ ...prev, rarity: e.target.value }))}>
                {RARITY_OPTS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Ləğv et</button>
              <button className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} onClick={handleAddItem}>
                <CheckCircle2 size={15} /> Əlavə Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '320px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent-red)' }}><Trash2 size={40} /></div>
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--accent-red)' }}>İtemi Sil?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Bu itemi mağazadan silmək istədiyinizə əminsinizmi?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteConfirmId(null)}>Ləğv et</button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--accent-red)', borderColor: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
              >
                <Trash2 size={15} /> Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

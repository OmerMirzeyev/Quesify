import React, { useEffect, useRef } from 'react';

export default function NotificationDropdown({
  isOpen,
  onClose,
  notifications = [],
  markAllNotificationsRead,
  clearNotifications,
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const bellBtn = document.getElementById('nav-notification-bell');
        if (bellBtn && bellBtn.contains(event.target)) return;
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTime = (timestamp) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'İndi';
    if (diffMins < 60) return `${diffMins} dəq əvvəl`;
    if (diffHrs < 24) return `${diffHrs} saat əvvəl`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div ref={dropdownRef} className="notification-dropdown-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', borderBottom: '1px solid var(--border-color)', background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.05))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.15rem' }}>🔔</span>
          <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>Bildirişlər</span>
          {unreadCount > 0 && (
            <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'var(--accent-red)', color: '#fff', padding: '0.12rem 0.45rem', borderRadius: '100px' }}>
              {unreadCount} yeni
            </span>
          )}
        </div>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }} title="Bağla">
          ✕
        </button>
      </div>

      {notifications.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.74rem', background: 'rgba(255,255,255,0.02)' }}>
          <button type="button" onClick={markAllNotificationsRead} style={{ background: 'none', border: 'none', color: 'var(--accent-purple-light)', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
            ✓ Hamısını oxundu et
          </button>
          <button type="button" onClick={clearNotifications} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
            Təmizlə
          </button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '340px' }}>
        {notifications.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1.5rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Heç bir bildiriş yoxdur</span>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: notif.isRead ? 'transparent' : 'rgba(139,92,246,0.06)',
                transition: 'background 0.2s ease',
              }}
            >
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                {notif.icon || '🔔'}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: notif.isRead ? 500 : 700, color: notif.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.4, display: 'block' }}>
                  {notif.message}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{formatTime(notif.timestamp)}</span>
              </div>
              {!notif.isRead && (
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-red)', alignSelf: 'center', boxShadow: '0 0 8px var(--accent-red)' }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ThemeToggle from './ThemeToggle';
import { isAppAdmin } from '../../utils/storage';
import NotificationDropdown from './NotificationDropdown';

export default function Navigation() {
  const {
    user,
    currentTab,
    setCurrentTab,
    logout,
    language,
    setLanguage,
    t,
    notifications,
    markAllNotificationsRead,
    clearNotifications,
    userRole,
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const baseTabs = [
    { id: 'dashboard', label: t('navDashboard'), icon: '🏠' },
    { id: 'shop', label: t('navShop'), icon: '🛒' },
    { id: 'spin', label: t('navSpin'), icon: '🎡' },
    { id: 'leaderboard', label: t('navLeaderboard'), icon: '🏆' },
    { id: 'friends', label: t('navFriends') || 'Dostlar', icon: '👥' },
    { id: 'profile', label: t('navProfile'), icon: '👤' },
  ];

  // Append Admin tab if user is admin
  const tabs = isAppAdmin(userRole)
    ? [...baseTabs, { id: 'admin', label: t('navAdmin'), icon: '🛡️' }]
    : baseTabs;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleBellClick = () => {
    setIsDropdownOpen(prev => !prev);
  };

  return (
    <nav className="nav" style={{ position: 'relative' }}>
      {/* Logo */}
      <div className="nav-logo">QUESTIFY</div>

      {/* Tabs */}
      <div className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            className={`nav-tab ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setCurrentTab(tab.id);
              setIsDropdownOpen(false);
            }}
          >
            <span>{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Right side: Language, Gold, Notification Bell, Theme, Logout */}
      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        
        {/* Language Selector */}
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '0.3rem 0.5rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          <option value="az">AZ</option>
          <option value="tr">TR</option>
          <option value="en">EN</option>
        </select>

        {/* Gold Badge */}
        <div className="nav-gold-badge">
          🪙 <span id="nav-gold-count">{user.gold.toLocaleString()}</span>
        </div>

        {/* Notification Bell — dropdown opens below, no tab change */}
        <div style={{ position: 'relative' }}>
          <button
            id="nav-notification-bell"
            onClick={handleBellClick}
            title={unreadCount > 0 ? `${unreadCount} yeni bildiriş` : 'Bildirişlər'}
            style={{
              position: 'relative',
              background: isDropdownOpen ? 'rgba(139, 92, 246, 0.15)' : 'none',
              border: isDropdownOpen ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid transparent',
              cursor: 'pointer',
              padding: '0.35rem 0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              borderRadius: '8px',
              transition: 'transform 0.2s ease, background 0.2s ease',
              color: unreadCount > 0 ? '#facc15' : 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: unreadCount > 0 ? 'bellRing 1.2s ease-in-out infinite' : 'none', transformOrigin: 'top center' }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span id="nav-unread-badge" style={{ position: 'absolute', top: '-2px', right: '-2px', minWidth: '18px', height: '18px', padding: '0 4px', borderRadius: '9999px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 8px rgba(239,68,68,0.8)', animation: 'badgePulse 1.4s ease-in-out infinite', border: '1.5px solid var(--bg-card)' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            notifications={notifications}
            markAllNotificationsRead={markAllNotificationsRead}
            clearNotifications={clearNotifications}
          />
        </div>

        <ThemeToggle />
        
        <button
          id="nav-logout-btn"
          className="btn btn-ghost btn-sm"
          onClick={logout}
          title={t('logout')}
        >
          🚪
        </button>
      </div>

      {/* Keyframe animations injected inline */}
      <style>{`
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          15%       { transform: rotate(18deg); }
          30%       { transform: rotate(-16deg); }
          45%       { transform: rotate(12deg); }
          60%       { transform: rotate(-8deg); }
          75%       { transform: rotate(4deg); }
        }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1);    box-shadow: 0 0 8px rgba(239,68,68,0.7); }
          50%       { transform: scale(1.18); box-shadow: 0 0 14px rgba(239,68,68,0.95); }
        }
      `}</style>
    </nav>
  );
}

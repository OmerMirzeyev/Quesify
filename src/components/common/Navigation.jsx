import React from 'react';
import { useApp } from '../../context/AppContext';
import ThemeToggle from './ThemeToggle';
import { isAdminRole } from '../../utils/storage';

export default function Navigation() {
  const { user, currentTab, setCurrentTab, logout, language, setLanguage, t } = useApp();

  const baseTabs = [
    { id: 'dashboard', label: t('navDashboard'), icon: '🏠' },
    { id: 'shop', label: t('navShop'), icon: '🛒' },
    { id: 'spin', label: t('navSpin'), icon: '🎡' },
    { id: 'leaderboard', label: t('navLeaderboard'), icon: '🏆' },
    { id: 'profile', label: t('navProfile'), icon: '👤' },
  ];

  // Append Admin tab if user is admin
  const tabs = isAdminRole(user.role)
    ? [...baseTabs, { id: 'admin', label: t('navAdmin'), icon: '🛡️' }]
    : baseTabs;

  return (
    <nav className="nav">
      {/* Logo */}
      <div className="nav-logo">QUESTIFY</div>

      {/* Tabs */}
      <div className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            className={`nav-tab ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => setCurrentTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Right side: Language, Gold, Theme, Logout */}
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
    </nav>
  );
}

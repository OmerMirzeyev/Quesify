import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AuthPage from './components/auth/AuthPage';
import MainApp from './components/MainApp';
import { isAdminRole } from './utils/storage';

function AppContent() {
  const { isLoggedIn, isHydrated, user, currentTab, setCurrentTab } = useApp();
  const isAdmin = isAdminRole(user.role);

  // Kick demoted admins off the Admin panel immediately
  useEffect(() => {
    if (isLoggedIn && currentTab === 'admin' && !isAdmin) {
      setCurrentTab('dashboard');
    }
  }, [isLoggedIn, currentTab, isAdmin, setCurrentTab]);

  if (!isHydrated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          background: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(139, 92, 246, 0.25)',
            borderTopColor: 'var(--accent-purple)',
            borderRadius: '50%',
            animation: 'spinStar 0.8s linear infinite',
          }}
        />
        <span style={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.5px' }}>
          QUESTIFY yüklənir...
        </span>
      </div>
    );
  }

  return isLoggedIn ? <MainApp /> : <AuthPage />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

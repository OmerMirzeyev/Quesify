import React from 'react';
import { useApp } from '../context/AppContext';
import Navigation from './common/Navigation';
import Dashboard from './dashboard/Dashboard';
import GoldShop from './shop/GoldShop';
import LuckySpin from './spin/LuckySpin';
import Leaderboard from './leaderboard/Leaderboard';
import AdminPanel from './admin/AdminPanel';
import ProfilePage from './profile/ProfilePage';
import Chatbot from './common/Chatbot';

export default function MainApp() {
  const { currentTab, toast, achievementToast } = useApp();

  const renderTab = () => {
    switch (currentTab) {
      case 'dashboard':   return <Dashboard />;
      case 'shop':        return <GoldShop />;
      case 'spin':        return <LuckySpin />;
      case 'leaderboard': return <Leaderboard />;
      case 'admin':       return <AdminPanel />;
      case 'profile':     return <ProfilePage />;
      default:            return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Navigation />

      {/* Real-time Achievement Pop-up Notification */}
      {achievementToast && (
        <div className="achievement-toast-overlay" role="alert">
          <div className="achievement-toast-card">
            <span className="achievement-toast-icon">{achievementToast.icon}</span>
            <div className="achievement-toast-body">
              <strong className="achievement-toast-title">🏆 Nailiyyət Qazanıldı!</strong>
              <span className="achievement-toast-desc">
                {achievementToast.title} ({achievementToast.rewardText})
              </span>
            </div>
          </div>
        </div>
      )}

      <main className="page-content">
        {renderTab()}
      </main>

      {/* Toast notification */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span style={{ fontSize: '1.1rem' }}>{toast.icon}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <Chatbot />
    </div>
  );
}

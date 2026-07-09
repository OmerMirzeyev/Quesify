import React from 'react';
import { useApp } from '../../context/AppContext';

export default function DailyStreak() {
  const { t } = useApp();
  
  const days = [
    { name: 'B.e', status: 'completed' },
    { name: 'Ç.a', status: 'completed' },
    { name: 'Çə', status: 'completed' },
    { name: 'C.a', status: 'completed' },
    { name: 'Cü', status: 'today' },
    { name: 'Şə', status: 'upcoming' },
    { name: 'Ba', status: 'upcoming' },
  ];

  return (
    <div className="card" style={{ marginTop: '1.25rem' }}>
      <div className="section-header">
        <div>
          <div className="section-title">{t('dailyStreakTitle')}</div>
          <div className="section-subtitle">{t('dailyStreakSubtitle')}</div>
        </div>
        <div style={{ fontSize: '2rem' }}>🔥</div>
      </div>

      <div className="streak-container">
        {days.map((day, idx) => (
          <div key={idx} className="streak-day">
            <div className="streak-day-label">{day.name}</div>
            <div className={`streak-circle ${day.status}`}>
              {day.status === 'completed' ? '✓' : day.status === 'today' ? '⭐' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

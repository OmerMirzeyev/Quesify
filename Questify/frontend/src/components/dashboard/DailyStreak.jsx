import React from 'react';
import { useApp } from '../../context/AppContext';

export default function DailyStreak() {
  const { t, streak, language } = useApp();
  const current = streak?.current ?? 0;
  const highest = streak?.highest ?? 0;

  // Last 7 calendar days ending today — "completed" covers the trailing run of the current
  // streak (excluding today itself, which gets its own "today" marker), "upcoming" is everything
  // before that run started.
  const days = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 6; // -6..0, 0 = today
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const label = date.toLocaleDateString(language, { weekday: 'short' }).slice(0, 3);
    const isToday = offset === 0;
    const daysAgo = -offset;
    const isCompleted = !isToday && daysAgo < current;
    return { name: label, status: isToday ? 'today' : isCompleted ? 'completed' : 'upcoming' };
  });

  return (
    <div className="card" style={{ marginTop: '1.25rem' }}>
      <div className="section-header">
        <div>
          <div className="section-title">{t('dailyStreakTitle')}</div>
          <div className="section-subtitle">
            {t('currentStreakLabel')}: <strong style={{ color: 'var(--text-primary)' }}>{current} 🔥</strong>
            {highest > current && <> · {t('bestStreakLabel')}: {highest}</>}
          </div>
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

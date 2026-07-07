import React from 'react';
import { useApp } from '../../context/AppContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useApp();

  return (
    <button
      id="theme-toggle-btn"
      className="theme-toggle"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Açıq Tema' : 'Qaranlıq Tema'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ThemeToggle({ glass = false }) {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle-btn"
      className={`theme-toggle ${glass ? 'theme-toggle-glass' : ''}`}
      onClick={toggleTheme}
      title={isDark ? 'Açıq Tema' : 'Qaranlıq Tema'}
      aria-label={isDark ? 'Açıq temaya keç' : 'Qaranlıq temaya keç'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          className="theme-toggle-icon"
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {isDark ? <Moon size={17} /> : <Sun size={17} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

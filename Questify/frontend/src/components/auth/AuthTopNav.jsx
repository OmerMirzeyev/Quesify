import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';

export default function AuthTopNav({ onLoginClick, onStartClick }) {
  const { t } = useApp();

  return (
    <motion.header
      className="auth-topnav"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="auth-topnav-logo">
        <div className="auth-logo">Q</div>
        <span className="auth-brand-name">QUESTIFY</span>
      </div>

      <nav className="auth-topnav-links" aria-label="Landing navigation">
        <a href="#auth-features" className="auth-topnav-link">{t('navFeatures')}</a>
        <a href="#landing-languages" className="auth-topnav-link">{t('navCourses')}</a>
        <a href="#landing-about" className="auth-topnav-link">{t('navAbout')}</a>
      </nav>

      <div className="auth-topnav-right">
        <ThemeToggle glass />
        <LanguageSelector />
        <button type="button" className="btn-ghost auth-topnav-btn" onClick={onLoginClick}>
          {t('loginBtn')}
        </button>
        <button type="button" className="btn btn-primary auth-topnav-btn" onClick={onStartClick}>
          {t('getStartedBtn')}
        </button>
      </div>
    </motion.header>
  );
}

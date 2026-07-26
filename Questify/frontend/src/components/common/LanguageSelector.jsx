import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const LANGUAGES = [
  { code: 'az', label: 'AZ', name: 'Azərbaycan' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ru', label: 'RU', name: 'Русский' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useApp();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const active = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="lang-selector" ref={wrapRef}>
      <button
        type="button"
        className="lang-selector-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe size={15} />
        <span>{active.label}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="lang-selector-menu"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {LANGUAGES.map((l) => (
              <button
                type="button"
                key={l.code}
                role="option"
                aria-selected={l.code === language}
                className={`lang-selector-option ${l.code === language ? 'active' : ''}`}
                onClick={() => {
                  setLanguage(l.code);
                  setOpen(false);
                }}
              >
                <span className="lang-selector-option-code">{l.label}</span>
                <span className="lang-selector-option-name">{l.name}</span>
                {l.code === language && <Check size={14} className="lang-selector-check" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

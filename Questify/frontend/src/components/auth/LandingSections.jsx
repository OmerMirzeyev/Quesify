import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Map, ShoppingBag, Trophy, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';

// Static fallback shown until GET /api/courses resolves (or if it's unreachable) — same six
// entries the backend's CourseSeeder ships, so the layout never flashes empty.
const FALLBACK_COURSES = [
  { slug: 'C#', name: 'C#', icon: '🟣', isAvailable: true },
  { slug: 'Java', name: 'Java', icon: '☕', isAvailable: true },
  { slug: 'Python', name: 'Python', icon: '🐍', isAvailable: true },
  { slug: 'SQL', name: 'SQL', icon: '🗄️', isAvailable: false },
  { slug: 'C++', name: 'C++', icon: '🔴', isAvailable: false },
  { slug: 'React', name: 'React', icon: '⚛️', isAvailable: false },
];

// Localized descriptions stay client-side (the API only owns catalog/availability/order) —
// keyed by the same Slug the backend seeds.
const DESC_KEY_BY_SLUG = {
  'C#': 'langDescCSharp',
  Java: 'langDescJava',
  Python: 'langDescPython',
  SQL: 'langDescSql',
  'C++': 'langDescCpp',
  React: 'langDescReact',
};

const HOW_IT_WORKS = [
  { icon: Map, color: '#8b5cf6', titleKey: 'howMapTitle', descKey: 'howMapDesc' },
  { icon: ShoppingBag, color: '#f59e0b', titleKey: 'howShopTitle', descKey: 'howShopDesc' },
  { icon: Trophy, color: '#22d3ee', titleKey: 'howLeaderboardTitle', descKey: 'howLeaderboardDesc' },
  { icon: Users, color: '#22c55e', titleKey: 'howCommunityTitle', descKey: 'howCommunityDesc' },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0 },
};

function RevealSection({ id, children, style }) {
  return (
    <motion.section
      id={id}
      className="landing-section"
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={sectionVariants}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  );
}

export default function LandingSections({ onStart, onSelectCourse }) {
  const { t } = useApp();
  const [courses, setCourses] = useState(FALLBACK_COURSES);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/courses')
      .then(({ ok, data }) => {
        if (!cancelled && ok && Array.isArray(data) && data.length > 0) setCourses(data);
      })
      .catch(() => { /* offline — keep the static fallback */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      {/* ── About ── */}
      <RevealSection id="landing-about">
        <div className="landing-section-inner landing-about">
          <span className="landing-eyebrow">{t('landingAboutEyebrow')}</span>
          <h2 className="landing-section-title">{t('landingAboutTitle')}</h2>
          <p className="landing-section-desc">
            {t('landingAboutDesc')}
          </p>
        </div>
      </RevealSection>

      {/* ── Languages / Technologies ── */}
      <RevealSection id="landing-languages" style={{ background: 'var(--bg-secondary)' }}>
        <div className="landing-section-inner">
          <span className="landing-eyebrow">{t('landingLanguagesEyebrow')}</span>
          <h2 className="landing-section-title">{t('landingLanguagesTitle')}</h2>
          <div className="landing-lang-grid">
            {courses.map((course) => (
              <motion.div
                key={course.slug}
                className={`landing-lang-card ${course.isAvailable ? 'clickable' : 'coming-soon'}`}
                whileHover={course.isAvailable ? { y: -6, boxShadow: '0 16px 36px -14px rgba(139,92,246,0.35)' } : {}}
                transition={{ duration: 0.25 }}
                onClick={() => course.isAvailable && onSelectCourse?.(course.slug)}
                role={course.isAvailable ? 'button' : undefined}
                tabIndex={course.isAvailable ? 0 : undefined}
              >
                {!course.isAvailable && <span className="landing-lang-badge">{t('comingSoon')}</span>}
                <div className="landing-lang-icon">{course.icon}</div>
                <div className="landing-lang-name">{course.name}</div>
                <div className="landing-lang-desc">{t(DESC_KEY_BY_SLUG[course.slug] || '')}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── How it works ── */}
      <RevealSection id="landing-how">
        <div className="landing-section-inner">
          <span className="landing-eyebrow">{t('landingHowEyebrow')}</span>
          <h2 className="landing-section-title">{t('landingHowTitle')}</h2>
          <div className="landing-how-grid">
            {HOW_IT_WORKS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.titleKey} className="landing-how-card" style={{ borderColor: `${item.color}33` }}>
                  <div className="landing-how-icon" style={{ background: `${item.color}18`, color: item.color }}>
                    <Icon size={22} />
                  </div>
                  <div className="landing-how-title">{t(item.titleKey)}</div>
                  <div className="landing-how-desc">{t(item.descKey)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </RevealSection>

      {/* ── Final CTA ── */}
      <RevealSection id="landing-cta" style={{ background: 'var(--bg-secondary)' }}>
        <div className="landing-section-inner landing-cta-inner">
          <h2 className="landing-section-title">{t('landingCtaTitle')}</h2>
          <p className="landing-section-desc">
            {t('landingCtaDesc')}
          </p>
          <button type="button" className="btn btn-primary landing-cta-btn" onClick={onStart}>
            {t('landingCtaBtn')}
          </button>
        </div>
      </RevealSection>
    </>
  );
}

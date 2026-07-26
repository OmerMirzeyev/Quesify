import React, { useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Check, FileCheck, Swords, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Course cards source real enrollment counts from GET /api/courses/stats (passed in as
// courseStats, keyed by Course.Slug) — these Slug/color/labelKey entries are just display
// metadata, never the numbers themselves.
const COURSE_STATS = [
  { slug: 'C#', labelKey: 'statsCourseCSharp', color: '#8b5cf6' },
  { slug: 'Java', labelKey: 'statsCourseJava', color: '#f97316' },
  { slug: 'Python', labelKey: 'statsCoursePython', color: '#3b82f6' },
];

// Aggregate site-wide stats stay static marketing copy — Questify has no analytics endpoint
// for total-quests-completed or active-gamer counts to source these from.
const AGGREGATE_STATS = [
  { labelKey: 'statsTotalQuests', value: '248,900+', icon: Swords },
  { labelKey: 'statsActiveGamers', value: '35,850+', icon: Users },
];

export function LiveStatsPanel({ courseStats = {} }) {
  const { t } = useApp();
  return (
    <motion.div
      className="auth-stats-panel"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.35 }}
    >
      <div className="auth-stats-course-row">
        {COURSE_STATS.map((s) => {
          const count = courseStats[s.slug];
          const display = typeof count === 'number' ? count.toLocaleString('en-US') : '—';
          return (
            <div key={s.labelKey} className="auth-stats-course-chip" style={{ borderColor: `${s.color}55` }}>
              <span className="auth-stats-course-value" style={{ color: s.color }}>{display}</span>
              <span className="auth-stats-course-label">{t(s.labelKey)}</span>
              <span className="auth-stats-course-sub">{t('statsActiveStudents')}</span>
            </div>
          );
        })}
      </div>
      <div className="auth-stats-aggregate-row">
        {AGGREGATE_STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.labelKey} className="auth-stats-aggregate-chip">
              <Icon size={16} className="auth-stats-aggregate-icon" />
              <div>
                <div className="auth-stats-aggregate-value">{s.value}</div>
                <div className="auth-stats-aggregate-label">{t(s.labelKey)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// 2.5D tilt-on-hover card wrapper — glassmorphism + pointer-driven rotateX/rotateY.
export function TiltCard({ children, className = '', style = {}, glowColor = '#8b5cf6', delay = 0, ...rest }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 220, damping: 22 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`auth-feature-card-glass ${className}`}
      style={{ ...style, rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.035, boxShadow: `0 22px 48px -14px ${glowColor}66` }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Cheap CSS/JS particle field — no canvas/WebGL, just a handful of animated dots.
export function ParticleField({ count = 18, colors = ['#8b5cf6', '#22d3ee', '#f59e0b'] }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 3,
        color: colors[i % colors.length],
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 4,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count]
  );

  return (
    <div className="auth-particle-field" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`,
          }}
          animate={{ y: [0, -30, 0], opacity: [0.12, 0.8, 0.12] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// Gently bobbing badge — used for the floating "+100 Gold" / "3D" style accent chips.
export function FloatingBadge({ children, style = {}, duration = 4, delay = 0, className = '' }) {
  return (
    <motion.div
      className={`auth-floating-badge ${className}`}
      style={style}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

// Mandatory Terms of Service / Privacy Policy acknowledgement checkbox — gates Step 1
// progression on the register form until checked.
export function TermsCheckbox({ checked, onChange, error }) {
  const { t } = useApp();
  return (
    <div className="security-checkbox-wrap">
      <button
        type="button"
        className={`security-checkbox-box ${checked ? 'checked' : ''} ${error ? 'has-error' : ''}`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        aria-label={t('termsAgreeText')}
      >
        <AnimatePresence>
          {checked && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              className="security-checkbox-check"
            >
              <Check size={15} strokeWidth={3.5} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <div className="security-checkbox-label" onClick={() => onChange(!checked)}>
        <FileCheck size={17} className="security-checkbox-icon" />
        <span>{t('termsAgreeText')}</span>
      </div>
    </div>
  );
}

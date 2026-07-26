import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';

// Interactive CSS-3D constellation globe: a glowing sphere core with a ring of course nodes
// orbiting it in 3D (rotateY + translateZ per node). Auto-spins via requestAnimationFrame,
// pauses and follows the pointer while the user drags — no WebGL/canvas, so it stays lightweight
// and safe to render everywhere the auth-left hero renders.
// The 6 official Questify courses — must match backend CourseSeeder's Slugs exactly so
// courseStats[node.slug] (from GET /api/courses/stats) resolves to a real enrollment count.
const TECH_NODES = [
  { label: 'C#', slug: 'C#', color: '#8b5cf6', course: 'C# Course' },
  { label: 'Java', slug: 'Java', color: '#f97316', course: 'Java Guild' },
  { label: 'Python', slug: 'Python', color: '#3b82f6', course: 'Python RPG' },
  { label: 'SQL', slug: 'SQL', color: '#22c55e', course: 'SQL Squad' },
  { label: 'C++', slug: 'C++', color: '#ef4444', course: 'C++ Arena' },
  { label: 'React', slug: 'React', color: '#22d3ee', course: 'React Quest' },
];

const formatStudents = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—');

export default function TechGlobe3D({ radius = 132, size = 280, courseStats = {} }) {
  const { t } = useApp();
  const [rotation, setRotation] = useState(0);
  const [activeNode, setActiveNode] = useState(null);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const rotationRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const tick = () => {
      if (!draggingRef.current && !reduceMotion) {
        rotationRef.current += 0.08;
        setRotation(rotationRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handlePointerDown = (e) => {
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    rotationRef.current += dx * 0.5;
    setRotation(rotationRef.current);
  };

  const stopDragging = () => {
    draggingRef.current = false;
  };

  return (
    <div
      className="tech-globe-wrap"
      style={{ width: size, height: size, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerLeave={stopDragging}
      onPointerCancel={stopDragging}
      role="group"
      aria-label="Questify courses"
    >
      <div className="tech-globe-core" />
      <div className="tech-globe-grid" />
      <div
        className="tech-globe-orbit"
        style={{ transform: `rotateX(14deg) rotateY(${rotation}deg)` }}
      >
        {TECH_NODES.map((node, i) => {
          const angle = (360 / TECH_NODES.length) * i;
          const isActive = activeNode === node.label;
          const students = formatStudents(courseStats[node.slug]);
          return (
            <div
              key={node.label}
              className="tech-globe-node"
              style={{ transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)` }}
            >
              <button
                type="button"
                className={`tech-globe-chip ${isActive ? 'active' : ''}`}
                style={{
                  borderColor: `${node.color}88`,
                  color: node.color,
                  background: `${node.color}1a`,
                  boxShadow: `0 0 14px ${node.color}55`,
                }}
                onMouseEnter={() => setActiveNode(node.label)}
                onMouseLeave={() => setActiveNode((cur) => (cur === node.label ? null : cur))}
                onFocus={() => setActiveNode(node.label)}
                onBlur={() => setActiveNode((cur) => (cur === node.label ? null : cur))}
                onClick={() => setActiveNode((cur) => (cur === node.label ? null : node.label))}
                aria-label={`${node.course} — ${students} ${t('studentsLabel')}`}
              >
                {node.label}
              </button>
              {isActive && (
                <div className="tech-globe-tooltip" style={{ borderColor: `${node.color}88` }}>
                  <strong>{node.course}</strong>
                  <span>{students} {t('studentsLabel')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

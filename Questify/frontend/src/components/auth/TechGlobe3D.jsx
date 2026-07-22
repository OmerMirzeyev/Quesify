import React from 'react';

// CSS-3D spinning globe: a glowing sphere core with a ring of technology chips orbiting it in
// 3D (rotateY + translateZ per node, whole ring spun by a CSS animation). No WebGL/canvas — this
// keeps it lightweight and safe to render everywhere the auth-left hero renders.
const TECH_NODES = [
  { label: 'C#', color: '#8b5cf6' },
  { label: 'Java', color: '#f97316' },
  { label: 'Python', color: '#3b82f6' },
  { label: 'SQL', color: '#22c55e' },
  { label: 'Git', color: '#ef4444' },
  { label: 'React', color: '#22d3ee' },
];

export default function TechGlobe3D({ radius = 118, size = 260 }) {
  return (
    <div className="tech-globe-wrap" style={{ width: size, height: size }} aria-hidden="true">
      <div className="tech-globe-core" />
      <div className="tech-globe-grid" />
      <div className="tech-globe-orbit">
        {TECH_NODES.map((node, i) => {
          const angle = (360 / TECH_NODES.length) * i;
          return (
            <div
              key={node.label}
              className="tech-globe-node"
              style={{ transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)` }}
            >
              <span
                className="tech-globe-chip"
                style={{
                  borderColor: `${node.color}88`,
                  color: node.color,
                  background: `${node.color}1a`,
                  boxShadow: `0 0 14px ${node.color}55`,
                }}
              >
                {node.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

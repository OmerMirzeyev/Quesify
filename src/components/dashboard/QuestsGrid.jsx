import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import QuestModal from './QuestModal';

export default function QuestsGrid() {
  const { quests, completedQuests, t, activeProgrammingLanguage } = useApp();
  const [selectedQuest, setSelectedQuest] = useState(null);

  const activeQuests = quests[activeProgrammingLanguage] || [];
  const activeCompleted = completedQuests[activeProgrammingLanguage] || [];

  const isQuestUnlocked = (index) => {
    if (index === 0) return true;
    const prevQuest = activeQuests[index - 1];
    return prevQuest ? activeCompleted.includes(prevQuest.id) : false;
  };

  return (
    <div style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
      <div className="quests-section-title" style={{ marginBottom: '2rem' }}>
        {t('roadmapTitle')} ({activeProgrammingLanguage})
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 500,
            color: 'var(--text-muted)',
            marginLeft: '0.5rem',
          }}
        >
          ({activeCompleted.length}/{activeQuests.length} {t('completed')})
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.5rem',
          position: 'relative',
          padding: '2rem 1rem',
          maxWidth: '500px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '4rem',
            bottom: '4rem',
            width: '4px',
            borderLeft: '4px dashed var(--border-color)',
            zIndex: 0
          }}
        />

        {activeQuests.map((quest, index) => {
          const unlocked = isQuestUnlocked(index);
          const completed = activeCompleted.includes(quest.id);
          const isActive = unlocked && !completed;

          const alignments = ['flex-start', 'center', 'flex-end', 'center'];
          const alignSelf = alignments[index % alignments.length];

          let btnBackground = 'var(--bg-card)';
          let borderStyle = '3px solid var(--border-color)';
          let glow = 'none';

          if (completed) {
            btnBackground = 'var(--gradient-green)';
            borderStyle = '3px solid var(--accent-green)';
            glow = '0 0 20px rgba(34, 197, 94, 0.4)';
          } else if (isActive) {
            btnBackground = 'var(--gradient-primary)';
            borderStyle = '3px solid var(--accent-purple)';
            glow = 'var(--glow-purple)';
          } else {
            btnBackground = 'var(--bg-input)';
            borderStyle = '3px solid rgba(148, 163, 184, 0.15)';
          }

          return (
            <div
              key={quest.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                zIndex: 1,
                alignSelf: alignSelf
              }}
            >
              <button
                id={`roadmap-node-${quest.id}`}
                onClick={() => unlocked && setSelectedQuest(quest)}
                disabled={!unlocked}
                style={{
                  width: '86px',
                  height: '86px',
                  borderRadius: '50%',
                  background: btnBackground,
                  border: borderStyle,
                  boxShadow: glow,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  animation: isActive ? 'glowPulse 2s ease-in-out infinite' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (unlocked) {
                    e.currentTarget.style.transform = 'scale(1.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (unlocked) {
                    e.currentTarget.style.transform = isActive ? 'scale(1.08)' : 'scale(1)';
                  }
                }}
              >
                {!unlocked ? (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(7, 7, 26, 0.65)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    🔒
                  </div>
                ) : completed ? (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--accent-green)',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--bg-card)'
                    }}
                  >
                    ✓
                  </div>
                ) : null}

                <span style={{ filter: !unlocked ? 'grayscale(1)' : 'none' }}>
                  {quest.icon}
                </span>
              </button>

              <div
                style={{
                  marginTop: '0.6rem',
                  textAlign: 'center',
                  maxWidth: '180px',
                  background: 'rgba(7, 7, 26, 0.4)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.08)'
                }}
              >
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: completed
                      ? 'var(--accent-green)'
                      : isActive
                      ? 'var(--accent-purple-light)'
                      : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {quest.levelName || `Level ${index + 1}`}
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {quest.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedQuest && (
        <QuestModal
          quest={selectedQuest}
          onClose={() => setSelectedQuest(null)}
        />
      )}
    </div>
  );
}

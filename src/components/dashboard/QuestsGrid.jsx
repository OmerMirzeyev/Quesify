import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import QuestModal from './QuestModal';
import { QUESTS_BY_CHAPTER, CHAPTER_META } from '../../data/mockData';

const MAP_WIDTH = 720;
const MAP_CENTER_X = 360;
const SWING_AMPLITUDE = 210;
const LEVEL_SPACING = 165;

export default function QuestsGrid() {
  const {
    completedQuests,
    activeProgrammingLanguage,
    claimedChests,
    claimTreasureChest,
  } = useApp();

  const [selectedQuest, setSelectedQuest] = useState(null);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);

  const activeCompleted = completedQuests[activeProgrammingLanguage] || [];
  const chapters = QUESTS_BY_CHAPTER[activeProgrammingLanguage] || [];
  const chaptersMeta = CHAPTER_META[activeProgrammingLanguage] || [];
  const currentChapterQuests = chapters[selectedChapterIdx] || [];
  const currentChapterMeta = chaptersMeta[selectedChapterIdx] || {};

  const ch1QuestIds = chapters[0]?.map((q) => q.id) || [];
  const isCh1Completed = ch1QuestIds.length > 0 && ch1QuestIds.every((id) => activeCompleted.includes(id));

  const isQuestUnlocked = (index) => {
    if (selectedChapterIdx === 1 && !isCh1Completed) return false;
    if (index === 0) return true;
    const prevQuest = currentChapterQuests[index - 1];
    return prevQuest ? activeCompleted.includes(prevQuest.id) : false;
  };

  const getCoordinates = (index) => {
    const x = MAP_CENTER_X + SWING_AMPLITUDE * Math.sin(index * 1.65);
    const y = 90 + index * LEVEL_SPACING;
    return { x, y };
  };

  let pathD = '';
  currentChapterQuests.forEach((_, idx) => {
    const { x, y } = getCoordinates(idx);
    if (idx === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      const prev = getCoordinates(idx - 1);
      pathD += ` C ${prev.x} ${prev.y + 70}, ${x} ${y - 70}, ${x} ${y}`;
    }
  });

  const totalMapHeight = currentChapterQuests.length * LEVEL_SPACING + 140;

  const trees = currentChapterQuests.map((_, i) => ({
    x: (i % 2 === 0 ? 28 : MAP_WIDTH - 58) + Math.sin(i * 12) * 18,
    y: 150 + i * LEVEL_SPACING + Math.cos(i * 5) * 20,
    type: i % 3 === 0 ? '🌳' : '🌲',
  }));

  const clouds = Array.from({ length: Math.ceil(currentChapterQuests.length / 2) }, (_, i) => ({
    x: i % 2 === 0 ? 40 : MAP_WIDTH - 110,
    y: 100 + i * 340,
    scale: 0.85 + (i % 3) * 0.12,
    delay: `${i * 1.8}s`,
  }));

  const completedCount = currentChapterQuests.filter((q) => activeCompleted.includes(q.id)).length;

  return (
    <div className="quests-grid-root">
      {/* Chapter header — fixed above scroll board */}
      <div
        className="quests-chapter-header card"
        style={{
          padding: '0.85rem 1rem',
          border: '1px solid var(--border-color)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.45) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.65rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800 }}>
              🗺️ {activeProgrammingLanguage} · Fəsil Xəritəsi
            </h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              20 səviyyə · Qızıl sandıqlar · Yalnız xəritə aşağı sürüşür
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setSelectedChapterIdx(0)}
              className={`btn btn-sm ${selectedChapterIdx === 0 ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.72rem', fontWeight: 700 }}
            >
              1. Əsaslar
            </button>
            <button
              onClick={() => isCh1Completed && setSelectedChapterIdx(1)}
              className={`btn btn-sm ${selectedChapterIdx === 1 ? 'btn-primary' : 'btn-outline'}`}
              disabled={!isCh1Completed}
              style={{ fontSize: '0.72rem', fontWeight: 700, opacity: isCh1Completed ? 1 : 0.55 }}
            >
              {!isCh1Completed && '🔒 '}2. İrəliləmiş
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            {currentChapterMeta?.icon || '📦'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-purple-light)' }}>{currentChapterMeta?.title}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{currentChapterMeta?.subtitle}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{completedCount}/{currentChapterQuests.length}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              {currentChapterQuests.length ? Math.round((completedCount / currentChapterQuests.length) * 100) : 0}% tamamlandı
            </div>
          </div>
        </div>
      </div>

      {/* Independent vertically scrollable map board */}
      <div className="map-scroll-board" role="region" aria-label="Level roadmap">
        <div
          className="roadmap-map-wrapper"
          style={{
            position: 'relative',
            height: `${totalMapHeight}px`,
            minWidth: `${MAP_WIDTH}px`,
          }}
        >
          {clouds.map((c, i) => (
            <div
              key={i}
              className="floating-cloud"
              style={{
                position: 'absolute',
                left: `${c.x}px`,
                top: `${c.y}px`,
                fontSize: '2.8rem',
                opacity: 0.2,
                pointerEvents: 'none',
                transform: `scale(${c.scale})`,
                animationDelay: c.delay,
                zIndex: 0,
              }}
            >
              ☁️
            </div>
          ))}

          {trees.map((tree, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${tree.x}px`,
                top: `${tree.y}px`,
                fontSize: '1.75rem',
                userSelect: 'none',
                zIndex: 0,
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
              }}
            >
              {tree.type}
            </div>
          ))}

          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            <path d={pathD} fill="none" stroke="rgba(7, 7, 26, 0.5)" strokeWidth="16" strokeLinecap="round" />
            <path d={pathD} fill="none" stroke="var(--accent-purple-light)" strokeWidth="5" strokeDasharray="10 10" strokeLinecap="round" style={{ opacity: 0.7 }} />
          </svg>

          {currentChapterQuests.map((quest, index) => {
            const unlocked = isQuestUnlocked(index);
            const completed = activeCompleted.includes(quest.id);
            const isActive = unlocked && !completed;
            const { x, y } = getCoordinates(index);

            let nodeBg = 'var(--bg-card)';
            let borderStyle = '3px solid var(--border-color)';
            let glowGlow = 'none';

            if (completed) {
              nodeBg = 'var(--gradient-green)';
              borderStyle = '3px solid var(--accent-green)';
              glowGlow = '0 0 22px rgba(34, 197, 94, 0.4)';
            } else if (isActive) {
              nodeBg = 'var(--gradient-primary)';
              borderStyle = '3px solid var(--accent-purple)';
              glowGlow = 'var(--glow-purple)';
            } else {
              nodeBg = 'var(--bg-input)';
              borderStyle = '3px solid rgba(148, 163, 184, 0.15)';
            }

            const isMilestone = (index + 1) % 4 === 0;
            const chestId = `${activeProgrammingLanguage.toLowerCase()}-chest-${quest.id}`;
            const isChestClaimed = claimedChests.includes(chestId);

            return (
              <React.Fragment key={quest.id}>
                <div style={{ position: 'absolute', left: `${x - 43}px`, top: `${y - 43}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                  <button
                    id={`roadmap-node-${quest.id}`}
                    onClick={() => unlocked && setSelectedQuest(quest)}
                    disabled={!unlocked}
                    style={{
                      width: '86px',
                      height: '86px',
                      borderRadius: '50%',
                      background: nodeBg,
                      border: borderStyle,
                      boxShadow: glowGlow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.2rem',
                      cursor: unlocked ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      animation: isActive ? 'glowPulse 2s ease-in-out infinite' : 'none',
                    }}
                  >
                    {!unlocked ? (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(7, 7, 26, 0.75)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔒</div>
                    ) : completed ? (
                      <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-green)', color: 'white', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-card)' }}>✓</div>
                    ) : null}
                    <span style={{ filter: !unlocked ? 'grayscale(1) opacity(0.4)' : 'none' }}>{quest.icon}</span>
                  </button>

                  <div className="roadmap-tag" style={{ marginTop: '0.55rem', textAlign: 'center', width: '170px', background: 'rgba(7, 7, 26, 0.8)', backdropFilter: 'blur(4px)', padding: '0.35rem 0.55rem', borderRadius: '10px', border: '1px solid var(--border-color)', pointerEvents: 'none' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: completed ? 'var(--accent-green)' : isActive ? 'var(--accent-purple-light)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {quest.levelName || `Level ${index + 1}`}
                    </div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {quest.title}
                    </div>
                  </div>
                </div>

                {isMilestone && unlocked && (
                  <div style={{ position: 'absolute', left: `${x + 62}px`, top: `${y - 10}px`, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => !isChestClaimed && claimTreasureChest(chestId)}
                      disabled={isChestClaimed}
                      style={{ background: 'none', border: 'none', fontSize: isChestClaimed ? '1.8rem' : '2.1rem', cursor: isChestClaimed ? 'default' : 'pointer', filter: isChestClaimed ? 'opacity(0.65)' : 'drop-shadow(0 0 12px var(--accent-gold))', animation: !isChestClaimed ? 'coinBounce 1.2s ease infinite' : 'none' }}
                      title={isChestClaimed ? 'Açılıb' : 'Qızıl Xəzinəsi!'}
                    >
                      {isChestClaimed ? '🔓' : '🏴‍☠️'}
                    </button>
                    {!isChestClaimed && (
                      <div style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--accent-gold-light)', background: 'rgba(7,7,26,0.85)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.3)' }}>+25 🪙</div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {selectedQuest && <QuestModal quest={selectedQuest} onClose={() => setSelectedQuest(null)} />}
    </div>
  );
}

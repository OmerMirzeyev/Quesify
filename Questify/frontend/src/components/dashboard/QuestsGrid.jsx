import React, { useState, useRef, useLayoutEffect, useEffect, useMemo, useCallback, memo } from 'react';
import { useApp } from '../../context/AppContext';
import QuestModal from './QuestModal';
import { QUESTS_BY_CHAPTER, CHAPTER_META } from '../../data/mockData';

const LEVEL_SPACING = 165;
const MIN_MAP_WIDTH = 320;
const DEFAULT_MAP_WIDTH = 720;

function getMapMetrics(width) {
  const mapWidth = Math.max(width, MIN_MAP_WIDTH);
  const mapCenterX = mapWidth / 2;
  const swingAmplitude = Math.min(mapWidth * 0.29, 210);
  return { mapWidth, mapCenterX, swingAmplitude };
}

function buildCoordinates(count, mapCenterX, swingAmplitude) {
  return Array.from({ length: count }, (_, index) => {
    const x = mapCenterX + swingAmplitude * Math.sin(index * 1.65);
    const y = 90 + index * LEVEL_SPACING;
    return { x, y };
  });
}

function buildPathD(coordinates) {
  if (coordinates.length === 0) return '';
  let pathD = '';
  coordinates.forEach(({ x, y }, idx) => {
    if (idx === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      const prev = coordinates[idx - 1];
      pathD += ` C ${prev.x} ${prev.y + 70}, ${x} ${y - 70}, ${x} ${y}`;
    }
  });
  return pathD;
}

const MapNode = memo(function MapNode({
  quest,
  index,
  x,
  y,
  unlocked,
  completed,
  isActive,
  activeProgrammingLanguage,
  isChestClaimed,
  onSelect,
  onClaimChest,
}) {
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
  const nodeSize = 86;
  const halfNode = nodeSize / 2;

  return (
    <>
      <div
        className="roadmap-node-wrap"
        style={{
          left: `${x - halfNode}px`,
          top: `${y - halfNode}px`,
        }}
      >
        <button
          id={`roadmap-node-${quest.id}`}
          type="button"
          className={`roadmap-node-btn${isActive ? ' roadmap-node-btn--active' : ''}`}
          onClick={() => unlocked && onSelect(quest)}
          disabled={!unlocked}
          style={{
            background: nodeBg,
            border: borderStyle,
            boxShadow: glowGlow,
          }}
        >
          {!unlocked ? (
            <div className="roadmap-node-lock">🔒</div>
          ) : completed ? (
            <div className="roadmap-node-check">✓</div>
          ) : null}
          <span className={!unlocked ? 'roadmap-node-icon--locked' : 'roadmap-node-icon'}>
            {quest.icon}
          </span>
        </button>

        <div className="roadmap-tag">
          <div
            className="roadmap-tag-level"
            style={{
              color: completed
                ? 'var(--accent-green)'
                : isActive
                  ? 'var(--accent-purple-light)'
                  : 'var(--text-muted)',
            }}
          >
            {quest.levelName || `Level ${index + 1}`}
          </div>
          <div
            className="roadmap-tag-title"
            style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {quest.title}
          </div>
        </div>
      </div>

      {isMilestone && unlocked && (
        <div
          className="roadmap-chest-wrap"
          style={{ left: `${x + 62}px`, top: `${y - 10}px` }}
        >
          <button
            type="button"
            className="roadmap-chest-btn"
            onClick={() => !isChestClaimed && onClaimChest(chestId)}
            disabled={isChestClaimed}
            style={{
              fontSize: isChestClaimed ? '1.8rem' : '2.1rem',
              filter: isChestClaimed ? 'opacity(0.65)' : 'drop-shadow(0 0 12px var(--accent-gold))',
              animation: !isChestClaimed ? 'coinBounce 1.2s ease infinite' : 'none',
            }}
            title={isChestClaimed ? 'Açılıb' : 'Qızıl Xəzinəsi!'}
          >
            {isChestClaimed ? '🔓' : '🏴‍☠️'}
          </button>
          {!isChestClaimed && (
            <div className="roadmap-chest-reward">+25 🪙</div>
          )}
        </div>
      )}
    </>
  );
});

export default function QuestsGrid() {
  const {
    completedQuests,
    activeProgrammingLanguage,
    claimedChests,
    claimTreasureChest,
  } = useApp();

  const [selectedQuest, setSelectedQuest] = useState(null);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);
  const [mapWidth, setMapWidth] = useState(DEFAULT_MAP_WIDTH);

  const mapScrollRef = useRef(null);
  const mapInnerRef = useRef(null);

  const activeCompleted = completedQuests[activeProgrammingLanguage] || [];
  const chapters = QUESTS_BY_CHAPTER[activeProgrammingLanguage] || [];
  const chaptersMeta = CHAPTER_META[activeProgrammingLanguage] || [];
  const currentChapterQuests = chapters[selectedChapterIdx] || [];
  const currentChapterMeta = chaptersMeta[selectedChapterIdx] || {};

  const ch1QuestIds = chapters[0]?.map((q) => q.id) || [];
  const isCh1Completed =
    ch1QuestIds.length > 0 && ch1QuestIds.every((id) => activeCompleted.includes(id));

  const { mapCenterX, swingAmplitude } = useMemo(
    () => getMapMetrics(mapWidth),
    [mapWidth]
  );

  const coordinates = useMemo(
    () => buildCoordinates(currentChapterQuests.length, mapCenterX, swingAmplitude),
    [currentChapterQuests.length, mapCenterX, swingAmplitude]
  );

  const pathD = useMemo(() => buildPathD(coordinates), [coordinates]);

  const totalMapHeight = currentChapterQuests.length * LEVEL_SPACING + 140;

  const trees = useMemo(
    () =>
      currentChapterQuests.map((_, i) => ({
        x:
          (i % 2 === 0 ? mapWidth * 0.04 : mapWidth * 0.92) +
          Math.sin(i * 12) * Math.min(mapWidth * 0.025, 18),
        y: 150 + i * LEVEL_SPACING + Math.cos(i * 5) * 20,
        type: i % 3 === 0 ? '🌳' : '🌲',
      })),
    [currentChapterQuests, mapWidth]
  );

  const clouds = useMemo(
    () =>
      Array.from({ length: Math.ceil(currentChapterQuests.length / 2) }, (_, i) => ({
        x: i % 2 === 0 ? mapWidth * 0.06 : mapWidth * 0.84,
        y: 100 + i * 340,
        scale: 0.85 + (i % 3) * 0.12,
        delay: `${i * 1.8}s`,
      })),
    [currentChapterQuests.length, mapWidth]
  );

  const completedCount = useMemo(
    () => currentChapterQuests.filter((q) => activeCompleted.includes(q.id)).length,
    [currentChapterQuests, activeCompleted]
  );

  const isQuestUnlocked = useCallback(
    (index) => {
      if (selectedChapterIdx === 1 && !isCh1Completed) return false;
      if (index === 0) return true;
      const prevQuest = currentChapterQuests[index - 1];
      return prevQuest ? activeCompleted.includes(prevQuest.id) : false;
    },
    [selectedChapterIdx, isCh1Completed, currentChapterQuests, activeCompleted]
  );

  const resetMapScroll = useCallback(() => {
    const el = mapScrollRef.current;
    if (el) el.scrollTop = 0;
  }, []);

  useLayoutEffect(() => {
    resetMapScroll();
  }, [activeProgrammingLanguage, selectedChapterIdx, resetMapScroll]);

  useEffect(() => {
    const inner = mapInnerRef.current;
    if (!inner) return undefined;

    const updateWidth = () => {
      const nextWidth = inner.clientWidth || DEFAULT_MAP_WIDTH;
      setMapWidth((prev) => (prev === nextWidth ? prev : nextWidth));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [currentChapterQuests.length]);

  const handleSelectQuest = useCallback((quest) => setSelectedQuest(quest), []);
  const handleCloseModal = useCallback(() => setSelectedQuest(null), []);

  return (
    <div className="quests-grid-root">
      <div className="quests-chapter-header card quests-chapter-card">
        <div className="quests-chapter-top">
          <div>
            <h3 className="quests-chapter-title">
              🗺️ {activeProgrammingLanguage} · Fəsil Xəritəsi
            </h3>
            <p className="quests-chapter-desc">
              20 səviyyə · Qızıl sandıqlar · Yalnız xəritə aşağı sürüşür
            </p>
          </div>
          <div className="quests-chapter-tabs">
            <button
              type="button"
              onClick={() => setSelectedChapterIdx(0)}
              className={`btn btn-sm ${selectedChapterIdx === 0 ? 'btn-primary' : 'btn-outline'}`}
            >
              1. Əsaslar
            </button>
            <button
              type="button"
              onClick={() => isCh1Completed && setSelectedChapterIdx(1)}
              className={`btn btn-sm ${selectedChapterIdx === 1 ? 'btn-primary' : 'btn-outline'}`}
              disabled={!isCh1Completed}
              style={{ opacity: isCh1Completed ? 1 : 0.55 }}
            >
              {!isCh1Completed && '🔒 '}2. İrəliləmiş
            </button>
          </div>
        </div>

        <div className="quests-chapter-meta">
          <div className="quests-chapter-meta-icon">
            {currentChapterMeta?.icon || '📦'}
          </div>
          <div className="quests-chapter-meta-body">
            <div className="quests-chapter-meta-title">
              {currentChapterMeta?.title}
            </div>
            <div className="quests-chapter-meta-sub">
              {currentChapterMeta?.subtitle}
            </div>
          </div>
          <div className="quests-chapter-meta-stats">
            <div className="quests-chapter-meta-count">
              {completedCount}/{currentChapterQuests.length}
            </div>
            <div className="quests-chapter-meta-pct">
              {currentChapterQuests.length
                ? Math.round((completedCount / currentChapterQuests.length) * 100)
                : 0}
              % tamamlandı
            </div>
          </div>
        </div>
      </div>

      <div
        ref={mapScrollRef}
        className="map-scroll-board"
        role="region"
        aria-label="Level roadmap"
      >
        <div
          ref={mapInnerRef}
          className="roadmap-map-wrapper"
          style={{ height: `${totalMapHeight}px` }}
        >
          {clouds.map((c, i) => (
            <div
              key={`cloud-${i}`}
              className="floating-cloud roadmap-cloud"
              style={{
                left: `${c.x}px`,
                top: `${c.y}px`,
                transform: `scale(${c.scale})`,
                animationDelay: c.delay,
              }}
            >
              ☁️
            </div>
          ))}

          {trees.map((tree, i) => (
            <div
              key={`tree-${i}`}
              className="roadmap-tree"
              style={{ left: `${tree.x}px`, top: `${tree.y}px` }}
            >
              {tree.type}
            </div>
          ))}

          <svg
            className="roadmap-path-svg"
            viewBox={`0 0 ${mapWidth} ${totalMapHeight}`}
            preserveAspectRatio="xMidYMin meet"
          >
            <path
              d={pathD}
              fill="none"
              stroke="rgba(7, 7, 26, 0.5)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d={pathD}
              fill="none"
              stroke="var(--accent-purple-light)"
              strokeWidth="5"
              strokeDasharray="10 10"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>

          {currentChapterQuests.map((quest, index) => {
            const unlocked = isQuestUnlocked(index);
            const completed = activeCompleted.includes(quest.id);
            const isActive = unlocked && !completed;
            const { x, y } = coordinates[index] || { x: mapCenterX, y: 90 };
            const chestId = `${activeProgrammingLanguage.toLowerCase()}-chest-${quest.id}`;

            return (
              <MapNode
                key={quest.id}
                quest={quest}
                index={index}
                x={x}
                y={y}
                unlocked={unlocked}
                completed={completed}
                isActive={isActive}
                activeProgrammingLanguage={activeProgrammingLanguage}
                isChestClaimed={claimedChests.includes(chestId)}
                onSelect={handleSelectQuest}
                onClaimChest={claimTreasureChest}
              />
            );
          })}
        </div>
      </div>

      {selectedQuest && (
        <QuestModal quest={selectedQuest} onClose={handleCloseModal} />
      )}
    </div>
  );
}

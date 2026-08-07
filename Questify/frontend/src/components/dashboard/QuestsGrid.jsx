import React, { useState, useRef, useLayoutEffect, useEffect, useMemo, useCallback, memo } from 'react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import QuestModal from './QuestModal';
import { QUESTS_BY_CHAPTER, CHAPTER_META } from '../../data/mockData';
import { translateChapterMeta, translateLevelTitle } from '../../i18n/contentTranslations';
import { apiFetch } from '../../utils/api';

const LEVEL_SPACING = 165;
const MIN_MAP_WIDTH = 320;
const DEFAULT_MAP_WIDTH = 720;

// How many chapters already exist as static frontend content per track (CHAPTER_META above) —
// any chapter an admin creates through the "+" button gets appended after these, and this same
// number tells the backend where a brand-new chapter's OrderIndex should start counting from
// (see CreateChapterDto.BaseOrderIndex on the backend).
const STATIC_CHAPTER_COUNT = 2;

// Level.Difficulty is stored server-side in canonical English (matches AiService's prompt
// template) while mockData/the UI use Azerbaijani labels — these two small maps convert between
// them whenever a level (static or DB) crosses that boundary (resolve calls, AI generation).
const DIFFICULTY_AZ_TO_EN = { Asan: 'Easy', Orta: 'Medium', Çətin: 'Hard' };
const DIFFICULTY_EN_TO_AZ = { Easy: 'Asan', Medium: 'Orta', Hard: 'Çətin' };

const CONTENT_LANGUAGE_NAME = { az: 'Azerbaijani', en: 'English', tr: 'Turkish', ru: 'Russian' };

// Converts a DB Level row (see backend LevelDto) into the same shape mockData quest objects use,
// so it can be rendered by the existing MapNode/roadmap-path pipeline without a separate branch.
// `challenges` stays empty — gameplay itself isn't wired to the new Question table in this pass,
// this only covers the admin content-management flow (creating/AI-generating questions for a
// node); playing a DB-authored question through QuestModal is a follow-up, not in scope here.
function dbLevelToQuest(level) {
  return {
    id: `db-${level.id}`,
    dbLevelId: level.id,
    dbChapterId: level.chapterId,
    orderIndex: level.orderIndex,
    levelName: `Level ${level.orderIndex + 1}`,
    title: level.title,
    topic: level.topic,
    icon: level.icon || '📝',
    difficulty: DIFFICULTY_EN_TO_AZ[level.difficulty] || 'Orta',
    xpReward: level.xpReward,
    goldReward: level.goldReward,
    isCodingQuest: true,
    description: level.description || '',
    challenges: [],
  };
}

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
  language,
  isChestClaimed,
  onSelect,
  onClaimChest,
  isAdmin,
  onAdminAction,
  t,
}) {
  const displayTitle = translateLevelTitle(activeProgrammingLanguage, quest.id, language, quest.title);
  const stateClass = completed
    ? 'roadmap-node-btn--completed'
    : isActive
      ? 'roadmap-node-btn--unlocked'
      : unlocked
        ? 'roadmap-node-btn--unlocked'
        : 'roadmap-node-btn--locked';

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
        <div style={{ position: 'relative', width: `${nodeSize}px`, height: `${nodeSize}px` }}>
          <button
            id={`roadmap-node-${quest.id}`}
            type="button"
            className={`roadmap-node-btn ${stateClass}${isActive ? ' roadmap-node-btn--active' : ''}`}
            onClick={() => unlocked && onSelect(quest)}
            disabled={!unlocked}
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

          {isAdmin && (
            <button
              type="button"
              className="roadmap-node-admin-add-btn"
              title={t('nodeAddQuestionBtnTitle')}
              onClick={(e) => {
                e.stopPropagation();
                onAdminAction(quest, index);
              }}
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                border: '1px solid rgba(6, 182, 212, 0.6)',
                background: 'var(--bg-card, #0b0b1e)',
                color: 'var(--accent-cyan, #06b6d4)',
                fontSize: '1rem',
                fontWeight: 800,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 0 8px rgba(6, 182, 212, 0.65), 0 0 2px rgba(6, 182, 212, 0.9)',
                zIndex: 5,
              }}
            >
              +
            </button>
          )}
        </div>

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
            {displayTitle}
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
    mapProgress,
    isAdmin,
    t,
    language,
    requestAdminQuestTarget,
  } = useApp();

  const [selectedQuest, setSelectedQuest] = useState(null);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);
  const [mapWidth, setMapWidth] = useState(DEFAULT_MAP_WIDTH);

  // Admin-only additive chapter/level layer — fetched from the read-only /api/map endpoints (any
  // authenticated user can read them; only AdminController's endpoints can write). Empty for
  // non-admin users' tracks that have no extra content yet, so nothing renders differently for them.
  const [dbChapters, setDbChapters] = useState([]);
  const [dbLevels, setDbLevels] = useState([]);
  const [showNewChapterModal, setShowNewChapterModal] = useState(false);
  const [newChapterForm, setNewChapterForm] = useState({ title: '', description: '' });
  const [creatingChapter, setCreatingChapter] = useState(false);

  // Node "+" action modal (Task 1.3) — set to { quest, index } when a node's floating "+" is clicked.
  const [nodeActionTarget, setNodeActionTarget] = useState(null);
  const [nodeActionBusy, setNodeActionBusy] = useState(false);
  const [nodeActionError, setNodeActionError] = useState('');
  const [nodeActionSuccess, setNodeActionSuccess] = useState('');

  // Task 2 — replaying a completed level. Clicking a completed node opens the small confirmation
  // modal below (completedReplayTarget) instead of QuestModal directly; confirming there opens
  // QuestModal in `practiceMode` (practiceQuest) — fully interactive, but never touches real
  // progress/rewards (see QuestModal's practiceMode handling).
  const [completedReplayTarget, setCompletedReplayTarget] = useState(null);
  const [practiceQuest, setPracticeQuest] = useState(null);

  const mapScrollRef = useRef(null);
  const mapInnerRef = useRef(null);
  const cloudLayerRef = useRef(null);
  const treeLayerRef = useRef(null);

  // Memoized (rather than a plain `|| []` fallback) so the array reference stays stable across
  // renders when the underlying data hasn't changed — the useMemo/useCallback hooks below key
  // off these two and would otherwise recompute on every render, defeating their purpose.
  const activeCompleted = useMemo(
    () => completedQuests[activeProgrammingLanguage] || [],
    [completedQuests, activeProgrammingLanguage]
  );
  const chapters = useMemo(
    () => QUESTS_BY_CHAPTER[activeProgrammingLanguage] || [],
    [activeProgrammingLanguage]
  );
  const chaptersMeta = CHAPTER_META[activeProgrammingLanguage] || [];

  // Fetch admin-created extra chapters for this track — read-only, available to every logged-in
  // user (not just admins), so a chapter an admin adds shows up on everyone's map.
  useEffect(() => {
    if (!activeProgrammingLanguage) return undefined;
    let cancelled = false;
    apiFetch(`/api/map/chapters?track=${encodeURIComponent(activeProgrammingLanguage)}`, { auth: true })
      .then(({ ok, data }) => {
        if (!cancelled && ok && Array.isArray(data)) setDbChapters(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activeProgrammingLanguage]);

  // Fetch admin-created extra levels for the *currently selected* chapter only (appended after
  // whatever static levels that chapter already has, or the only content for a DB-only chapter).
  useEffect(() => {
    if (!activeProgrammingLanguage) { setDbLevels([]); return undefined; }
    let cancelled = false;
    apiFetch(
      `/api/map/levels?track=${encodeURIComponent(activeProgrammingLanguage)}&chapterOrderIndex=${selectedChapterIdx}`,
      { auth: true }
    )
      .then(({ ok, data }) => {
        if (!cancelled && ok && Array.isArray(data)) setDbLevels(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activeProgrammingLanguage, selectedChapterIdx]);

  // Static chapter metadata merged with any admin-created extra chapters, sorted so DB chapters
  // always render after the static ones (their OrderIndex is assigned starting right after
  // STATIC_CHAPTER_COUNT — see backend AdminController.CreateChapter). A DB chapter row can also
  // exist at index 0/1 (a "shadow" row lazily materialized the first time an admin targets one of
  // that static chapter's levels via ResolveLevel) — those are deliberately dropped here since the
  // static entry at that index already renders the tab; only genuinely new indices are appended.
  const allChaptersMeta = useMemo(() => {
    const staticIndices = new Set(chaptersMeta.map((c) => c.index));
    const dbMeta = dbChapters
      .filter((c) => !staticIndices.has(c.orderIndex))
      .map((c) => ({
        index: c.orderIndex,
        title: c.title,
        subtitle: c.description || '',
        icon: c.icon || '📦',
        color: c.color || '#8b5cf6',
        dbId: c.id,
      }));
    return [...chaptersMeta, ...dbMeta].sort((a, b) => a.index - b.index);
  }, [chaptersMeta, dbChapters]);

  const currentChapterQuests = useMemo(() => {
    const staticQuests = (chapters[selectedChapterIdx] || []).map((q, idx) => ({ ...q, orderIndex: idx }));
    // A DB Level row can exist at the SAME orderIndex as a static quest — that's exactly what
    // ResolveLevel materializes the first time an admin targets an existing static level via the
    // node "+" button (AI-generate or manual-add). Without this filter, saving a question against
    // any of the 120 pre-existing static levels would make that level's shadow DB row show up as
    // a second, duplicate node at the same map position on the next /api/map/levels fetch — this
    // was the real cause behind the map looking corrupted right after adding a question.
    const staticOrderIndices = new Set(staticQuests.map((q) => q.orderIndex));
    const dbLevelsByOrderIndex = new Map(dbLevels.map((l) => [l.orderIndex, l]));
    // A static quest whose level has been resolved (shadow-materialized) into a real DB row gets
    // that row's id attached directly onto it — rather than just discarding the duplicate, like
    // the filter above does — so QuestModal can fetch and play whatever admin-added/AI-generated
    // questions exist for it (see GET /api/map/questions). Without this, a question added to one
    // of the 120 static levels would be saved correctly but never actually be playable.
    const mergedStaticQuests = staticQuests.map((q) => {
      const match = dbLevelsByOrderIndex.get(q.orderIndex);
      return match ? { ...q, dbLevelId: match.id, dbChapterId: match.chapterId } : q;
    });
    const extraQuests = dbLevels
      .filter((l) => !staticOrderIndices.has(l.orderIndex))
      .map(dbLevelToQuest);
    const merged = [...mergedStaticQuests, ...extraQuests];
    // Defensive sort by orderIndex (this data model's equivalent of a "levelNumber") — guarantees
    // the map always flows strictly Level 1 → 2 → ... → N even if the static+DB concatenation
    // order above were ever violated (e.g. a fetch race, or DB rows returned out of order).
    return merged.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [chapters, selectedChapterIdx, dbLevels]);

  const currentChapterMeta = allChaptersMeta.find((c) => c.index === selectedChapterIdx) || {};
  const translatedChapterMeta = translateChapterMeta(
    activeProgrammingLanguage,
    selectedChapterIdx,
    language,
    currentChapterMeta
  );

  // Generalized chapter-gating for any chapter index (not just the original two): unlocked when
  // every *static, numeric-id* quest in the previous chapter is completed. A previous chapter with
  // no static quests (a DB-only chapter) doesn't gate the next one — there's nothing to require
  // completing yet since DB-authored questions aren't playable through QuestModal in this pass.
  const isChapterUnlockedAtIndex = useCallback(
    (idx) => {
      if (isAdmin) return true;
      if (idx === 0) return true;
      const prevQuests = (chapters[idx - 1] || []).filter((q) => typeof q.id === 'number');
      if (prevQuests.length === 0) return true;
      return prevQuests.every((q) => activeCompleted.includes(q.id));
    },
    [isAdmin, chapters, activeCompleted]
  );

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
      if (isAdmin) return true;  // Admin sees all levels unlocked

      // Prefer the backend-synced unlock state when a row exists for this level (written the
      // first time a level in this chapter is completed via /api/map/complete) — falls back to
      // the local completedQuests-derived logic below when offline or not yet synced.
      const serverEntry = mapProgress.find(
        (p) => p.track === activeProgrammingLanguage && p.chapterIndex === selectedChapterIdx && p.levelIndex === index
      );
      if (serverEntry) return serverEntry.isUnlocked;

      if (!isChapterUnlockedAtIndex(selectedChapterIdx)) return false;
      if (index === 0) return true;
      const prevQuest = currentChapterQuests[index - 1];
      if (!prevQuest) return false;
      // DB-authored levels (non-numeric `db-...` ids) aren't playable yet, so they can never be
      // "completed" — treat the chain as open past them rather than permanently locking the map.
      if (typeof prevQuest.id !== 'number') return true;
      return activeCompleted.includes(prevQuest.id);
    },
    [isAdmin, mapProgress, activeProgrammingLanguage, selectedChapterIdx, isChapterUnlockedAtIndex, currentChapterQuests, activeCompleted]
  );

  const resetMapScroll = useCallback(() => {
    const el = mapScrollRef.current;
    if (el) el.scrollTop = 0;
  }, []);

  useLayoutEffect(() => {
    resetMapScroll();
  }, [activeProgrammingLanguage, selectedChapterIdx, resetMapScroll]);

  // Depth parallax: clouds/trees drift slower than the scroll itself, giving the background a
  // sense of distance. Mutates layer transforms directly (no React state) to stay cheap on scroll.
  useEffect(() => {
    const scrollEl = mapScrollRef.current;
    if (!scrollEl) return undefined;

    const handleScroll = () => {
      const y = scrollEl.scrollTop;
      if (cloudLayerRef.current) cloudLayerRef.current.style.transform = `translateY(${y * -0.12}px)`;
      if (treeLayerRef.current) treeLayerRef.current.style.transform = `translateY(${y * -0.05}px)`;
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, [selectedChapterIdx, activeProgrammingLanguage]);

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

  // Completed levels stay fully clickable (Task 2.1) — clicking one opens the small "replay?"
  // confirmation instead of jumping straight into QuestModal, since re-entering a finished level
  // means something different (practice, not first-time play).
  const handleSelectQuest = useCallback(
    (quest) => {
      const isCompleted = typeof quest.id === 'number' && activeCompleted.includes(quest.id);
      if (isCompleted) {
        setCompletedReplayTarget(quest);
      } else {
        setSelectedQuest(quest);
      }
    },
    [activeCompleted]
  );
  const handleCloseModal = useCallback(() => setSelectedQuest(null), []);
  const handleStartReplay = useCallback(() => {
    if (!completedReplayTarget) return;
    setPracticeQuest(completedReplayTarget);
    setCompletedReplayTarget(null);
  }, [completedReplayTarget]);
  const handleClosePractice = useCallback(() => setPracticeQuest(null), []);

  // Resolves a clicked node (static or already DB-backed) to real {chapterId, levelId} DB ids —
  // find-or-create, safe to call every time a node's "+" action is used (see backend
  // AdminController.ResolveLevel for the idempotent upsert).
  const resolveLevelIds = useCallback(
    async (quest, index) => {
      if (quest.dbChapterId && quest.dbLevelId) {
        return { chapterId: quest.dbChapterId, levelId: quest.dbLevelId };
      }
      const { ok, data } = await apiFetch('/api/admin/levels/resolve', {
        method: 'POST',
        auth: true,
        body: {
          track: activeProgrammingLanguage,
          chapterOrderIndex: selectedChapterIdx,
          chapterTitle: currentChapterMeta?.title,
          chapterDescription: currentChapterMeta?.subtitle,
          chapterIcon: currentChapterMeta?.icon,
          chapterColor: currentChapterMeta?.color,
          levelOrderIndex: index,
          levelTitle: quest.title,
          topic: quest.topic,
          icon: quest.icon,
          difficulty: DIFFICULTY_AZ_TO_EN[quest.difficulty] || 'Medium',
          xpReward: quest.xpReward,
          goldReward: quest.goldReward,
          description: quest.description,
        },
      });
      if (!ok || !data) throw new Error('resolve_failed');
      return { chapterId: data.chapterId, levelId: data.levelId };
    },
    [activeProgrammingLanguage, selectedChapterIdx, currentChapterMeta]
  );

  const handleOpenNodeAction = useCallback((quest, index) => {
    setNodeActionError('');
    setNodeActionSuccess('');
    setNodeActionTarget({ quest, index });
  }, []);

  const handleAiGenerateForNode = useCallback(async () => {
    if (!nodeActionTarget || nodeActionBusy) return;
    setNodeActionBusy(true);
    setNodeActionError('');
    setNodeActionSuccess('');
    try {
      const { levelId } = await resolveLevelIds(nodeActionTarget.quest, nodeActionTarget.index);
      const { ok } = await apiFetch(`/api/admin/levels/${levelId}/generate-question`, {
        method: 'POST',
        auth: true,
        body: {
          language: activeProgrammingLanguage,
          contentLanguage: CONTENT_LANGUAGE_NAME[language] || 'Azerbaijani',
        },
        timeoutMs: 48000,
      });
      if (!ok) {
        setNodeActionError(t('nodeAiGenFailed'));
        toast.error(t('questionAddFailedToast'));
        return;
      }
      setNodeActionSuccess(t('nodeAiGenSuccess'));
      toast.success(t('questionAddedSuccessToast'));

      // Refresh dbLevels so this quest's dbLevelId is known locally right away — needed the first
      // time this specific level gets resolved (see resolveLevelIds/currentChapterQuests), so
      // reopening its quiz modal immediately plays the newly generated question without requiring
      // a chapter switch or page reload.
      const { ok: levelsOk, data: levelsData } = await apiFetch(
        `/api/map/levels?track=${encodeURIComponent(activeProgrammingLanguage)}&chapterOrderIndex=${selectedChapterIdx}`,
        { auth: true }
      );
      if (levelsOk && Array.isArray(levelsData)) setDbLevels(levelsData);

      setTimeout(() => setNodeActionTarget(null), 1400);
    } catch {
      setNodeActionError(t('nodeAiGenFailed'));
      toast.error(t('questionAddFailedToast'));
    } finally {
      setNodeActionBusy(false);
    }
  }, [nodeActionTarget, nodeActionBusy, resolveLevelIds, activeProgrammingLanguage, selectedChapterIdx, language, t]);

  const handleManualAddForNode = useCallback(async () => {
    if (!nodeActionTarget || nodeActionBusy) return;
    setNodeActionBusy(true);
    setNodeActionError('');
    try {
      const { chapterId, levelId } = await resolveLevelIds(nodeActionTarget.quest, nodeActionTarget.index);
      requestAdminQuestTarget({
        language: activeProgrammingLanguage,
        chapterId,
        levelId,
        chapterOrderIndex: selectedChapterIdx,
        levelOrderIndex: nodeActionTarget.index,
        levelTitle: nodeActionTarget.quest.title,
      });
      setNodeActionTarget(null);
    } catch {
      setNodeActionError(t('nodeAiGenFailed'));
    } finally {
      setNodeActionBusy(false);
    }
  }, [nodeActionTarget, nodeActionBusy, resolveLevelIds, activeProgrammingLanguage, selectedChapterIdx, requestAdminQuestTarget, t]);

  const handleCreateChapter = useCallback(async () => {
    if (!newChapterForm.title.trim() || creatingChapter) return;
    setCreatingChapter(true);
    try {
      const { ok, data } = await apiFetch('/api/admin/chapters', {
        method: 'POST',
        auth: true,
        body: {
          track: activeProgrammingLanguage,
          title: newChapterForm.title.trim(),
          description: newChapterForm.description.trim(),
          baseOrderIndex: STATIC_CHAPTER_COUNT,
        },
      });
      if (ok && data) {
        setDbChapters((prev) => [...prev, data]);
        setShowNewChapterModal(false);
        setNewChapterForm({ title: '', description: '' });
        setSelectedChapterIdx(data.orderIndex);
      }
    } finally {
      setCreatingChapter(false);
    }
  }, [newChapterForm, creatingChapter, activeProgrammingLanguage]);

  return (
    <div className="quests-grid-root">
      <div className="quests-chapter-header card quests-chapter-card">
        <div className="quests-chapter-top">
          <div>
            <h3 className="quests-chapter-title">
              {t('mapChapterTitle', { lang: activeProgrammingLanguage })}
            </h3>
            <p className="quests-chapter-desc">
              {t('mapChapterSubtitle')}
            </p>
          </div>
          <div className="quests-chapter-tabs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {allChaptersMeta.map((chapterMeta) => {
              const idx = chapterMeta.index;
              const unlocked = isChapterUnlockedAtIndex(idx);
              const label = idx === 0
                ? t('chapterBasics')
                : idx === 1
                  ? t('chapterAdvanced')
                  : `${idx + 1}. ${chapterMeta.title}`;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => unlocked && setSelectedChapterIdx(idx)}
                  className={`btn btn-sm ${selectedChapterIdx === idx ? 'btn-primary' : 'btn-outline'}`}
                  disabled={!unlocked}
                  style={{ opacity: unlocked ? 1 : 0.55 }}
                >
                  {!unlocked && '🔒 '}{label}
                </button>
              );
            })}
            {isAdmin && (
              <button
                type="button"
                title={t('adminNewChapterBtnTitle')}
                onClick={() => setShowNewChapterModal(true)}
                className="btn btn-sm"
                style={{
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  borderRadius: '50%',
                  border: '1px solid rgba(6, 182, 212, 0.6)',
                  color: 'var(--accent-cyan, #06b6d4)',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.55)',
                }}
              >
                +
              </button>
            )}
          </div>
        </div>

        <div className="quests-chapter-meta">
          <div className="quests-chapter-meta-icon">
            {currentChapterMeta?.icon || '📦'}
          </div>
          <div className="quests-chapter-meta-body">
            <div className="quests-chapter-meta-title">
              {translatedChapterMeta?.title}
            </div>
            <div className="quests-chapter-meta-sub">
              {translatedChapterMeta?.subtitle}
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
              % {t('percentCompleted')}
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
          <div ref={cloudLayerRef} className="roadmap-parallax-layer">
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
          </div>

          <div ref={treeLayerRef} className="roadmap-parallax-layer">
            {trees.map((tree, i) => (
              <div
                key={`tree-${i}`}
                className="roadmap-tree"
                style={{ left: `${tree.x}px`, top: `${tree.y}px` }}
              >
                {tree.type}
              </div>
            ))}
          </div>

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
              className="roadmap-path-flow"
              d={pathD}
              fill="none"
              stroke="var(--accent-purple-light)"
              strokeWidth="5"
              strokeDasharray="10 10"
              strokeLinecap="round"
              opacity="0.85"
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
                language={language}
                isChestClaimed={claimedChests.includes(chestId)}
                onSelect={handleSelectQuest}
                onClaimChest={claimTreasureChest}
                isAdmin={isAdmin}
                onAdminAction={handleOpenNodeAction}
                t={t}
              />
            );
          })}
        </div>
      </div>

      {selectedQuest && (
        <QuestModal quest={selectedQuest} onClose={handleCloseModal} />
      )}

      {/* Task 2.2 — completed-level replay confirmation */}
      {completedReplayTarget && (
        <div className="modal-overlay" onClick={() => setCompletedReplayTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
            <h3 style={{ marginBottom: '0.5rem' }}>{t('levelCompletedBadgeTitle')}</h3>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>{completedReplayTarget.title}</p>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('replayConfirmBody')}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setCompletedReplayTarget(null)}>{t('cancel')}</button>
              <button className="btn btn-primary" onClick={handleStartReplay}>{t('replayLevelBtn')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Task 2.3 — practice/replay mode: fully interactive QuestModal that never touches real
          progress, coins, XP, or hearts (see QuestModal's practiceMode prop). */}
      {practiceQuest && (
        <QuestModal quest={practiceQuest} onClose={handleClosePractice} practiceMode />
      )}

      {/* Admin: create-new-chapter modal (Task 1.1) */}
      {showNewChapterModal && (
        <div className="modal-overlay" onClick={() => !creatingChapter && setShowNewChapterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h3 style={{ marginBottom: '1rem' }}>{t('adminNewChapterModalTitle')}</h3>
            <div className="input-group">
              <label className="input-label">{t('adminChapterTitleFieldLabel')}</label>
              <input
                type="text"
                className="input-field"
                value={newChapterForm.title}
                onChange={(e) => setNewChapterForm((f) => ({ ...f, title: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="input-group">
              <label className="input-label">{t('adminChapterDescFieldLabel')}</label>
              <textarea
                className="input-field"
                rows={2}
                value={newChapterForm.description}
                onChange={(e) => setNewChapterForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setShowNewChapterModal(false)} disabled={creatingChapter}>
                {t('cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateChapter}
                disabled={!newChapterForm.title.trim() || creatingChapter}
              >
                {creatingChapter ? t('adminBroadcastSending') : t('adminCreateChapterBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin: level node "+" action modal (Task 1.3). Uses dedicated .node-action-* classes
          (not the shared .btn, which forces white-space:nowrap + centered flex and was clipping
          the wrapped card text — see index.css for the fix). */}
      {nodeActionTarget && (
        <div className="modal-overlay" onClick={() => !nodeActionBusy && setNodeActionTarget(null)}>
          <div className="node-action-modal" onClick={(e) => e.stopPropagation()}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem' }}>{t('nodeActionModalTitle')}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {nodeActionTarget.quest.title}
              </p>
            </div>

            <div className="node-action-card-list">
              <button
                type="button"
                className="node-action-card node-action-card--ai"
                onClick={handleAiGenerateForNode}
                disabled={nodeActionBusy}
              >
                <span className="node-action-card-icon">✨</span>
                <span className="node-action-card-body">
                  <span className="node-action-card-title">{t('nodeActionAiTitle')}</span>
                  <span className="node-action-card-desc">{t('nodeActionAiDesc')}</span>
                </span>
              </button>

              <button
                type="button"
                className="node-action-card node-action-card--manual"
                onClick={handleManualAddForNode}
                disabled={nodeActionBusy}
              >
                <span className="node-action-card-icon">➕</span>
                <span className="node-action-card-body">
                  <span className="node-action-card-title">{t('nodeActionManualTitle')}</span>
                  <span className="node-action-card-desc">{t('nodeActionManualDesc')}</span>
                </span>
              </button>
            </div>

            {nodeActionBusy && (
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-purple-light)', fontWeight: 600 }}>
                ⚡ {t('nodeAiGenerating')}
              </div>
            )}
            {nodeActionError && (
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: 600 }}>
                ⚠️ {nodeActionError}
              </div>
            )}
            {nodeActionSuccess && (
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 600 }}>
                {nodeActionSuccess}
              </div>
            )}

            <button
              type="button"
              className="node-action-cancel-btn"
              onClick={() => setNodeActionTarget(null)}
              disabled={nodeActionBusy}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

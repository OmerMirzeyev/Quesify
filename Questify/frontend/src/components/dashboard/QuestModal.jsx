import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import { translateLevelTitle, translateChallenges } from '../../i18n/contentTranslations';
import { apiFetch } from '../../utils/api';

const QUESTION_TIME_SECONDS = 45;
const TIME_FREEZE_BONUS_SECONDS = 20;
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

// Converts a backend QuestionRecordDto (GET /api/map/questions) into this component's internal
// challenge shape ({question, options, correctIndex, hint}) — options are camelCased by
// System.Text.Json (a/b/c/d, not A/B/C/D), and empty C/D slots are dropped so a 2-option question
// doesn't render two blank buttons. correctIndex is recomputed against the FILTERED array (not
// the raw letter position), so a blank slot before the correct option never shifts it out of range.
function questionRecordToChallenge(q) {
  const opts = q.options || {};
  const lettered = OPTION_LETTERS.map((letter, i) => ({ letter, text: [opts.a, opts.b, opts.c, opts.d][i] }))
    .filter((o) => o.text !== '' && o.text != null);
  return {
    question: q.questionText,
    options: lettered.map((o) => o.text),
    correctIndex: Math.max(lettered.findIndex((o) => o.letter === q.correctOption), 0),
    hint: q.hint || '',
  };
}

// `practiceMode` — set when re-entering an already-completed level to replay it (Task 2 "Tekrar
// Et"). Fully interactive (timer, checking answers, hints) but deliberately never calls
// completeQuest/deductHeart or otherwise touches real progress, coins, XP, or hearts — replaying
// is meant to be a free, stakes-free practice pass, not a way to re-earn rewards or lose hearts.
export default function QuestModal({ quest, onClose, practiceMode = false }) {
  const { completeQuest, completedQuests, user, deductHeart, spendJoker, spendTimeFreeze, spendHintCard, spendAnswerChange, t, activeProgrammingLanguage, language, addFailedQuestion, triggerAIExplanation } = useApp();
  const displayTitle = translateLevelTitle(activeProgrammingLanguage, quest.id, language, quest.title);
  const [practiceStats, setPracticeStats] = useState({ correct: 0, total: 0 });

  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState([]); // indices eliminated by joker
  const [flaggedOption, setFlaggedOption] = useState(null); // index soft-flagged by a Hint Card
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const [answerChangeUsed, setAnswerChangeUsed] = useState(false); // once per question

  // Admin-added/AI-generated questions for this exact level, fetched fresh on every mount so a
  // question added moments ago (in the same session, no page reload) is immediately playable.
  // `quest.dbLevelId` is only ever set once this level has been resolved into a real DB row (see
  // QuestsGrid's currentChapterQuests) — a level nobody has ever targeted via the map's "+" button
  // has no DB row and therefore nothing to fetch, so this stays empty and costs nothing.
  const [dbChallenges, setDbChallenges] = useState([]);
  const [challengesLoading, setChallengesLoading] = useState(!!quest.dbLevelId);

  useEffect(() => {
    if (!quest.dbLevelId) {
      setDbChallenges([]);
      setChallengesLoading(false);
      return undefined;
    }
    let cancelled = false;
    setChallengesLoading(true);
    apiFetch(`/api/map/questions?levelId=${quest.dbLevelId}`, { auth: true })
      .then(({ ok, data }) => {
        if (cancelled || !ok || !Array.isArray(data)) return;
        setDbChallenges(data.map(questionRecordToChallenge));
      })
      .finally(() => {
        if (!cancelled) setChallengesLoading(false);
      });
    return () => { cancelled = true; };
  }, [quest.dbLevelId]);

  // QuestsGrid only ever mounts this component as `{selectedQuest && <QuestModal ... />}`, so
  // `quest` is guaranteed non-null for the component's entire lifetime — no null-guard needed
  // here (an early return before the hooks below would violate the Rules of Hooks).

  const isAlreadyCompleted = (completedQuests[activeProgrammingLanguage] || []).includes(quest.id);
  // The "frozen, view-only" state (all options disabled, no Check/Retry/Next buttons) only
  // applies when a completed quest is shown WITHOUT practice mode — which no longer happens via
  // the normal node click (QuestsGrid routes completed levels through the replay confirmation
  // instead), but this stays correct as a defensive fallback for however QuestModal is invoked.
  const isLocked = isAlreadyCompleted && !practiceMode;
  // Consumable power-ups (jokers, hints, freeze, answer-change) spend real inventory — blocked
  // during practice so replaying a level for fun can never drain the user's actual item stock.
  const powerUpsAllowed = !isLocked && !practiceMode;

  // Static mockData challenges (backwards compatible if the quest structure lacks a challenges
  // array) PLUS whatever admin-added/AI-generated questions were just fetched for this level —
  // this is what actually binds the quiz to the clicked level's real question set instead of only
  // ever falling back to static content.
  const staticChallenges = quest.challenges && quest.challenges.length > 0
    ? quest.challenges
    : (quest.challenge ? [quest.challenge] : []);
  const rawChallengeList = useMemo(
    () => [...staticChallenges, ...dbChallenges],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quest, dbChallenges]
  );
  // Localizes question/options/hint into the user's selected UI language, falling back to the
  // original Azerbaijani text for any level/language combination not yet translated (translation
  // lookup is keyed by index, so the appended DB questions — which have no translation entry —
  // simply pass through unchanged, see translateChallenges).
  const challengeList = translateChallenges(activeProgrammingLanguage, quest.id, language, rawChallengeList);
  const currentChallenge = challengeList[currentQIdx];
  const hasNoQuestions = !challengesLoading && challengeList.length === 0;
  const noHearts = !practiceMode && !hasNoQuestions && user.hearts <= 0 && !isAlreadyCompleted;

  const handleOptionClick = (idx) => {
    if (eliminatedOptions.includes(idx)) return;
    if (checked) return; // Prevent change after check
    setSelectedOption(idx);
    setFeedback('');
  };

  const handleCheck = () => {
    if (!currentChallenge) return;
    if (selectedOption === null) {
      setFeedback(t('selectOptionMsg'));
      return;
    }

    const correct = selectedOption === currentChallenge.correctIndex;
    setIsCorrect(correct);
    setChecked(true);
    if (practiceMode) setPracticeStats((prev) => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }));

    if (correct) {
      setFeedback(t('correctMsg'));
    } else {
      // Catch wrong answer and store it in failedQuestions list in AppContext
      addFailedQuestion(quest.id, currentChallenge);

      // Trigger AI Chatbot auto-explanation in bottom-right corner
      triggerAIExplanation(
        currentChallenge.question,
        currentChallenge.options[currentChallenge.correctIndex],
        currentChallenge.options[selectedOption],
        currentChallenge.hint
      );

      setFeedback(t('wrongMsg'));
      // Hearts are real, persistent stakes — practice/replay is meant to be free of them.
      if (!practiceMode) deductHeart();
    }
  };

  // Per-question countdown auto-submits whatever is selected (or a blank/wrong attempt if
  // nothing was picked) — same outcome as clicking "Check Answer", just triggered by the clock.
  const handleTimeUp = useCallback(() => {
    if (!currentChallenge) return;
    if (selectedOption === null) {
      setIsCorrect(false);
      setChecked(true);
      setFeedback('⏰ Vaxt bitdi! ' + t('wrongMsg'));
      addFailedQuestion(quest.id, currentChallenge);
      if (practiceMode) setPracticeStats((prev) => ({ ...prev, total: prev.total + 1 }));
      if (!practiceMode) deductHeart();
      return;
    }
    handleCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, currentChallenge, quest.id]);

  useEffect(() => {
    if (checked || isLocked || noHearts || challengesLoading || hasNoQuestions) return undefined;
    if (timeLeft <= 0) {
      handleTimeUp();
      return undefined;
    }
    const id = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, checked, isLocked, noHearts, challengesLoading, hasNoQuestions, handleTimeUp]);

  const handleNextQuestion = () => {
    setCurrentQIdx(prev => prev + 1);
    setSelectedOption(null);
    setChecked(false);
    setIsCorrect(false);
    setFeedback('');
    setShowHint(false);
    setEliminatedOptions([]);
    setFlaggedOption(null);
    setAnswerChangeUsed(false);
    setTimeLeft(QUESTION_TIME_SECONDS);
  };

  const handleClaim = () => {
    if (practiceMode) {
      // No completeQuest here — replaying never re-grants rewards or rewrites map progress. Only
      // an ephemeral, session-local score is surfaced back to the user.
      toast.success(t('practiceFinishedToast', { correct: practiceStats.correct, total: practiceStats.total }));
      onClose();
      return;
    }
    completeQuest(quest);
    onClose();
  };

  const handleJokerClick = () => {
    if (eliminatedOptions.length > 0 || checked || !powerUpsAllowed) return;

    // Find incorrect options
    const incorrectIndices = currentChallenge.options
      .map((_, idx) => idx)
      .filter(idx => idx !== currentChallenge.correctIndex);

    // Pick 2 random to eliminate
    const shuffled = incorrectIndices.sort(() => 0.5 - Math.random());
    const toEliminate = shuffled.slice(0, 2);

    if (spendJoker()) {
      setEliminatedOptions(toEliminate);
      if (toEliminate.includes(selectedOption)) {
        setSelectedOption(null); // Deselect if eliminated
      }
    }
  };

  // Hint Card — soft-flags one incorrect option (not removed, just marked) beyond the free hint.
  const handleHintCardClick = () => {
    if (checked || !powerUpsAllowed || flaggedOption !== null) return;
    const incorrectIndices = currentChallenge.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== currentChallenge.correctIndex && !eliminatedOptions.includes(idx));
    if (incorrectIndices.length === 0) return;
    const pick = incorrectIndices[Math.floor(Math.random() * incorrectIndices.length)];
    if (spendHintCard()) {
      setFlaggedOption(pick);
      setShowHint(true);
    }
  };

  // Freeze Time — spends a charge for extra time on the current question's clock.
  const handleFreezeClick = () => {
    if (checked || !powerUpsAllowed) return;
    if (spendTimeFreeze()) {
      setTimeLeft((prev) => prev + TIME_FREEZE_BONUS_SECONDS);
    }
  };

  // Answer Change — after a wrong check, refund the heart just lost and let the user retry once.
  const handleAnswerChangeClick = () => {
    if (!checked || isCorrect || !powerUpsAllowed || answerChangeUsed) return;
    if (spendAnswerChange()) {
      setAnswerChangeUsed(true);
      setChecked(false);
      setSelectedOption(null);
      setFeedback('');
    }
  };

  const difficultyClass =
    quest.difficulty === 'Asan' ? 'badge-easy' :
    quest.difficulty === 'Orta' ? 'badge-medium' : 'badge-hard';

  const isLastQuestion = currentQIdx === challengeList.length - 1;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px' }}
        role="dialog"
      >
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '12px',
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {quest.icon}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {displayTitle}
            </h2>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
              <span className={`badge ${difficultyClass}`}>{quest.difficulty}</span>
              <span className="badge badge-code">{'</> ' + activeProgrammingLanguage}</span>
              {isAlreadyCompleted && <span className="badge badge-easy">{t('alreadyCompleted')}</span>}
              {practiceMode && <span className="badge badge-code">{t('practiceModeBadge')}</span>}
            </div>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          {quest.description}
        </p>

        {noHearts ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💔</div>
            <h3 style={{ color: 'var(--accent-red)', margin: 0 }}>{t('noHeartsMsg')}</h3>
          </div>
        ) : challengesLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
            {t('questionsLoadingLabel')}
          </div>
        ) : hasNoQuestions ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
            {t('noQuestionsForLevel')}
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-input)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-sm)', padding: '1.25rem', marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple-light)', textTransform: 'uppercase' }}>
                {t('knowledgeCheck', { lang: activeProgrammingLanguage })}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {t('questionProgress', { current: currentQIdx + 1, total: challengeList.length })}
                </span>
                {!checked && !isLocked && (
                  <span
                    style={{
                      fontSize: '0.72rem', fontWeight: 800, padding: '0.1rem 0.5rem', borderRadius: '100px',
                      color: timeLeft <= 10 ? 'var(--accent-red)' : 'var(--accent-cyan)',
                      background: timeLeft <= 10 ? 'rgba(239,68,68,0.1)' : 'rgba(34,211,238,0.08)',
                      border: `1px solid ${timeLeft <= 10 ? 'rgba(239,68,68,0.3)' : 'rgba(34,211,238,0.25)'}`,
                    }}
                  >
                    ⏱️ {timeLeft}s
                  </span>
                )}
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '1rem', whiteSpace: 'pre-line' }}>
              {currentChallenge.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {currentChallenge.options.map((opt, idx) => {
                const isEliminated = eliminatedOptions.includes(idx);
                const isSelected = selectedOption === idx;
                
                const isFlagged = flaggedOption === idx && !isEliminated;

                let borderStyle = '1px solid var(--border-color)';
                let bgStyle = 'var(--bg-card)';
                let opacity = isEliminated ? 0.3 : 1;

                if (isFlagged) {
                  borderStyle = '1px dashed var(--accent-red)';
                }

                if (isSelected) {
                  borderStyle = '1px solid var(--accent-purple)';
                  bgStyle = 'rgba(139, 92, 246, 0.08)';
                }

                if (checked && isSelected && !isEliminated) {
                  if (idx === currentChallenge.correctIndex) {
                    borderStyle = '2px solid var(--accent-green)';
                    bgStyle = 'rgba(34, 197, 94, 0.1)';
                  } else {
                    borderStyle = '2px solid var(--accent-red)';
                    bgStyle = 'rgba(239, 68, 68, 0.1)';
                  }
                } else if (checked && idx === currentChallenge.correctIndex && !isEliminated) {
                  borderStyle = '2px solid var(--accent-green)';
                  bgStyle = 'rgba(34, 197, 94, 0.05)';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleOptionClick(idx)}
                    disabled={isLocked || isEliminated}
                    style={{
                      width: '100%', padding: '0.85rem 1rem', borderRadius: '8px',
                      border: borderStyle, background: bgStyle, opacity,
                      color: 'var(--text-primary)', textAlign: 'left', fontSize: '0.88rem',
                      cursor: (isLocked || isEliminated) ? 'default' : 'pointer',
                      transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}
                  >
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: '2px solid var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700,
                      background: isSelected ? 'var(--accent-purple)' : 'transparent',
                      color: isSelected ? 'white' : 'var(--text-muted)',
                      borderColor: isSelected ? 'var(--accent-purple)' : 'var(--text-muted)'
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span style={{ flex: 1, textDecoration: isEliminated ? 'line-through' : 'none' }}>{opt}</span>
                    {isFlagged && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-red)', flexShrink: 0 }} title="Hint Kartı bunun düzgün olma ehtimalını aşağı görür">
                        ❓ Ehtimal aşağı
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint & Joker Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                style={{ background: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setShowHint(!showHint)}
              >
                💡 {t('hint')}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {powerUpsAllowed && !checked && user.timeFreezes > 0 && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleFreezeClick}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-cyan)', borderColor: 'rgba(34,211,238,0.35)' }}
                  >
                    ⏱️ Vaxtı Dondur <span style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '100px', padding: '0.05rem 0.4rem', fontSize: '0.68rem' }}>{user.timeFreezes}</span>
                  </button>
                )}

                {powerUpsAllowed && !checked && flaggedOption === null && user.hintCards > 0 && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleHintCardClick}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-purple-light)', borderColor: 'rgba(139,92,246,0.35)' }}
                  >
                    🔍 Hint Kartı <span style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '100px', padding: '0.05rem 0.4rem', fontSize: '0.68rem' }}>{user.hintCards}</span>
                  </button>
                )}

                {powerUpsAllowed && user.jokers > 0 && !checked && eliminatedOptions.length === 0 && (
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    onClick={handleJokerClick}
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    🃏 50/50 Joker İstifadə Et <span style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '100px', padding: '0.05rem 0.4rem', fontSize: '0.72rem' }}>{user.jokers}</span>
                  </button>
                )}
                {powerUpsAllowed && user.jokers === 0 && eliminatedOptions.length === 0 && !checked && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    🃏 Joker yoxdur — <button type="button" style={{ background:'none', color:'var(--accent-gold)', fontSize: '0.72rem', fontWeight:700, cursor:'pointer' }}>Dükkandan al</button>
                  </span>
                )}
                {eliminatedOptions.length > 0 && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                    ✅ 50/50 tətbiq edildi!
                  </span>
                )}
              </div>
            </div>

            {showHint && (
              <div style={{
                fontSize: '0.8rem', color: 'var(--accent-cyan)', background: 'rgba(34, 211, 238, 0.08)',
                padding: '0.6rem 0.8rem', borderRadius: '6px', marginTop: '0.75rem', border: '1px solid rgba(34, 211, 238, 0.2)'
              }}>
                <strong>{t('hint')}:</strong> {currentChallenge.hint}
              </div>
            )}

            {/* Feedback Msg */}
            {feedback && (
              <div style={{
                marginTop: '1rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: isCorrect ? 'var(--accent-green)' : 'var(--accent-red)'
              }}>
                {isCorrect ? '🎉' : '⚠️'} {feedback}
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        {!noHearts && !challengesLoading && !hasNoQuestions && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!isLocked && !checked && (
              <button type="button" className="btn btn-outline" onClick={handleCheck} style={{ flex: 1, height: '48px' }}>
                {t('checkAnswer')}
              </button>
            )}

            {!isLocked && checked && !isCorrect && (
              <button type="button" className="btn btn-outline" onClick={() => { setChecked(false); setSelectedOption(null); setFeedback(''); }} style={{ flex: 1, height: '48px' }}>
                Yenidən Cəhd Et
              </button>
            )}

            {powerUpsAllowed && checked && !isCorrect && !answerChangeUsed && user.answerChanges > 0 && (
              <button
                type="button"
                className="btn btn-gold"
                onClick={handleAnswerChangeClick}
                style={{ flex: 1, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                title="Can itirmədən cavabı dəyiş"
              >
                🔁 Cavabı Dəyiş <span style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '100px', padding: '0.05rem 0.4rem', fontSize: '0.72rem' }}>{user.answerChanges}</span>
              </button>
            )}

            {!isLocked && checked && isCorrect && !isLastQuestion && (
              <button type="button" className="btn btn-primary" onClick={handleNextQuestion} style={{ flex: 1, height: '48px' }}>
                {t('nextQuestion')}
              </button>
            )}

            {(isLocked || (checked && isCorrect && isLastQuestion)) && (
              <button
                className="btn btn-gold"
                onClick={handleClaim}
                style={{ flex: 1.5, height: '48px', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}
              >
                {isLocked
                  ? t('alreadyCompleted')
                  : practiceMode
                    ? t('practiceFinishBtn')
                    : t('claimReward') + ` (+${quest.goldReward} Gold)`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function QuestModal({ quest, onClose }) {
  const { completeQuest, completedQuests, user, deductHeart, useJoker, t, activeProgrammingLanguage, addFailedQuestion, triggerAIExplanation } = useApp();
  
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState([]); // indices eliminated by joker

  if (!quest) return null;

  const isAlreadyCompleted = (completedQuests[activeProgrammingLanguage] || []).includes(quest.id);
  
  // Backwards compatibility if quest structure lacks challenges array
  const challengeList = quest.challenges || [quest.challenge];
  const currentChallenge = challengeList[currentQIdx];

  const handleOptionClick = (idx) => {
    if (eliminatedOptions.includes(idx)) return;
    if (checked && !isAlreadyCompleted) return; // Prevent change after check
    setSelectedOption(idx);
    setFeedback('');
  };

  const handleCheck = () => {
    if (selectedOption === null) {
      setFeedback(t('selectOptionMsg'));
      return;
    }

    const correct = selectedOption === currentChallenge.correctIndex;
    setIsCorrect(correct);
    setChecked(true);

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
      deductHeart();
    }
  };

  const handleNextQuestion = () => {
    setCurrentQIdx(prev => prev + 1);
    setSelectedOption(null);
    setChecked(false);
    setIsCorrect(false);
    setFeedback('');
    setShowHint(false);
    setEliminatedOptions([]);
  };

  const handleClaim = () => {
    completeQuest(quest);
    onClose();
  };

  const handleJokerClick = () => {
    if (eliminatedOptions.length > 0 || checked || isAlreadyCompleted) return;
    
    // Find incorrect options
    const incorrectIndices = currentChallenge.options
      .map((_, idx) => idx)
      .filter(idx => idx !== currentChallenge.correctIndex);
    
    // Pick 2 random to eliminate
    const shuffled = incorrectIndices.sort(() => 0.5 - Math.random());
    const toEliminate = shuffled.slice(0, 2);
    
    if (useJoker()) {
      setEliminatedOptions(toEliminate);
      if (toEliminate.includes(selectedOption)) {
        setSelectedOption(null); // Deselect if eliminated
      }
    }
  };

  const difficultyClass =
    quest.difficulty === 'Asan' ? 'badge-easy' :
    quest.difficulty === 'Orta' ? 'badge-medium' : 'badge-hard';

  const isLastQuestion = currentQIdx === challengeList.length - 1;
  const noHearts = user.hearts <= 0 && !isAlreadyCompleted;

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
              {quest.title}
            </h2>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
              <span className={`badge ${difficultyClass}`}>{quest.difficulty}</span>
              <span className="badge badge-code">{'</> ' + activeProgrammingLanguage}</span>
              {isAlreadyCompleted && <span className="badge badge-easy">{t('alreadyCompleted')}</span>}
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
        ) : (
          <div style={{
            background: 'var(--bg-input)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-sm)', padding: '1.25rem', marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple-light)', textTransform: 'uppercase' }}>
                {t('knowledgeCheck')}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {t('questionProgress', { current: currentQIdx + 1, total: challengeList.length })}
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '1rem', whiteSpace: 'pre-line' }}>
              {currentChallenge.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {currentChallenge.options.map((opt, idx) => {
                const isEliminated = eliminatedOptions.includes(idx);
                const isSelected = selectedOption === idx;
                
                let borderStyle = '1px solid var(--border-color)';
                let bgStyle = 'var(--bg-card)';
                let opacity = isEliminated ? 0.3 : 1;

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
                    disabled={isAlreadyCompleted || isEliminated}
                    style={{
                      width: '100%', padding: '0.85rem 1rem', borderRadius: '8px',
                      border: borderStyle, background: bgStyle, opacity,
                      color: 'var(--text-primary)', textAlign: 'left', fontSize: '0.88rem',
                      cursor: (isAlreadyCompleted || isEliminated) ? 'default' : 'pointer',
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

              {!isAlreadyCompleted && user.jokers > 0 && !checked && eliminatedOptions.length === 0 && (
                <button
                  type="button"
                  className="btn btn-gold btn-sm"
                  onClick={handleJokerClick}
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  🃏 50/50 Joker İstifadə Et <span style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '100px', padding: '0.05rem 0.4rem', fontSize: '0.72rem' }}>{user.jokers}</span>
                </button>
              )}
              {!isAlreadyCompleted && user.jokers === 0 && eliminatedOptions.length === 0 && !checked && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  🃏 Joker yoxdur — <button type="button" style={{ background:'none', color:'var(--accent-gold)', fontSize: '0.72rem', fontWeight:700, cursor:'pointer' }}>Dükkandan al</button>
                </span>
              )}
              {eliminatedOptions.length > 0 && (
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                  ✅ 50/50 tətbiq edildi — 2 yanlış variant silindi!
                </span>
              )}
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
        {!noHearts && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!isAlreadyCompleted && !checked && (
              <button type="button" className="btn btn-outline" onClick={handleCheck} style={{ flex: 1, height: '48px' }}>
                {t('checkAnswer')}
              </button>
            )}

            {!isAlreadyCompleted && checked && !isCorrect && (
              <button type="button" className="btn btn-outline" onClick={() => { setChecked(false); setSelectedOption(null); setFeedback(''); }} style={{ flex: 1, height: '48px' }}>
                Yenidən Cəhd Et
              </button>
            )}

            {!isAlreadyCompleted && checked && isCorrect && !isLastQuestion && (
              <button type="button" className="btn btn-primary" onClick={handleNextQuestion} style={{ flex: 1, height: '48px' }}>
                {t('nextQuestion')}
              </button>
            )}

            {(isAlreadyCompleted || (checked && isCorrect && isLastQuestion)) && (
              <button
                className="btn btn-gold"
                onClick={handleClaim}
                style={{ flex: 1.5, height: '48px', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}
              >
                {isAlreadyCompleted ? t('alreadyCompleted') : t('claimReward') + ` (+${quest.goldReward} Gold)`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

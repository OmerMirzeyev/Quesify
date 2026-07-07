import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getRandomAiQuestion } from '../../data/mockData';
import { isAdminRole } from '../../utils/storage';

export default function AdminPanel() {
  const { usersList, updateUserInfo, deleteUser, addQuest, quests, t } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState('users');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null); // holds user obj
  const [editForm, setEditForm] = useState({ name: '', level: 0, gold: 0, xp: 0, role: 'İstifadəçi' });

  // Delete User Modal State
  const [deletingUserId, setDeletingUserId] = useState(null);

  // Quest form states
  const [questForm, setQuestForm] = useState({
    targetLanguage: 'C#', // Target programming track
    targetLevelId: '', // If empty, creates new level
    title: '',
    topic: '',
    icon: '⚙️',
    difficulty: 'Asan',
    xpReward: 100,
    goldReward: 50,
    description: '',
    tasksString: 'Verilən sualı düzgün cavablandıraraq bu səviyyəni tamamla',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctIndex: 0,
    hint: ''
  });

  const [aiGenerating, setAiGenerating] = useState(false);

  const handleAiGenerate = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      const randomQuest = getRandomAiQuestion(questForm.targetLanguage);

      setQuestForm(prev => ({
        ...prev,
        title: `${prev.targetLanguage} — ${randomQuest.topic}`,
        topic: randomQuest.topic,
        question: randomQuest.challenge.question,
        optionA: randomQuest.challenge.options[0] || '',
        optionB: randomQuest.challenge.options[1] || '',
        optionC: randomQuest.challenge.options[2] || '',
        optionD: randomQuest.challenge.options[3] || '',
        correctIndex: randomQuest.challenge.correctIndex,
        hint: randomQuest.challenge.hint
      }));
    }, 1000);
  };

  const handleQuestSubmit = (e) => {
    e.preventDefault();
    if (!questForm.question || !questForm.optionA) {
      alert("Zəhmət olmasa bütün vacib xanaları doldurun!");
      return;
    }

    const newQuestData = {
      title: questForm.title,
      topic: questForm.topic || 'General',
      icon: questForm.icon || '📝',
      difficulty: questForm.difficulty,
      xpReward: Number(questForm.xpReward),
      goldReward: Number(questForm.goldReward),
      description: questForm.description || 'Yeni əlavə edilmiş proqramlaşdırma səviyyəsi.',
      challenge: {
        question: questForm.question,
        options: [questForm.optionA, questForm.optionB, questForm.optionC, questForm.optionD].filter(Boolean),
        correctIndex: Number(questForm.correctIndex),
        hint: questForm.hint || 'Sualı diqqətlə oxuyun.'
      }
    };

    addQuest(newQuestData, questForm.targetLevelId, questForm.targetLanguage);

    setQuestForm(prev => ({
      ...prev,
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctIndex: 0,
      hint: ''
    }));
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      level: user.level,
      gold: user.gold,
      xp: user.xp,
      role: isAdminRole(user.role) ? 'Admin' : 'İstifadəçi',
    });
  };

  const saveEdit = () => {
    updateUserInfo(editingUser.id, {
      name: editForm.name,
      level: Number(editForm.level),
      gold: Number(editForm.gold),
      xp: Number(editForm.xp),
      role: editForm.role,
    });
    setEditingUser(null);
  };

  const confirmDelete = () => {
    deleteUser(deletingUserId);
    setDeletingUserId(null);
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="section-title">{t('adminTitle')}</div>
          <div className="section-subtitle">{t('adminSubtitle')}</div>
        </div>
      </div>


      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeAdminTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveAdminTab('users')}
          style={{ padding: '0.5rem 1.25rem', borderRadius: '8px' }}
        >
          {t('tabUsers')}
        </button>
        <button
          className={`btn ${activeAdminTab === 'quests' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveAdminTab('quests')}
          style={{ padding: '0.5rem 1.25rem', borderRadius: '8px' }}
        >
          {t('tabQuests')}
        </button>
      </div>

      {activeAdminTab === 'users' && (
        <div className="card" style={{ overflowX: 'auto', padding: '1.25rem' }}>
          {usersList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
              <p style={{ margin: 0, fontWeight: 600 }}>İstifadəçi siyahısı boşdur.</p>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Yalnız Register ekranından yaradılan hesablar burada görünür.
              </p>
            </div>
          ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem' }}>İstifadəçi</th>
                <th style={{ padding: '0.75rem' }}>Rol</th>
                <th style={{ padding: '0.75rem' }}>{t('level')}</th>
                <th style={{ padding: '0.75rem' }}>{t('gold')}</th>
                <th style={{ padding: '0.75rem' }}>XP</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((usr) => (
                <tr
                  key={usr.id}
                  style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.08)', fontSize: '0.9rem', background: usr.isCurrentUser ? 'rgba(139, 92, 246, 0.03)' : 'transparent' }}
                >
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{usr.emoji || '🎮'}</span>
                      <span>{usr.name}</span>
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge badge-code">
                      {isAdminRole(usr.role) ? 'Admin' : 'Tələbə'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>Lv. {usr.level}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--accent-gold-light)' }}>🪙 {usr.gold}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--accent-cyan)' }}>{usr.xp}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditModal(usr)} style={{ padding: '0.25rem 0.6rem' }}>
                        {t('edit')}
                      </button>
                      {!usr.isCurrentUser && (
                        <button className="btn btn-outline btn-sm" onClick={() => setDeletingUserId(usr.id)} style={{ padding: '0.25rem 0.6rem', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                          {t('delete')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}

      {activeAdminTab === 'quests' && (
        <form onSubmit={handleQuestSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(139, 92, 246, 0.08)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px dashed var(--accent-purple)' }}>
            <div>
              <strong style={{ color: 'var(--accent-purple-light)', display: 'block', fontSize: '0.9rem' }}>🤖 Süni İntellekt Simulyatoru (AI Bot)</strong>
            </div>
            <button type="button" className="btn btn-primary" onClick={handleAiGenerate} disabled={aiGenerating} style={{ padding: '0.5rem 1.25rem', boxShadow: 'var(--glow-purple)' }}>
              {aiGenerating ? t('aiGenerating') : t('aiGenerateBtn')}
            </button>
          </div>

          {/* Programming Track Selector */}
          <div className="input-group">
            <label className="input-label">🎯 {t('adminSelectTrack')}</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['C#', 'Java', 'Python'].map(lang => (
                <button
                  key={lang}
                  type="button"
                  className={`btn btn-sm ${questForm.targetLanguage === lang ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1, fontWeight: 700, boxShadow: questForm.targetLanguage === lang ? 'var(--glow-purple)' : 'none' }}
                  onClick={() => setQuestForm({ ...questForm, targetLanguage: lang, targetLevelId: '' })}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t('selectLevel')} ({questForm.targetLanguage})</label>
            <select
              className="input-field"
              value={questForm.targetLevelId}
              onChange={e => setQuestForm({ ...questForm, targetLevelId: e.target.value })}
            >
              <option value="">-- Yeni Mərhələ Yarat ({questForm.targetLanguage}) --</option>
              {(quests[questForm.targetLanguage] || []).map(q => (
                <option key={q.id} value={q.id}>{q.levelName} - {q.title}</option>
              ))}
            </select>
          </div>

          {/* Sual məlumatları */}
          <div style={{ padding: '1.25rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--accent-purple-light)', textTransform: 'uppercase' }}>📝 Sual Əlavə Et</strong>

            <div className="input-group">
              <label className="input-label">{questForm.targetLanguage} Sualı</label>
              <textarea className="input-field" value={questForm.question} onChange={e => setQuestForm({ ...questForm, question: e.target.value })} rows={2} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group"><label className="input-label">Variant A</label><input type="text" className="input-field" value={questForm.optionA} onChange={e => setQuestForm({ ...questForm, optionA: e.target.value })} required /></div>
              <div className="input-group"><label className="input-label">Variant B</label><input type="text" className="input-field" value={questForm.optionB} onChange={e => setQuestForm({ ...questForm, optionB: e.target.value })} required /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group"><label className="input-label">Variant C</label><input type="text" className="input-field" value={questForm.optionC} onChange={e => setQuestForm({ ...questForm, optionC: e.target.value })} /></div>
              <div className="input-group"><label className="input-label">Variant D</label><input type="text" className="input-field" value={questForm.optionD} onChange={e => setQuestForm({ ...questForm, optionD: e.target.value })} /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Düzgün Variant</label>
                <select className="input-field" value={questForm.correctIndex} onChange={e => setQuestForm({ ...questForm, correctIndex: e.target.value })}>
                  <option value={0}>Variant A</option>
                  <option value={1}>Variant B</option>
                  <option value={2}>Variant C</option>
                  <option value={3}>Variant D</option>
                </select>
              </div>
              <div className="input-group"><label className="input-label">İpucu (Hint)</label><input type="text" className="input-field" value={questForm.hint} onChange={e => setQuestForm({ ...questForm, hint: e.target.value })} /></div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-end', minWidth: '180px' }}>
            ➕ {t('addQuestionToLevel')}
          </button>
        </form>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem' }}>{t('editUserTitle')} ({editingUser.name})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Ad</label>
                <input className="input-field" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">{t('level')}</label>
                <input type="number" className="input-field" value={editForm.level} onChange={e => setEditForm({...editForm, level: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">{t('gold')}</label>
                <input type="number" className="input-field" value={editForm.gold} onChange={e => setEditForm({...editForm, gold: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Rol</label>
                <select className="input-field" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                  <option value="İstifadəçi">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setEditingUser(null)}>{t('cancel')}</button>
              <button className="btn btn-primary" onClick={saveEdit}>{t('save')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUserId && (
        <div className="modal-overlay" onClick={() => setDeletingUserId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-red)' }}>Silmə Təsdiqi</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>{t('deleteUserConfirm')}</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeletingUserId(null)}>{t('cancel')}</button>
              <button className="btn btn-primary" style={{ background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={confirmDelete}>{t('confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

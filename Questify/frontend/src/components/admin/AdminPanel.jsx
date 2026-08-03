import React, { useState } from 'react';
import { PlusCircle, Trash2, Minus, Plus, Infinity as InfinityIcon, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isAdminRole } from '../../utils/storage';
import { apiFetch } from '../../utils/api';

const SHOP_ITEM_TYPE_OPTS = ['avatar', 'badge', 'potion_heart', 'joker_5050', 'streak_freeze', 'double_xp', 'time_freeze', 'hint_card', 'answer_change', 'frame', 'theme'];

const defaultNewShopItem = {
  name: '', emoji: '⭐', type: 'Joker', itemType: 'joker_5050', price: 100,
  rarity: 'Common', game: 'Questify', gameColor: '#8b5cf6',
  gameBg: 'linear-gradient(135deg,#8b5cf622 0%,#5b21b622 100%)',
  gameBorder: 'rgba(139,92,246,0.4)', desc: '', stock: null,
};

export default function AdminPanel() {
  const { usersList, updateUserInfo, deleteUser, addQuest, quests, t,
          adminBanUser, adminUnbanUser, adminTimeoutUser, adminRemoveTimeout, adminBroadcast,
          dynamicShopItems, adminAddShopItem, adminUpdateShopItem, adminDeleteShopItem, adminSetShopItemStock } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState('users');
  const [timeoutMinutes, setTimeoutMinutes] = useState(10);
  const [timeoutingUserId, setTimeoutingUserId] = useState(null);

  // Platform-wide real-time announcement (SignalR) — sent live, nothing persisted.
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim() || broadcastSending) return;
    setBroadcastSending(true);
    const success = await adminBroadcast(broadcastMessage);
    setBroadcastSending(false);
    if (success) setBroadcastMessage('');
  };

  // Shop management tab state
  const [editingShopId, setEditingShopId] = useState(null); // row currently in inline-edit mode
  const [shopEditForm, setShopEditForm] = useState({ price: 0, desc: '' });
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [newShopItem, setNewShopItem] = useState(defaultNewShopItem);
  const [deleteShopItemId, setDeleteShopItemId] = useState(null);

  const startShopEdit = (item) => {
    setEditingShopId(item.id);
    setShopEditForm({ price: item.price, desc: item.desc });
  };

  const saveShopEdit = async (itemId) => {
    await adminUpdateShopItem(itemId, { price: Number(shopEditForm.price), desc: shopEditForm.desc });
    setEditingShopId(null);
  };

  const adjustShopStock = (item, delta) => {
    const current = item.stock ?? 0;
    adminSetShopItemStock(item.id, Math.max(0, current + delta));
  };

  const handleAddShopItem = () => {
    if (!newShopItem.name.trim()) return;
    adminAddShopItem(newShopItem);
    setShowAddShopModal(false);
    setNewShopItem(defaultNewShopItem);
  };

  const confirmDeleteShopItem = () => {
    const item = dynamicShopItems.find((i) => i.id === deleteShopItemId);
    if (item) adminDeleteShopItem(item.id, item.name);
    setDeleteShopItemId(null);
  };

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null); // holds user obj
  const [editForm, setEditForm] = useState({ name: '', level: 0, gold: 0, xp: 0, role: 'İstifadəçi', applyCoinsOverride: false, coins: 0, hasUnlimitedCoins: false });

  // Delete User Modal State
  const [deletingUserId, setDeletingUserId] = useState(null);

  // Quest form states
  const [questForm, setQuestForm] = useState({
    targetLanguage: 'C#', // Target programming track
    targetLevelId: '', // If empty, creates new level
    title: '',
    topic: 'Loops', // Default topic
    icon: '⚙️',
    difficulty: 'Asan', // Maps to 'Easy', 'Medium', 'Hard'
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

  // AI Generator loading state — real backend call now (POST /api/admin/generate-question),
  // replacing the old client-side static template pool.
  const [aiWizardLoading, setAiWizardLoading] = useState(false);
  const [aiWizardError, setAiWizardError] = useState('');
  const [aiWizardTopic, setAiWizardTopic] = useState('Loops');
  const [aiWizardDifficulty, setAiWizardDifficulty] = useState('Easy'); // 'Easy' | 'Medium' | 'Hard'
  const [aiWizardLang, setAiWizardLang] = useState('C#');

  const triggerAiGenerate = async () => {
    if (aiWizardLoading) return;
    setAiWizardError('');
    setAiWizardLoading(true);

    try {
      // Longer than the backend's own 45s deadline (AdminController.AiRequestDeadline) so a
      // clean timeout error from the server has a chance to arrive before the client gives up.
      const { ok, data } = await apiFetch('/api/admin/generate-question', {
        method: 'POST',
        auth: true,
        body: { language: aiWizardLang, topic: aiWizardTopic, difficulty: aiWizardDifficulty },
        timeoutMs: 48000,
      });

      if (!ok || !data?.question) {
        setAiWizardError(data?.message || 'AI sual yarada bilmədi. Zəhmət olmasa yenidən cəhd edin.');
        return;
      }

      const displayDifficulty = aiWizardDifficulty === 'Easy' ? 'Asan' : aiWizardDifficulty === 'Medium' ? 'Orta' : 'Çətin';
      const xpReward = aiWizardDifficulty === 'Easy' ? 100 : aiWizardDifficulty === 'Medium' ? 150 : 200;
      const goldReward = aiWizardDifficulty === 'Easy' ? 50 : aiWizardDifficulty === 'Medium' ? 75 : 100;
      const defaultIcon = aiWizardTopic === 'Loops' ? '🔄' : aiWizardTopic === 'OOP' ? '🏛️' : aiWizardTopic === 'Lists' ? '📝' : '📦';

      setQuestForm(prev => ({
        ...prev,
        targetLanguage: aiWizardLang,
        targetLevelId: '', // create new level
        title: data.title || `${aiWizardLang} — ${aiWizardTopic} Sintaksisi`,
        topic: aiWizardTopic,
        difficulty: displayDifficulty,
        xpReward,
        goldReward,
        icon: defaultIcon,
        description: data.description || `Süni İntellekt tərəfindən yaradılmış ${aiWizardDifficulty.toLowerCase()} səviyyəli ${aiWizardLang} tapşırığı.`,
        question: data.question,
        optionA: data.options?.[0] || '',
        optionB: data.options?.[1] || '',
        optionC: data.options?.[2] || '',
        optionD: data.options?.[3] || '',
        correctIndex: data.correctIndex ?? 0,
        hint: data.hint || 'Sualı diqqətlə oxuyun.'
      }));
    } catch {
      setAiWizardError('Bağlantı kəsildi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setAiWizardLoading(false);
    }
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
      // Coins/unlimited-coins live on the backend, not in this local directory, so there's no
      // "current value" to prefill — applyCoinsOverride gates whether Save touches them at all,
      // so leaving these untouched never silently resets a user's real coin balance to 0.
      applyCoinsOverride: false,
      coins: 0,
      hasUnlimitedCoins: false,
    });
  };

  const saveEdit = () => {
    updateUserInfo(editingUser.id, {
      name: editForm.name,
      level: Number(editForm.level),
      gold: Number(editForm.gold),
      xp: Number(editForm.xp),
      role: editForm.role,
      ...(editForm.applyCoinsOverride
        ? { coins: Number(editForm.coins), hasUnlimitedCoins: editForm.hasUnlimitedCoins }
        : {}),
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

      {/* Real-time platform announcement — pushed live via SignalR to every connected client */}
      <form
        onSubmit={handleBroadcast}
        className="card"
        style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '1rem 1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}
      >
        <span style={{ fontSize: '1.3rem' }}>📣</span>
        <input
          type="text"
          className="input-field"
          placeholder="Bütün istifadəçilərə canlı bildiriş göndərin..."
          value={broadcastMessage}
          onChange={(e) => setBroadcastMessage(e.target.value)}
          disabled={broadcastSending}
          style={{ flex: '1 1 260px' }}
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={!broadcastMessage.trim() || broadcastSending}
        >
          {broadcastSending ? 'Göndərilir...' : 'Yayımla'}
        </button>
      </form>

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
        <button
          className={`btn ${activeAdminTab === 'shop' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveAdminTab('shop')}
          style={{ padding: '0.5rem 1.25rem', borderRadius: '8px' }}
        >
          {t('adminShopTabLabel')}
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
                  <th style={{ padding: '0.75rem' }}>Status</th>
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
                    <td style={{ padding: '0.75rem' }}>
                      {usr.isBanned
                        ? <span className="badge" style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.3)' }}>🚫 Blok</span>
                        : usr.timeoutUntil && new Date(usr.timeoutUntil) > new Date()
                          ? <span className="badge" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--accent-gold-light)', border: '1px solid rgba(245,158,11,0.3)' }}>⏱️ Timeout</span>
                          : <span className="badge" style={{ background: 'rgba(34,197,94,0.08)', color: 'var(--accent-green)', border: '1px solid rgba(34,197,94,0.2)' }}>✅ Aktiv</span>
                      }
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEditModal(usr)} style={{ padding: '0.25rem 0.6rem' }}>
                          {t('edit')}
                        </button>
                        {!usr.isCurrentUser && !isAdminRole(usr.role) && (
                          <>
                            {usr.isBanned ? (
                              <button className="btn btn-outline btn-sm" onClick={() => adminUnbanUser(usr.id, usr.email)} style={{ padding: '0.25rem 0.6rem', color: 'var(--accent-green)', borderColor: 'rgba(34,197,94,0.35)' }}>
                                ✅ Bloku Aç
                              </button>
                            ) : (
                              <button className="btn btn-outline btn-sm" onClick={() => adminBanUser(usr.id, usr.email)} style={{ padding: '0.25rem 0.6rem', color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.3)' }}>
                                🚫 Ban
                              </button>
                            )}
                            {usr.timeoutUntil && new Date(usr.timeoutUntil) > new Date() ? (
                              <button className="btn btn-outline btn-sm" onClick={() => adminRemoveTimeout(usr.id, usr.email)} style={{ padding: '0.25rem 0.6rem', color: 'var(--accent-cyan)', borderColor: 'rgba(6,182,212,0.3)' }}>
                                ✕ Timeout
                              </button>
                            ) : (
                              <button className="btn btn-outline btn-sm" onClick={() => { setTimeoutingUserId(usr.id); }} style={{ padding: '0.25rem 0.6rem', color: 'var(--accent-gold-light)', borderColor: 'rgba(245,158,11,0.3)' }}>
                                ⏱️ Timeout
                              </button>
                            )}
                          </>
                        )}
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
          
          {/* AI Generator Panel */}
          <div style={{ padding: '1.25rem', background: 'rgba(139, 92, 246, 0.06)', borderRadius: 'var(--radius)', border: '1px dashed var(--accent-purple)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong style={{ color: 'var(--accent-purple-light)', display: 'block', fontSize: '0.92rem', marginBottom: '0.25rem' }}>🤖 Süni İntellekt Simulyatoru (AI Bot)</strong>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mövzu və çətinlik dərəcəsinə görə sürətlə tam şablon sual yaradın.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
              
              {/* Language Selector */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ fontSize: '0.7rem' }}>Dil Seçimi</label>
                <select className="input-field" value={aiWizardLang} onChange={(e) => setAiWizardLang(e.target.value)}>
                  <option value="C#">C#</option>
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                </select>
              </div>

              {/* Topic Selector */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ fontSize: '0.7rem' }}>Mövzu (Topic)</label>
                <select className="input-field" value={aiWizardTopic} onChange={(e) => setAiWizardTopic(e.target.value)}>
                  <option value="Loops">Loops (Döngülər)</option>
                  <option value="Variables">Variables (Dəyişənlər)</option>
                  <option value="OOP">OOP (Obyektlər)</option>
                  <option value="Lists">Lists (Python Listləri)</option>
                </select>
              </div>

              {/* Difficulty Selector */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ fontSize: '0.7rem' }}>Çətinlik (Difficulty)</label>
                <select className="input-field" value={aiWizardDifficulty} onChange={(e) => setAiWizardDifficulty(e.target.value)}>
                  <option value="Easy">Easy (Asan)</option>
                  <option value="Medium">Medium (Orta)</option>
                  <option value="Hard">Hard (Çətin)</option>
                </select>
              </div>

              <button
                type="button"
                id="admin-ai-generate-btn"
                className="btn btn-primary"
                onClick={triggerAiGenerate}
                disabled={aiWizardLoading}
                style={{ alignSelf: 'flex-end', height: '38px', fontWeight: 800, padding: '0 1.25rem', boxShadow: 'var(--glow-purple)', opacity: aiWizardLoading ? 0.7 : 1, cursor: aiWizardLoading ? 'wait' : 'pointer' }}
              >
                {aiWizardLoading ? '🤖 Generasiya olunur...' : '🤖 AI İlə Yarat'}
              </button>
            </div>

            {aiWizardError && (
              <div style={{ color: 'var(--accent-red)', fontSize: '0.78rem', fontWeight: 600 }}>
                ⚠️ {aiWizardError}
              </div>
            )}
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
              <label className="input-label">Səviyyə Başlığı (Title)</label>
              <input type="text" className="input-field" value={questForm.title} onChange={e => setQuestForm({ ...questForm, title: e.target.value })} required />
            </div>

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
                <select className="input-field" value={questForm.correctIndex} onChange={e => setQuestForm({ ...questForm, correctIndex: Number(e.target.value) })}>
                  <option value={0}>Variant A</option>
                  <option value={1}>Variant B</option>
                  <option value={2}>Variant C</option>
                  <option value={3}>Variant D</option>
                </select>
              </div>
              <div className="input-group"><label className="input-label">İpucu (Hint)</label><input type="text" className="input-field" value={questForm.hint} onChange={e => setQuestForm({ ...questForm, hint: e.target.value })} /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <div className="input-group" style={{ margin: 0 }}><label className="input-label">Mövzu (Topic)</label><input type="text" className="input-field" value={questForm.topic} onChange={e => setQuestForm({ ...questForm, topic: e.target.value })} /></div>
              <div className="input-group" style={{ margin: 0 }}><label className="input-label">Çətinlik</label><select className="input-field" value={questForm.difficulty} onChange={e => setQuestForm({ ...questForm, difficulty: e.target.value })}><option value="Asan">Asan</option><option value="Orta">Orta</option><option value="Çətin">Çətin</option></select></div>
              <div className="input-group" style={{ margin: 0 }}><label className="input-label">XP Mükafatı</label><input type="number" className="input-field" value={questForm.xpReward} onChange={e => setQuestForm({ ...questForm, xpReward: e.target.value })} /></div>
              <div className="input-group" style={{ margin: 0 }}><label className="input-label">Qızıl Mükafatı</label><input type="number" className="input-field" value={questForm.goldReward} onChange={e => setQuestForm({ ...questForm, goldReward: e.target.value })} /></div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-end', minWidth: '180px' }}>
            ➕ {t('addQuestionToLevel')}
          </button>
        </form>
      )}

      {activeAdminTab === 'shop' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <strong style={{ fontSize: '0.95rem' }}>{t('adminShopSectionTitle')}</strong>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t('adminShopSectionSubtitle')}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowAddShopModal(true)}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <PlusCircle size={15} /> {t('shopNewItemBtn')}
            </button>
          </div>

          {dynamicShopItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</div>
              <p style={{ margin: 0, fontWeight: 600 }}>Mağaza boşdur.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <th style={{ padding: '0.65rem' }}>Əşya</th>
                    <th style={{ padding: '0.65rem' }}>Növ</th>
                    <th style={{ padding: '0.65rem' }}>Qiymət</th>
                    <th style={{ padding: '0.65rem' }}>Təsvir</th>
                    <th style={{ padding: '0.65rem' }}>Stok</th>
                    <th style={{ padding: '0.65rem', textAlign: 'right' }}>Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicShopItems.map((item) => {
                    const isEditing = editingShopId === item.id;
                    const hasLimitedStock = typeof item.stock === 'number';
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.08)', fontSize: '0.85rem' }}>
                        <td style={{ padding: '0.6rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                            <span>{item.emoji}</span>
                            <span>{item.name}</span>
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem' }}>
                          <span className="badge badge-code" style={{ fontSize: '0.65rem' }}>{item.itemType}</span>
                        </td>
                        <td style={{ padding: '0.6rem', minWidth: '90px' }}>
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              className="input-field"
                              style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', width: '90px' }}
                              value={shopEditForm.price}
                              onChange={(e) => setShopEditForm((f) => ({ ...f, price: e.target.value }))}
                            />
                          ) : (
                            <span style={{ color: 'var(--accent-gold-light)', fontWeight: 700 }}>🪙 {item.price}</span>
                          )}
                        </td>
                        <td style={{ padding: '0.6rem', minWidth: '220px', maxWidth: '320px' }}>
                          {isEditing ? (
                            <input
                              type="text"
                              className="input-field"
                              style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', width: '100%' }}
                              value={shopEditForm.desc}
                              onChange={(e) => setShopEditForm((f) => ({ ...f, desc: e.target.value }))}
                            />
                          ) : (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{item.desc}</span>
                          )}
                        </td>
                        <td style={{ padding: '0.6rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.1rem 0.4rem', display: 'flex', alignItems: 'center' }}
                              onClick={() => adjustShopStock(item, -1)}
                              disabled={!hasLimitedStock || item.stock <= 0}
                              title="Stoku azalt"
                            >
                              <Minus size={11} />
                            </button>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '60px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                              {hasLimitedStock ? item.stock : <InfinityIcon size={13} />}
                            </span>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.1rem 0.4rem', display: 'flex', alignItems: 'center' }}
                              onClick={() => hasLimitedStock ? adjustShopStock(item, 1) : adminSetShopItemStock(item.id, 10)}
                              title={hasLimitedStock ? 'Stoku artır' : 'Limitli stok təyin et (10)'}
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '0.6rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                            {isEditing ? (
                              <>
                                <button className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.6rem' }} onClick={() => setEditingShopId(null)}>{t('cancel')}</button>
                                <button className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => saveShopEdit(item.id)}>
                                  <Save size={13} /> {t('save')}
                                </button>
                              </>
                            ) : (
                              <>
                                <button className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.6rem' }} onClick={() => startShopEdit(item)}>{t('edit')}</button>
                                <button
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '0.25rem 0.6rem', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                  onClick={() => setDeleteShopItemId(item.id)}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Shop Item Modal */}
      {showAddShopModal && (
        <div className="modal-overlay" onClick={() => setShowAddShopModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>➕ Yeni Mağaza Əşyası</h3>

            {[
              { label: 'Ad', key: 'name', type: 'text' },
              { label: 'Emoji', key: 'emoji', type: 'text' },
              { label: 'Qiymət (Gold)', key: 'price', type: 'number' },
              { label: 'Təsvir', key: 'desc', type: 'text' },
            ].map((field) => (
              <div key={field.key} className="input-group">
                <label className="input-label">{field.label}</label>
                <input
                  type={field.type}
                  className="input-field"
                  value={newShopItem[field.key]}
                  onChange={(e) => setNewShopItem((prev) => ({ ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                />
              </div>
            ))}

            <div className="input-group">
              <label className="input-label">Item Type</label>
              <select className="input-field" value={newShopItem.itemType} onChange={(e) => setNewShopItem((prev) => ({ ...prev, itemType: e.target.value }))}>
                {SHOP_ITEM_TYPE_OPTS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Stok (boş = limitsiz)</label>
              <input
                type="number"
                min={0}
                className="input-field"
                value={newShopItem.stock ?? ''}
                placeholder="Limitsiz"
                onChange={(e) => setNewShopItem((prev) => ({ ...prev, stock: e.target.value === '' ? null : Number(e.target.value) }))}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddShopModal(false)}>{t('cancel')}</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddShopItem}>➕ Əlavə Et</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Shop Item Confirmation Modal */}
      {deleteShopItemId && (
        <div className="modal-overlay" onClick={() => setDeleteShopItemId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '320px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-red)' }}>{t('shopDeleteConfirmTitle')}</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>{t('shopDeleteConfirmBody')}</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteShopItemId(null)}>{t('cancel')}</button>
              <button className="btn btn-primary" style={{ background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={confirmDeleteShopItem}>{t('confirm')}</button>
            </div>
          </div>
        </div>
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

              {/* Backend-authoritative coin wallet override (Market Coins, separate from the legacy local Gold above) */}
              <div style={{ border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editForm.applyCoinsOverride}
                    onChange={e => setEditForm({ ...editForm, applyCoinsOverride: e.target.checked })}
                  />
                  🪙 Coin balansını / limitsiz coini dəyiş (backend)
                </label>
                {editForm.applyCoinsOverride && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label">Yeni Coin balansı</label>
                      <input
                        type="number"
                        min={0}
                        className="input-field"
                        value={editForm.coins}
                        onChange={e => setEditForm({ ...editForm, coins: e.target.value })}
                        disabled={editForm.hasUnlimitedCoins}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editForm.hasUnlimitedCoins}
                        onChange={e => setEditForm({ ...editForm, hasUnlimitedCoins: e.target.checked })}
                      />
                      ♾️ Limitsiz coin (mağazada həmişə ala bilər)
                    </label>
                  </div>
                )}
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
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-red)' }}>Silmə Təsdiq</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>{t('deleteUserConfirm')}</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeletingUserId(null)}>{t('cancel')}</button>
              <button className="btn btn-primary" style={{ background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={confirmDelete}>{t('confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Timeout Duration Modal */}
      {timeoutingUserId && (
        <div className="modal-overlay" onClick={() => setTimeoutingUserId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏱️</div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-gold-light)' }}>Timeout Müddəti</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>İstifadəçi nə qədər məhdudlaşdırılsın?</p>
            <div className="input-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <label className="input-label">Dəqiqə (məs: 10, 60, 1440)</label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={timeoutMinutes}
                onChange={e => setTimeoutMinutes(Number(e.target.value))}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setTimeoutingUserId(null)}>Ləğv et</button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--accent-gold-light)', borderColor: 'var(--accent-gold-light)', color: '#000' }}
                onClick={() => {
                  const usr = usersList.find(u => u.id === timeoutingUserId);
                  if (usr) adminTimeoutUser(usr.id, usr.email, timeoutMinutes);
                  setTimeoutingUserId(null);
                }}
              >
                Tətbiqi Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Generator Loading Overlay ── */}
      {aiWizardLoading && (
        <div className="modal-overlay" style={{ zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '360px', textAlign: 'center', padding: '2rem' }}>

            {/* Loading animation block */}
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1.5rem' }}>
              <div style={{
                width: '100%', height: '100%',
                border: '4px solid rgba(139,92,246,0.15)',
                borderTopColor: 'var(--accent-purple)',
                borderRadius: '50%',
                animation: 'spinStar 0.8s linear infinite'
              }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                🤖
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>AI sual yaradır...</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              {aiWizardLang} · {aiWizardTopic} · {aiWizardDifficulty}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

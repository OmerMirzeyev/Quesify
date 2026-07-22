import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isAdminRole } from '../../utils/storage';

// Rich Pool of dynamic questions based on Language + Topic + Difficulty combination
const GENERATED_AI_QUESTIONS = {
  'C#': {
    Loops: {
      Easy: {
        question: "C# dilində 'while (x < 10)' döngüsünün 10 dəfə dövr etməsi üçün x-in başlanğıc qiyməti neçə olmalıdır (hər addımda x++ olur)?",
        options: ["x = 0", "x = 1", "x = 10", "x = -1"],
        correctIndex: 0,
        hint: "x=0-dan başladıqda, i = 0, 1, ..., 9 olacaq və cəmi 10 iterasiya edəcək."
      },
      Medium: {
        question: "C#-da hansı döngü növü şərt yoxlanılmadan ƏVVƏL ən azı bir dəfə mütləq işləyir?",
        options: ["for döngüsü", "while döngüsü", "do-while döngüsü", "foreach döngüsü"],
        correctIndex: 2,
        hint: "do-while döngüsünün gövdəsi işlədikdən sonra while şərti yoxlanılır."
      },
      Hard: {
        question: "C#-da daxili (nested) ikiqat döngü blokundan eyni anda tamamilə çıxmaq üçün ən təhlükəsiz üsul hansıdır?",
        options: ["Sadə break; yazmaq", "goto label; ifadəsi istifadə etmək", "Boolean bayrağı (flag) istifadə edib hər iki döngüdə yoxlamaq", "return; yazaraq metodu tam bitirmək (əgər mümkündürsə)"],
        correctIndex: 2,
        hint: "goto məsləhət görülmür. Ən yaxşı OOP üsulu flag dəyişəni ilə idarə etməkdir."
      }
    },
    Variables: {
      Easy: {
        question: "C#-da tam ədədləri (məsələn: 42, -99) saxlamaq üçün ən çox istifadə edilən 32-bitlik məlumat tipi hansıdır?",
        options: ["byte", "short", "int", "long"],
        correctIndex: 2,
        hint: "'int' tipi 32-bitlik signed integer ifadə edir."
      },
      Medium: {
        question: "C# dilində dəyişənin tipini proqramçının yazmasına ehtiyac duymadan, təyin edilən dəyərə görə avtomatik çıxaran açar söz hansıdır?",
        options: ["dynamic", "var", "auto", "object"],
        correctIndex: 1,
        hint: "var açar sözü 'Implicitly typed local variables' yaratmağa imkan verir."
      },
      Hard: {
        question: "C#-da 'readonly' və 'const' arasındakı əsas fərq nədir?",
        options: ["const yalnız runtime-da dəyişə bilir", "const compile-time sabitidir, readonly isə runtime zamanı (məs: konstruktorda) təyin edilə bilər", "Heç bir fərqləri yoxdur", "readonly yalnız static siniflərdə keçərlidir"],
        correctIndex: 1,
        hint: "const dəyəri təyin olunduqda birbaşa kodun içinə köçürülür, readonly isə konstruktorda dəyişdirilə bilir."
      }
    },
    OOP: {
      Easy: {
        question: "C#-da bir sinifdən (class) miras almaq üçün sinif adından sonra hansı simvol yazılır?",
        options: [":", "->", "extends", "inherits"],
        correctIndex: 0,
        hint: "class Dog : Animal sintaksisi varislik bildirmək üçündür."
      },
      Medium: {
        question: "C# proqramlaşdırma dilində eyni metod adının fərqli parametr tipləri ilə təkrar təyin edilməsi nə adlanır?",
        options: ["Method Overriding", "Method Overloading", "Method Hiding", "Polymorphism"],
        correctIndex: 1,
        hint: "Method Overloading eyni adda, lakin fərqli imzaya sahib metodlar deməkdir."
      },
      Hard: {
        question: "C#-da interfeys (interface) daxilindəki metodların standart olaraq access modifier-i hansıdır?",
        options: ["private", "protected", "public", "internal"],
        correctIndex: 2,
        hint: "İnterfeys üzvləri standart olaraq public qəbul edilir və gövdəsi olmur."
      }
    }
  },
  Java: {
    Loops: {
      Easy: {
        question: "Java-da 'for (int i = 0; i < 5; i++)' döngüsü neçə dəfə dövr edəcək?",
        options: ["4", "5", "6", "Sonsuz"],
        correctIndex: 1,
        hint: "i = 0, 1, 2, 3, 4 olduqda şərt doğrudur. Cəmi 5 iterasiya."
      },
      Medium: {
        question: "Java-da hansı açar söz döngünün yalnız cari iterasiyasını dayandırır və növbəti iterasiyaya keçir?",
        options: ["break", "continue", "return", "exit"],
        correctIndex: 1,
        hint: "continue ifadəsi aşağıdakı kodları icra etmədən döngünün başına qayıdır."
      },
      Hard: {
        question: "Java-da döngüləri etiketləmək (labeled loops) və daxili döngüdən xarici döngünü kəsmək (break outer) mümkündürmü?",
        options: ["Xeyr, yalnız C++ dilində mümkündür", "Bəli, 'break labelName;' yazmaqla mümkündür", "Yalnız switch bloklarında mümkündür", "Yalnız xüsusi kitabxanalar ilə mümkündür"],
        correctIndex: 1,
        hint: "Java etiketli break/continue dəstəkləyir: 'outerLoop: for(...)' şəklində."
      }
    },
    Collections: {
      Easy: {
        question: "Java-da ölçüsü dinamik olaraq avtomatik böyüyən standart massiv kolleksiyası hansıdır?",
        options: ["Array[]", "ArrayList", "HashMap", "HashSet"],
        correctIndex: 1,
        hint: "ArrayList avtomatik genişlənən massiv strukturudur."
      },
      Medium: {
        question: "Java-da açar-dəyər (key-value) cütlərini unikal şəkildə saxlamaq üçün ən uyğun kolleksiya sinfi hansıdır?",
        options: ["ArrayList", "Vector", "HashMap", "LinkedHashSet"],
        correctIndex: 2,
        hint: "HashMap sinfi açarların unikal olmasını və O(1) axtarış müddətini təmin edir."
      },
      Hard: {
        question: "Java-da 'Fail-Fast' və 'Fail-Safe' iteratorları arasındakı əsas fərq nədir?",
        options: ["Heç bir fərqləri yoxdur", "Fail-Fast iterasiya zamanı kolleksiya dəyişdirilərsə ConcurrentModificationException atır; Fail-Safe isə kopya üzərində işləyir", "Fail-Safe exception atır", "Yalnız massivlərdə işləyirlər"],
        correctIndex: 1,
        hint: "ArrayList standart olaraq fail-fast-dir. ConcurrentHashMap isə fail-safe iterator qaytarır."
      }
    }
  },
  Python: {
    Lists: {
      Easy: {
        question: "Python dilində listə (siyahıya) yeni bir element əlavə etmək üçün hansı metod istifadə olunur?",
        options: ["add()", "push()", "append()", "insert()"],
        correctIndex: 2,
        hint: "my_list.append(item) elementi siyahının sonuna əlavə edir."
      },
      Medium: {
        question: "Python-da list slicing istifadə edərək 'my_list = [10, 20, 30, 40]' siyahısından '[20, 30]' alt-siyahısını almaq üçün hansı yazılış doğrudur?",
        options: ["my_list[1:3]", "my_list[1:2]", "my_list[2:3]", "my_list[0:2]"],
        correctIndex: 0,
        hint: "Slicing zamanı start indeksi daxil, stop indeksi isə daxil deyil: [1:3] yazdıqda 1-ci və 2-ci elementlər götürülür."
      },
      Hard: {
        question: "Python-da 'list comprehension' istifadə edərək [0, 2, 4, 6, 8] siyahısını yaratmaq üçün hansı tək sətirlik ifadə doğrudur?",
        options: ["[x for x in range(5)]", "[x*2 for x in range(5)]", "[x*2 for x in range(10) if x % 2 == 0]", "[x for x in range(10) if x % 2 == 0]"],
        correctIndex: 1,
        hint: "range(5) 0-dan 4-ə qədərdir. Hər element 2-yə vurularaq listə yığılır."
      }
    }
  }
};

export default function AdminPanel() {
  const { usersList, updateUserInfo, deleteUser, addQuest, quests, t,
          adminBanUser, adminUnbanUser, adminTimeoutUser, adminRemoveTimeout } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState('users');
  const [timeoutMinutes, setTimeoutMinutes] = useState(10);
  const [timeoutingUserId, setTimeoutingUserId] = useState(null);

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

  // AI Generator loading states
  const [aiWizardStep, setAiWizardStep] = useState(null); // null | 1 | 2 | 3 | 4 | 5
  const [aiWizardTopic, setAiWizardTopic] = useState('Loops');
  const [aiWizardDifficulty, setAiWizardDifficulty] = useState('Easy'); // 'Easy' | 'Medium' | 'Hard'
  const [aiWizardLang, setAiWizardLang] = useState('C#');

  const triggerAiGenerate = () => {
    // Start step-by-step visual animation wizard
    setAiWizardStep(1);
    
    // Step 1: Analyzing (500ms)
    setTimeout(() => {
      setAiWizardStep(2);
      
      // Step 2: Evaluating difficulty (500ms)
      setTimeout(() => {
        setAiWizardStep(3);
        
        // Step 3: Compiling options (500ms)
        setTimeout(() => {
          setAiWizardStep(4);
          
          // Step 4: Finalizing hints (500ms)
          setTimeout(() => {
            setAiWizardStep(5);
            
            // Finalize: Populate form and close overlay
            setTimeout(() => {
              // Retrieve question from templates pool or fallback
              const langPool = GENERATED_AI_QUESTIONS[aiWizardLang] || GENERATED_AI_QUESTIONS['C#'];
              const topicPool = langPool[aiWizardTopic] || langPool['Loops'];
              const difficultyKey = aiWizardDifficulty === 'Easy' ? 'Easy' : aiWizardDifficulty === 'Medium' ? 'Medium' : 'Hard';
              const generated = topicPool[difficultyKey] || topicPool['Easy'];

              const displayDifficulty = aiWizardDifficulty === 'Easy' ? 'Asan' : aiWizardDifficulty === 'Medium' ? 'Orta' : 'Çətin';
              const xpReward = aiWizardDifficulty === 'Easy' ? 100 : aiWizardDifficulty === 'Medium' ? 150 : 200;
              const goldReward = aiWizardDifficulty === 'Easy' ? 50 : aiWizardDifficulty === 'Medium' ? 75 : 100;
              const defaultIcon = aiWizardTopic === 'Loops' ? '🔄' : aiWizardTopic === 'OOP' ? '🏛️' : aiWizardTopic === 'Lists' ? '📝' : '📦';

              setQuestForm(prev => ({
                ...prev,
                targetLanguage: aiWizardLang,
                targetLevelId: '', // create new level
                title: `${aiWizardLang} — ${aiWizardTopic} Sintaksisi`,
                topic: aiWizardTopic,
                difficulty: displayDifficulty,
                xpReward,
                goldReward,
                icon: defaultIcon,
                description: `Süni İntellekt tərəfindən yaradılmış ${aiWizardDifficulty.toLowerCase()} səviyyəli ${aiWizardLang} tapşırığı.`,
                question: generated.question,
                optionA: generated.options[0] || '',
                optionB: generated.options[1] || '',
                optionC: generated.options[2] || '',
                optionD: generated.options[3] || '',
                correctIndex: generated.correctIndex,
                hint: generated.hint
              }));
              
              setAiWizardStep(null); // Close wizard
            }, 600);
          }, 500);
        }, 500);
      }, 500);
    }, 500);
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
          ) : (
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
                style={{ alignSelf: 'flex-end', height: '38px', fontWeight: 800, padding: '0 1.25rem', boxShadow: 'var(--glow-purple)' }}
              >
                🤖 AI İlə Yarat
              </button>
            </div>
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

      {/* ── AI Generator Step Wizard Overlay ── */}
      {aiWizardStep !== null && (
        <div className="modal-overlay" style={{ zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
            
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

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.25rem' }}>AI sual yaradır...</h3>
            
            {/* Step list sequence */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', textAlign: 'left', background: 'var(--bg-input)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: aiWizardStep >= 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                <span>{aiWizardStep > 1 ? '✅' : aiWizardStep === 1 ? '⚡' : '⚪'}</span>
                <span style={{ fontWeight: aiWizardStep === 1 ? 700 : 500 }}>Dil sintaksis şablonları oxunur...</span>
              </div>
              <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: aiWizardStep >= 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                <span>{aiWizardStep > 2 ? '✅' : aiWizardStep === 2 ? '⚡' : '⚪'}</span>
                <span style={{ fontWeight: aiWizardStep === 2 ? 700 : 500 }}>Mövzu ({aiWizardTopic}) təhlil edilir...</span>
              </div>
              <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: aiWizardStep >= 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                <span>{aiWizardStep > 3 ? '✅' : aiWizardStep === 3 ? '⚡' : '⚪'}</span>
                <span style={{ fontWeight: aiWizardStep === 3 ? 700 : 500 }}>Cavab variantları tərtib edilir...</span>
              </div>
              <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: aiWizardStep >= 4 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                <span>{aiWizardStep > 4 ? '✅' : aiWizardStep === 4 ? '⚡' : '⚪'}</span>
                <span style={{ fontWeight: aiWizardStep === 4 ? 700 : 500 }}>Mükəmməl izahat və ipucu yazılır...</span>
              </div>
            </div>
            
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1rem', fontStyle: 'italic' }}>
              İstifadə olunan model: GPT-4 & Roslyn Compiler Simulator
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

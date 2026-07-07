import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  initialQuestsCSharp,
  initialQuestsJava,
  initialQuestsPython,
  shopItems,
} from '../data/mockData';
import { translations } from '../i18n/translations';
import {
  authenticateUser,
  registerUser,
  getSession,
  setSession,
  clearSession,
  getUserProgress,
  saveUserProgress,
  buildProgressSnapshot,
  DEFAULT_USER_PROGRESS,
  getAllUsersDirectory,
  updateRegisteredUserById,
  updateUserProgressFields,
  deleteRegisteredUserById,
  normalizeRole,
  isAdminRole,
} from '../utils/storage';

const AppContext = createContext(null);

const ALL_TRACKS = ['C#', 'Java', 'Python'];

export const AppProvider = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionEmail, setSessionEmail] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const [language, setLanguage] = useState('az');

  const t = (key, params = {}) => {
    let text = translations[language][key] || translations['az'][key] || key;
    Object.keys(params).forEach((p) => {
      text = text.replace(`{${p}}`, params[p]);
    });
    return text;
  };

  const [user, setUser] = useState({ ...DEFAULT_USER_PROGRESS.user });
  const [lastHeartRegenTime, setLastHeartRegenTime] = useState(Date.now());
  const [timeUntilNextHeart, setTimeUntilNextHeart] = useState(0);

  const [unlockedLanguages, setUnlockedLanguages] = useState([]);
  const [activeProgrammingLanguage, setActiveProgrammingLanguage] = useState(null);

  const [quests, setQuests] = useState({
    'C#': initialQuestsCSharp,
    Java: initialQuestsJava,
    Python: initialQuestsPython,
  });

  const [completedQuests, setCompletedQuests] = useState({
    'C#': [],
    Java: [],
    Python: [],
  });

  const [purchasedItems, setPurchasedItems] = useState([]);
  const [heartPotionPurchasedAt, setHeartPotionPurchasedAt] = useState(null);

  const [ownedAvatarIds, setOwnedAvatarIds] = useState([1]);
  const [activeAvatarId, setActiveAvatarId] = useState(1);
  const [customProfileImage, setCustomProfileImage] = useState(null);
  const [activeAvatarUrl, setActiveAvatarUrl] = useState('🟫');

  const [failedQuestions, setFailedQuestions] = useState([]);
  const [lastSpinTime, setLastSpinTime] = useState(null);

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotAlert, setChatbotAlert] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState([
    {
      sender: 'bot',
      text: 'Salam! Mən sizin AI proqramlaşdırma mentorunuzam. C#, Java, Python dərslərində və ya sintaksis haqqında hər hansı bir sualınız var? (Məs: "Massiv nədir?", "Explain loops")',
    },
  ]);

  const [achievements, setAchievements] = useState({
    firstQuest: false,
    goldSaver: false,
    streakMaster: false,
  });
  const [achievementToast, setAchievementToast] = useState(null);

  const [usersList, setUsersList] = useState([]);
  const skipPersistRef = useRef(false);

  const refreshUsersList = useCallback((email = sessionEmail) => {
    setUsersList(getAllUsersDirectory(email));
  }, [sessionEmail]);

  const applyProgress = useCallback((progress) => {
    setUser(progress.user);
    setUnlockedLanguages(progress.unlockedLanguages || []);
    setActiveProgrammingLanguage(progress.activeProgrammingLanguage);
    setCompletedQuests(progress.completedQuests);
    setPurchasedItems(progress.purchasedItems || []);
    setOwnedAvatarIds(progress.ownedAvatarIds || [1]);
    setActiveAvatarId(progress.activeAvatarId ?? 1);
    setCustomProfileImage(progress.customProfileImage);
    setActiveAvatarUrl(progress.activeAvatarUrl ?? '🟫');
    setAchievements(progress.achievements);
    setFailedQuestions(progress.failedQuestions || []);
    setLastHeartRegenTime(progress.lastHeartRegenTime ?? Date.now());
    setHeartPotionPurchasedAt(progress.heartPotionPurchasedAt);
    setLastSpinTime(progress.lastSpinTime ?? null);
    setCurrentTab(progress.currentTab || 'dashboard');
  }, []);

  // Hydrate session on mount (F5 protection)
  useEffect(() => {
    const session = getSession();
    if (session?.email) {
      const progress = getUserProgress(session.email);
      applyProgress(progress);
      setSessionEmail(session.email);
      setUsersList(getAllUsersDirectory(session.email));
      setIsLoggedIn(true);
    }
    setIsHydrated(true);
  }, [applyProgress]);

  // Keep leaderboard/admin list in sync with live stats
  useEffect(() => {
    if (!isLoggedIn || !sessionEmail) return;
    refreshUsersList(sessionEmail);
  }, [user.username, user.level, user.gold, user.xp, user.role, isLoggedIn, sessionEmail, refreshUsersList]);

  // Persist progress whenever logged-in state changes
  useEffect(() => {
    if (!isHydrated || !isLoggedIn || !sessionEmail || skipPersistRef.current) return;

    const snapshot = buildProgressSnapshot({
      user,
      unlockedLanguages,
      activeProgrammingLanguage,
      completedQuests,
      purchasedItems,
      ownedAvatarIds,
      activeAvatarId,
      customProfileImage,
      activeAvatarUrl,
      achievements,
      failedQuestions,
      lastHeartRegenTime,
      heartPotionPurchasedAt,
      lastSpinTime,
      currentTab,
    });
    saveUserProgress(sessionEmail, snapshot);
  }, [
    isHydrated,
    isLoggedIn,
    sessionEmail,
    user,
    unlockedLanguages,
    activeProgrammingLanguage,
    completedQuests,
    purchasedItems,
    ownedAvatarIds,
    activeAvatarId,
    customProfileImage,
    activeAvatarUrl,
    achievements,
    failedQuestions,
    lastHeartRegenTime,
    heartPotionPurchasedAt,
    lastSpinTime,
    currentTab,
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const hasCompletedAnyQuest = Object.values(completedQuests).some((list) => list.length >= 1);
    if (!achievements.firstQuest && hasCompletedAnyQuest) {
      unlockAchievement('firstQuest', t('achFirstQuestTitle') || 'İlk Addım', '+100 Gold', '🏆');
    }
    if (!achievements.goldSaver && user.gold > 500) {
      unlockAchievement('goldSaver', t('achGoldSaverTitle') || 'Qənaətçil', '+100 Gold', '💰');
    }
    if (!achievements.streakMaster && user.streak >= 3) {
      unlockAchievement('streakMaster', t('achStreakMasterTitle') || 'Ardıcıl Oyunçu', '+100 Gold', '🔥');
    }
  }, [completedQuests, user.gold, user.streak, isLoggedIn, achievements]);

  const unlockAchievement = (id, title, rewardText, icon) => {
    setAchievements((prev) => ({ ...prev, [id]: true }));
    setUser((prev) => ({ ...prev, gold: prev.gold + 100 }));
    setAchievementToast({ id, title, rewardText, icon });
    setTimeout(() => setAchievementToast(null), 4500);
  };

  const REGEN_TIME_MS = 5 * 60 * 1000;

  useEffect(() => {
    const interval = setInterval(() => {
      if (user.hearts < 3) {
        const now = Date.now();
        const timePassed = now - lastHeartRegenTime;

        if (timePassed >= REGEN_TIME_MS) {
          setUser((prev) => ({ ...prev, hearts: Math.min(3, prev.hearts + 1) }));
          setLastHeartRegenTime(now);
          setTimeUntilNextHeart(REGEN_TIME_MS);
        } else {
          setTimeUntilNextHeart(REGEN_TIME_MS - timePassed);
        }
      } else {
        setTimeUntilNextHeart(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user.hearts, lastHeartRegenTime]);

  const triggerAIExplanation = (questionText, correctOptionText, userOptionText, hint) => {
    setIsChatbotOpen(true);
    setChatbotAlert(true);
    setTimeout(() => setChatbotAlert(false), 4000);

    const systemMsg = {
      sender: 'system',
      text: '🚨 Sistem: Səhv etdiyiniz sualı analiz etdim! Gəlin sizə bu sintaksisin niyə səhv olduğunu və düzgün məntiqi izah edim...',
    };

    const coachExplanation = `💡 Mentor Şərhi:\nSiz "${userOptionText}" variantını seçdiniz, lakin düzgün cavab "${correctOptionText}" olmalı idi.\n\nSual: "${questionText}"\n\nİpucu: ${hint || 'Sintaksis qaydalarına diqqət edin.'}\n\nUnutmayın, hər bir səhv öyrənmək üçün yeni bir şansdır! Yenidən cəhd etməkdən çəkinməyin, kod yazmağa davam edin! 🚀`;

    setChatbotMessages((prev) => [...prev, systemMsg, { sender: 'bot', text: coachExplanation }]);
  };

  const showToast = (message, icon = '✅') => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 3000);
  };

  const register = ({ username, email, password }) => {
    const result = registerUser({ username, email, password });
    if (!result.ok) return result;
    return { ok: true, email: result.user.email };
  };

  const login = (email, password) => {
    const auth = authenticateUser(email, password);
    if (!auth.ok) return auth;

    skipPersistRef.current = true;
    const progress = getUserProgress(auth.user.email);
    applyProgress(progress);
    setSessionEmail(auth.user.email);
    setSession(auth.user.email);
    setUsersList(getAllUsersDirectory(auth.user.email));
    setIsLoggedIn(true);
    skipPersistRef.current = false;

    return { ok: true, user: auth.user };
  };

  const logout = () => {
    clearSession();
    setIsLoggedIn(false);
    setSessionEmail(null);
    setUsersList([]);
    setIsChatbotOpen(false);
    setChatbotAlert(false);
    setCurrentTab('dashboard');
  };

  const selectPrimaryLanguage = (lang) => {
    setUnlockedLanguages([lang]);
    setActiveProgrammingLanguage(lang);
    showToast(`${lang} kursu aktivləşdirildi! 🎓`, '🚀');
  };

  const unlockLanguage = (lang) => {
    if (unlockedLanguages.includes(lang)) {
      setActiveProgrammingLanguage(lang);
      return true;
    }
    setUnlockedLanguages((prev) => [...prev, lang]);
    setActiveProgrammingLanguage(lang);
    showToast(`${lang} dil yolu profilinizə əlavə edildi! 🌍`, '✨');
    return true;
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const addGold = (amount) => setUser((prev) => ({ ...prev, gold: prev.gold + amount }));
  const spendGold = (amount) => setUser((prev) => ({ ...prev, gold: Math.max(0, prev.gold - amount) }));

  const addXp = (amount) => {
    setUser((prev) => {
      const newXp = prev.xp + amount;
      if (newXp >= prev.maxXp) {
        showToast(`SEVİYYƏ ATLADIZ! Seviyyə ${prev.level + 1} 🎉`, '🚀');
        return { ...prev, xp: newXp - prev.maxXp, level: prev.level + 1 };
      }
      return { ...prev, xp: newXp };
    });
  };

  const completeQuest = (quest) => {
    if (!activeProgrammingLanguage) return;
    const currentList = completedQuests[activeProgrammingLanguage] || [];
    if (currentList.includes(quest.id)) return;

    setCompletedQuests((prev) => ({
      ...prev,
      [activeProgrammingLanguage]: [...(prev[activeProgrammingLanguage] || []), quest.id],
    }));

    addGold(quest.goldReward);
    addXp(quest.xpReward);
    showToast(`+${quest.goldReward} 🪙  +${quest.xpReward} XP qazandınız!`, '⭐');
  };

  const deductHeart = () => {
    setUser((prev) => {
      if (prev.hearts > 0) {
        if (prev.hearts === 3) setLastHeartRegenTime(Date.now());
        return { ...prev, hearts: prev.hearts - 1 };
      }
      return prev;
    });
  };

  const useJoker = () => {
    if (user.jokers > 0) {
      setUser((prev) => ({ ...prev, jokers: prev.jokers - 1 }));
      return true;
    }
    return false;
  };

  const buyItem = (item) => {
    if (user.gold < item.price) return false;

    if (item.itemType === 'avatar' || item.itemType === 'badge') {
      if (purchasedItems.includes(item.id)) return false;
      spendGold(item.price);
      setPurchasedItems((prev) => [...prev, item.id]);

      if (item.itemType === 'avatar') {
        setOwnedAvatarIds((prev) => [...prev, item.id]);
        showToast(`"${item.name}" koleksiyona əlavə edildi! Profildən geyindirin 🎭`, '🛒');
      } else {
        showToast(`"${item.name}" alındı! 🎉`, '🛒');
      }
      return true;
    }

    if (item.itemType === 'potion_heart') {
      const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
      const weeklyLimitActive =
        heartPotionPurchasedAt !== null && Date.now() - heartPotionPurchasedAt < WEEK_MS;
      if (weeklyLimitActive) {
        showToast('Stokda yoxdur (Həftəlik limit)', '⚠️');
        return false;
      }
      if (user.hearts >= 3) {
        showToast('Canınız onsuz da doludur!', '💖');
        return false;
      }
      spendGold(item.price);
      setHeartPotionPurchasedAt(Date.now());
      setUser((prev) => ({ ...prev, hearts: Math.min(3, prev.hearts + 1) }));
      showToast('Can İksiri istifadə edildi! +1 Can', '💖');
      return true;
    }

    if (item.itemType === 'joker_5050') {
      spendGold(item.price);
      setUser((prev) => ({ ...prev, jokers: prev.jokers + 1 }));
      showToast('50/50 Joker alındı!', '🃏');
      return true;
    }

    return false;
  };

  const equipAvatar = (avatarId) => {
    if (!ownedAvatarIds.includes(avatarId)) return false;
    setActiveAvatarId(avatarId);
    const item = shopItems.find((i) => i.id === avatarId);
    if (item) {
      setActiveAvatarUrl(item.emoji);
      setCustomProfileImage(null);
    }
    return true;
  };

  const setCustomProfilePhoto = (dataUrl) => {
    setCustomProfileImage(dataUrl);
    setActiveAvatarUrl(dataUrl);
    setActiveAvatarId(null);
  };

  const clearCustomProfilePhoto = () => {
    setCustomProfileImage(null);
    const fallbackId = ownedAvatarIds.includes(activeAvatarId) ? activeAvatarId : ownedAvatarIds[0];
    const item = shopItems.find((i) => i.id === fallbackId);
    setActiveAvatarId(fallbackId ?? 1);
    setActiveAvatarUrl(item?.emoji ?? user.emoji);
  };

  const updateUsername = (newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return false;
    setUser((prev) => ({ ...prev, username: trimmed }));
    return true;
  };

  const addFailedQuestion = (questId, questionObj) => {
    setFailedQuestions((prev) => {
      const exists = prev.some(
        (item) => item.questId === questId && item.question === questionObj.question
      );
      if (exists) return prev;
      return [...prev, { questId, ...questionObj }];
    });
  };

  const solveFailedQuestion = (questId, questionText) => {
    setFailedQuestions((prev) =>
      prev.filter((item) => !(item.questId === questId && item.question === questionText))
    );
  };

  const recordSpin = (timestamp) => setLastSpinTime(timestamp);

  const addQuest = (newQuest, targetLevelId, targetLanguage) => {
    setQuests((prev) => {
      const langKey = targetLanguage || activeProgrammingLanguage || 'C#';
      const trackQuests = prev[langKey] || [];

      if (targetLevelId) {
        return {
          ...prev,
          [langKey]: trackQuests.map((q) => {
            if (q.id === Number(targetLevelId)) {
              return { ...q, challenges: [...(q.challenges || []), newQuest.challenge] };
            }
            return q;
          }),
        };
      }

      const nextId = trackQuests.length > 0 ? Math.max(...trackQuests.map((q) => q.id)) + 1 : 1;
      const formattedQuest = {
        ...newQuest,
        id: nextId,
        levelName: `Level ${trackQuests.length + 1}: ${newQuest.topic || 'Custom'}`,
        challenges: [newQuest.challenge],
      };
      showToast(`Yeni mərhələ yaradıldı (${langKey}): "${formattedQuest.title}"`, '🆕');
      return { ...prev, [langKey]: [...trackQuests, formattedQuest] };
    });
  };

  const updateUserInfo = (userId, updatedFields) => {
    const target = usersList.find((u) => u.id === userId);
    if (!target) return;

    const normalizedNewRole = updatedFields.role ? normalizeRole(updatedFields.role) : null;
    const wasAdmin = isAdminRole(user.role);
    const isSelf = target.email === sessionEmail?.toLowerCase();

    if (normalizedNewRole) {
      updateRegisteredUserById(userId, { role: normalizedNewRole });
    }

    const progressUpdates = {};
    if (updatedFields.name !== undefined) progressUpdates.username = updatedFields.name;
    if (updatedFields.level !== undefined) progressUpdates.level = Number(updatedFields.level);
    if (updatedFields.gold !== undefined) progressUpdates.gold = Number(updatedFields.gold);
    if (updatedFields.xp !== undefined) progressUpdates.xp = Number(updatedFields.xp);
    if (normalizedNewRole) progressUpdates.role = normalizedNewRole;

    updateUserProgressFields(target.email, progressUpdates);

    if (isSelf) {
      setUser((prev) => ({ ...prev, ...progressUpdates }));

      if (wasAdmin && normalizedNewRole === 'İstifadəçi') {
        setCurrentTab('dashboard');
        showToast('Admin hüquqlarınız ləğv edildi. Dashboard-a yönləndirildiniz.', '⚠️');
      }
    }

    refreshUsersList(sessionEmail);
    showToast('İstifadəçi məlumatları yeniləndi', '✏️');
  };

  const deleteUser = (userId) => {
    const target = usersList.find((u) => u.id === userId);
    if (!target || target.email === sessionEmail?.toLowerCase()) return;

    deleteRegisteredUserById(userId);
    refreshUsersList(sessionEmail);
    showToast('İstifadəçi silindi', '🗑️');
  };

  const value = {
    language,
    setLanguage,
    t,
    isHydrated,
    isLoggedIn,
    sessionEmail,
    register,
    login,
    logout,
    theme,
    toggleTheme,
    currentTab,
    setCurrentTab,
    user,
    addGold,
    spendGold,
    addXp,
    deductHeart,
    useJoker,
    timeUntilNextHeart,
    quests,
    completedQuests,
    completeQuest,
    purchasedItems,
    buyItem,
    ownedAvatarIds,
    activeAvatarId,
    equipAvatar,
    activeAvatarUrl,
    setActiveAvatarUrl,
    updateUsername,
    customProfileImage,
    setCustomProfileImage: setCustomProfilePhoto,
    clearCustomProfilePhoto,
    heartPotionPurchasedAt,
    unlockedLanguages,
    ALL_TRACKS,
    activeProgrammingLanguage,
    setActiveProgrammingLanguage,
    selectPrimaryLanguage,
    unlockLanguage,
    failedQuestions,
    addFailedQuestion,
    solveFailedQuestion,
    lastSpinTime,
    recordSpin,
    isChatbotOpen,
    setIsChatbotOpen,
    chatbotAlert,
    chatbotMessages,
    setChatbotMessages,
    triggerAIExplanation,
    achievements,
    achievementToast,
    setAchievementToast,
    toast,
    usersList,
    addQuest,
    updateUserInfo,
    deleteUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

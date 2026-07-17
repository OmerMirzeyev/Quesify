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
  clearAdminLoggedIn,
  clearAuthSession,
  setAuthSession,
  getUserProgress,
  saveUserProgress,
  buildProgressSnapshot,
  DEFAULT_USER_PROGRESS,
  getAllUsersDirectory,
  getLeaderboardForTrack,
  getGlobalLeaderboard,
  getStoredQuests,
  saveStoredQuests,
  updateRegisteredUserById,
  updateUserProgressFields,
  deleteRegisteredUserById,
  normalizeRole,
  isAdminRole,
  isAppAdmin,
  EMPTY_TRACK_STATS,
  ALL_TRACKS as STORAGE_TRACKS,
  getRegisteredUsers,
} from '../utils/storage';

const AppContext = createContext(null);

const ALL_TRACKS = STORAGE_TRACKS;

export const AppProvider = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionEmail, setSessionEmail] = useState(null);
  const [userRole, setUserRole] = useState('');
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
  const [welcomeBonusClaimed, setWelcomeBonusClaimed] = useState(false);
  const [lastHeartRegenTime, setLastHeartRegenTime] = useState(Date.now());
  const [timeUntilNextHeart, setTimeUntilNextHeart] = useState(0);

  const [unlockedLanguages, setUnlockedLanguages] = useState([]);
  const [activeProgrammingLanguage, setActiveProgrammingLanguage] = useState(null);

  // Global shared quests state (loaded from LocalStorage)
  const [quests, setQuests] = useState({});

  const [completedQuests, setCompletedQuests] = useState({
    'C#': [],
    Java: [],
    Python: [],
  });

  const [trackStats, setTrackStats] = useState(EMPTY_TRACK_STATS());

  const [purchasedItems, setPurchasedItems] = useState([]);
  const [heartPotionPurchasedAt, setHeartPotionPurchasedAt] = useState(null);

  const [ownedAvatarIds, setOwnedAvatarIds] = useState([1]);
  const [activeAvatarId, setActiveAvatarId] = useState(1);
  const [customProfileImage, setCustomProfileImage] = useState(null);
  const [activeAvatarUrl, setActiveAvatarUrl] = useState('🎮');

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

  // New features added for state integration (loaded per user)
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [chats, setChats] = useState({});
  const [claimedChests, setClaimedChests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Default notifications for a new user
  const getInitialNotifications = () => [
    {
      id: 1,
      type: 'system',
      message: 'Questify platformasına xoş gəlmisiniz! 🚀',
      icon: '🎉',
      isRead: false,
      timestamp: Date.now() - 3600000 * 3,
    },
    {
      id: 2,
      type: 'friend',
      message: 'Kamal sizə mesaj göndərdi: "Bugün C# tapşırığını bitirək?" 💬',
      icon: '👤',
      isRead: false,
      timestamp: Date.now() - 3600000 * 2,
    },
    {
      id: 3,
      type: 'chapter',
      message: '2-ci Fəsil kilidini açmaq üçün 1-ci Fəsilin 20 səviyyəsini tamamlayın! 🔓',
      icon: '🗺️',
      isRead: false,
      timestamp: Date.now() - 3600000,
    },
    {
      id: 4,
      type: 'info',
      message: 'Çərx-i Fələk bölməsindən hər gün pulsuz hədiyyələr qazanın! 🎡',
      icon: '🎁',
      isRead: true,
      timestamp: Date.now() - 1800000,
    },
  ];

  const skipPersistRef = useRef(false);

  const refreshUsersList = useCallback((email = sessionEmail) => {
    setUsersList(getAllUsersDirectory(email));
  }, [sessionEmail]);

  const applyProgress = useCallback((progress) => {
    setUser(progress.user);
    setWelcomeBonusClaimed(progress.welcomeBonusClaimed ?? true);
    setTrackStats(progress.trackStats || EMPTY_TRACK_STATS());
    setUnlockedLanguages(progress.unlockedLanguages || []);
    setActiveProgrammingLanguage(progress.activeProgrammingLanguage);
    setCompletedQuests(progress.completedQuests);
    setPurchasedItems(progress.purchasedItems || []);
    setOwnedAvatarIds(progress.ownedAvatarIds || [1]);
    setActiveAvatarId(progress.activeAvatarId ?? 1);
    setCustomProfileImage(progress.customProfileImage);
    setActiveAvatarUrl(progress.activeAvatarUrl ?? '🎮');
    setAchievements(progress.achievements);
    setFailedQuestions(progress.failedQuestions || []);
    setLastHeartRegenTime(progress.lastHeartRegenTime ?? Date.now());
    setHeartPotionPurchasedAt(progress.heartPotionPurchasedAt);
    setLastSpinTime(progress.lastSpinTime ?? null);
    setCurrentTab(progress.currentTab || 'dashboard');
    // Hydrate new features
    setFriends(progress.friends || []);
    setFriendRequests(progress.friendRequests || []);
    setChats(progress.chats || {});
    setClaimedChests(progress.claimedChests || []);
    setNotifications(progress.notifications && progress.notifications.length > 0 ? progress.notifications : getInitialNotifications());
  }, []);

  // Hydrate session and global quests on mount (F5 protection)
  useEffect(() => {
    setQuests(getStoredQuests()); // Hydrate quests from global shared storage
    const session = getSession();
    if (session?.email) {
      const progress = getUserProgress(session.email);
      applyProgress(progress);
      setSessionEmail(session.email);
      setUsersList(getAllUsersDirectory(session.email));
      setIsLoggedIn(true);

      // Persist and check role via useEffect
      const role = localStorage.getItem('userRole');
      setUserRole(role || '');
    }
    setIsHydrated(true);
  }, [applyProgress]);

  // Keep leaderboard/admin list in sync with live stats
  useEffect(() => {
    if (!isLoggedIn || !sessionEmail) return;
    refreshUsersList(sessionEmail);
  }, [user.username, user.level, user.gold, user.xp, user.role, trackStats, isLoggedIn, sessionEmail, refreshUsersList]);

  // Persist progress whenever logged-in state changes
  useEffect(() => {
    if (!isHydrated || !isLoggedIn || !sessionEmail || skipPersistRef.current) return;

    const snapshot = buildProgressSnapshot({
      user,
      welcomeBonusClaimed,
      trackStats,
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
      // Pass new features to persist
      friends,
      friendRequests,
      chats,
      claimedChests,
      notifications,
    });
    saveUserProgress(sessionEmail, snapshot);
  }, [
    isHydrated,
    isLoggedIn,
    sessionEmail,
    user,
    welcomeBonusClaimed,
    trackStats,
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
    friends,
    friendRequests,
    chats,
    claimedChests,
    notifications,
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

  const register = ({ firstName, lastName, email, password, emoji }) => {
    const result = registerUser({ firstName, lastName, email, password, emoji });
    if (!result.ok) return result;
    // Show welcome bonus toast after a small delay (caller handles modal close)
    setTimeout(() => {
      showToast('🎁 Xoş gəldiniz! +100 Qızıl · ❤️ 3 Can bonusu qazandınız!', '🎉');
    }, 400);
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

    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);

    skipPersistRef.current = false;

    return { ok: true, user: auth.user, role };
  };

  const logout = () => {
    clearSession();
    clearAuthSession();
    setUserRole('');
    setIsLoggedIn(false);
    setSessionEmail(null);
    setUsersList([]);
    setFriends([]);
    setFriendRequests([]);
    setChats({});
    setClaimedChests([]);
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

  const addTrackRewards = (track, goldAmount, xpAmount) => {
    if (!track) return;
    setTrackStats((prev) => ({
      ...prev,
      [track]: {
        xp: (prev[track]?.xp || 0) + xpAmount,
        gold: (prev[track]?.gold || 0) + goldAmount,
      },
    }));
  };

  const addGold = (amount, track = null) => {
    setUser((prev) => ({ ...prev, gold: prev.gold + amount }));
    if (track) {
      setTrackStats((prev) => ({
        ...prev,
        [track]: { ...prev[track], gold: (prev[track]?.gold || 0) + amount },
      }));
    }
  };

  const spendGold = (amount) => setUser((prev) => ({ ...prev, gold: Math.max(0, prev.gold - amount) }));

  const addXp = (amount, track = null) => {
    setUser((prev) => {
      const newXp = prev.xp + amount;
      if (newXp >= prev.maxXp) {
        showToast(`SEVİYYƏ ATLADIZ! Seviyyə ${prev.level + 1} 🎉`, '🚀');
        return { ...prev, xp: newXp - prev.maxXp, level: prev.level + 1 };
      }
      return { ...prev, xp: newXp };
    });
    if (track) {
      setTrackStats((prev) => ({
        ...prev,
        [track]: { ...prev[track], xp: (prev[track]?.xp || 0) + amount },
      }));
    }
  };

  /** Add heart(s) — capped at 5 max via spin wheel or other rewards */
  const addHeart = (amount = 1) => {
    setUser((prev) => ({ ...prev, hearts: Math.min(5, prev.hearts + amount) }));
    showToast(`+${amount} ❤️ Can qazandınız!`, '💖');
  };

  const completeQuest = (quest) => {
    if (!activeProgrammingLanguage) return;
    const currentList = completedQuests[activeProgrammingLanguage] || [];
    if (currentList.includes(quest.id)) return;

    const updatedList = [...currentList, quest.id];
    setCompletedQuests((prev) => ({
      ...prev,
      [activeProgrammingLanguage]: updatedList,
    }));

    addGold(quest.goldReward);
    addXp(quest.xpReward);
    addTrackRewards(activeProgrammingLanguage, quest.goldReward, quest.xpReward);
    showToast(`+${quest.goldReward} 🪙  +${quest.xpReward} XP qazandınız!`, '⭐');

    // Push quest completion notification
    pushNotification('quest', `${quest.title} mərhələsini tamamladınız! +${quest.goldReward} 🪙`, '🏆');

    // Check if Map 1 (Chapter 1) is fully completed (exactly 20 levels completed)
    // Map 1 levels have IDs 1-20
    const ch1Ids = Array.from({ length: 20 }, (_, i) => i + 1);
    const completedCh1Count = updatedList.filter(id => ch1Ids.includes(id)).length;
    const prevCompletedCh1Count = currentList.filter(id => ch1Ids.includes(id)).length;

    if (completedCh1Count === 20 && prevCompletedCh1Count < 20) {
      pushNotification('chapter', `Təbriklər! 1-ci Fəsli bitirdiniz. 2-ci Fəsil aktivləşdi! 🔓`, '🚀');
    }
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
        pushNotification('shop', `"${item.name}" avatarı alındı! 🎭`, '🛒');
      } else {
        showToast(`"${item.name}" alındı! 🎉`, '🛒');
        pushNotification('shop', `"${item.name}" nişanı alındı! 🏆`, '🛒');
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
      pushNotification('shop', 'Can İksiri istifadə edildi! +1 Can ❤️', '💖');
      return true;
    }

    if (item.itemType === 'joker_5050') {
      spendGold(item.price);
      setUser((prev) => ({ ...prev, jokers: prev.jokers + 1 }));
      showToast('50/50 Joker alındı!', '🃏');
      pushNotification('shop', '50/50 Joker alındı! 🃏', '🃏');
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

  const pushNotification = useCallback((type, message, icon) => {
    setNotifications((prev) => [
      {
        id: Date.now() + Math.random(),
        type,
        message,
        icon,
        isRead: false,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Global quest addition + storage write
  const addQuest = (newQuest, targetLevelId, targetLanguage) => {
    setQuests((prev) => {
      const langKey = targetLanguage || activeProgrammingLanguage || 'C#';
      const trackQuests = prev[langKey] || [];

      let updated;
      if (targetLevelId) {
        updated = {
          ...prev,
          [langKey]: trackQuests.map((q) => {
            if (q.id === Number(targetLevelId)) {
              return { ...q, challenges: [...(q.challenges || []), newQuest.challenge] };
            }
            return q;
          }),
        };
      } else {
        const nextId = trackQuests.length > 0 ? Math.max(...trackQuests.map((q) => q.id)) + 1 : 1;
        const formattedQuest = {
          ...newQuest,
          id: nextId,
          levelName: `Level ${trackQuests.length + 1}: ${newQuest.topic || 'Custom'}`,
          challenges: [newQuest.challenge],
        };
        updated = { ...prev, [langKey]: [...trackQuests, formattedQuest] };
        showToast(`Yeni mərhələ yaradıldı (${langKey}): "${formattedQuest.title}"`, '🆕');
      }

      saveStoredQuests(updated); // Sync global quests with LocalStorage
      return updated;
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

  const getLeaderboard = (track) => {
    if (track === 'Global') return getGlobalLeaderboard(sessionEmail);
    return getLeaderboardForTrack(track, sessionEmail);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // FRIENDSHIP & CHAT SYSTEM OPERATIONS (State simulation)
  // ──────────────────────────────────────────────────────────────────────────
  
  const sendFriendRequest = (targetEmail) => {
    const target = targetEmail.trim().toLowerCase();
    if (target === sessionEmail.toLowerCase()) {
      showToast('Özünüzə dostluq göndərə bilməzsiniz!', '⚠️');
      return false;
    }

    const allUsers = getRegisteredUsers();
    const exists = allUsers.find(u => u.email === target);
    if (!exists) {
      showToast('İstifadəçi tapılmadı.', '⚠️');
      return false;
    }

    // Check if already friends
    if (friends.includes(target)) {
      showToast('Bu istifadəçi ilə artıq dostsunuz.', '⚠️');
      return false;
    }

    // Check if request already pending
    const alreadySent = friendRequests.some(r => r.toEmail === target && r.status === 'pending');
    if (alreadySent) {
      showToast('Dostluq sorğusu artıq göndərilib.', 'ℹ️');
      return false;
    }

    // Add a pending request to current user and target user's storage
    const newRequest = {
      id: Date.now(),
      fromEmail: sessionEmail,
      fromUsername: user.username,
      fromEmoji: activeAvatarUrl || user.emoji,
      toEmail: target,
      status: 'pending',
      timestamp: Date.now()
    };

    // Update current user requests state
    setFriendRequests(prev => [...prev, newRequest]);

    // Simulating instant database updates by pushing to target user's progress record in LocalStorage
    const targetProgress = getUserProgress(target);
    targetProgress.friendRequests = targetProgress.friendRequests || [];
    // Ensure no duplicates in target's requests
    if (!targetProgress.friendRequests.some(r => r.fromEmail === sessionEmail)) {
      targetProgress.friendRequests.push(newRequest);
      saveUserProgress(target, targetProgress);
    }

    showToast('Dostluq sorğusu göndərildi!', '✉️');
    return true;
  };

  const acceptFriendRequest = (requestId) => {
    const req = friendRequests.find(r => r.id === requestId);
    if (!req) return;

    const senderEmail = req.fromEmail.toLowerCase();
    const receiverEmail = req.toEmail.toLowerCase();
    const otherUserEmail = senderEmail === sessionEmail.toLowerCase() ? receiverEmail : senderEmail;

    // Add to current user's friends list state
    setFriends(prev => {
      if (!prev.includes(otherUserEmail)) {
        return [...prev, otherUserEmail];
      }
      return prev;
    });

    // Remove request state
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));

    // Update the other user's friendship list in storage (simulates SQL UPDATE)
    const otherUserProgress = getUserProgress(otherUserEmail);
    otherUserProgress.friends = otherUserProgress.friends || [];
    if (!otherUserProgress.friends.includes(sessionEmail)) {
      otherUserProgress.friends.push(sessionEmail);
    }
    // Remove request on other user's end
    otherUserProgress.friendRequests = (otherUserProgress.friendRequests || []).filter(r => r.id !== requestId);
    saveUserProgress(otherUserEmail, otherUserProgress);

    showToast('Dostluq sorğusu qəbul edildi! 👥', '🎉');
    pushNotification('friend', `${req.fromUsername || req.fromEmail} ilə artıq dostsunuz! 👥`, '🎉');
  };

  const rejectFriendRequest = (requestId) => {
    const req = friendRequests.find(r => r.id === requestId);
    if (!req) return;

    // Filter local request state
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));

    // Clean up other user request in storage
    const otherUserEmail = req.fromEmail.toLowerCase() === sessionEmail.toLowerCase() ? req.toEmail.toLowerCase() : req.fromEmail.toLowerCase();
    const otherUserProgress = getUserProgress(otherUserEmail);
    otherUserProgress.friendRequests = (otherUserProgress.friendRequests || []).filter(r => r.id !== requestId);
    saveUserProgress(otherUserEmail, otherUserProgress);

    showToast('Sorğu rədd edildi.', 'ℹ️');
  };

  const sendChatMessage = (friendEmail, text) => {
    if (!text.trim()) return;
    const cleanEmail = friendEmail.toLowerCase();

    const newMessage = {
      id: Date.now(),
      sender: sessionEmail,
      text: text,
      timestamp: Date.now(),
      isRead: true, // Messages sent by the current user are always "read" by them
    };

    // Update current user chat state
    setChats(prev => {
      const prevMessages = prev[cleanEmail] || [];
      return {
        ...prev,
        [cleanEmail]: [...prevMessages, newMessage]
      };
    });

    // Push the message to the friend's chat storage with isRead: false
    // (it is unread from the friend's perspective until they open it)
    const messageForFriend = { ...newMessage, isRead: false };
    const otherUserProgress = getUserProgress(cleanEmail);
    otherUserProgress.chats = otherUserProgress.chats || {};
    const friendConvKey = sessionEmail.toLowerCase();
    otherUserProgress.chats[friendConvKey] = otherUserProgress.chats[friendConvKey] || [];
    otherUserProgress.chats[friendConvKey].push(messageForFriend);
    saveUserProgress(cleanEmail, otherUserProgress);
  };

  // Mark all messages from a single chat as read
  const markChatAsRead = (friendEmail) => {
    if (!friendEmail) return;
    const cleanEmail = friendEmail.toLowerCase();
    setChats(prev => {
      if (!prev[cleanEmail]) return prev;
      return {
        ...prev,
        [cleanEmail]: prev[cleanEmail].map(msg => ({ ...msg, isRead: true }))
      };
    });
  };

  // Mark all messages from all chats as read and persist to storage
  const markAllChatsRead = () => {
    setChats(prev => {
      const updated = {};
      Object.keys(prev).forEach(friendKey => {
        updated[friendKey] = (prev[friendKey] || []).map(msg => ({ ...msg, isRead: true }));
      });
      return updated;
    });
  };

  // RPG Roadmap chest claims state
  const claimTreasureChest = (chestId) => {
    if (claimedChests.includes(chestId)) return false;

    setClaimedChests(prev => [...prev, chestId]);
    addGold(25); // Milestone reward gold
    showToast('Xəzinə sandığı tapıldı! +25 Qızıl 🪙', '🎁');
    return true;
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
    addHeart,
    deductHeart,
    useJoker,
    timeUntilNextHeart,
    quests,
    completedQuests,
    completeQuest,
    trackStats,
    getLeaderboard,
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
    notifications,
    pushNotification,
    markAllNotificationsRead,
    clearNotifications,
    // Exposing advanced features states & handlers
    friends,
    friendRequests,
    chats,
    claimedChests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    sendChatMessage,
    markChatAsRead,
    markAllChatsRead,
    claimTreasureChest,
    userRole,
    setUserRole
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

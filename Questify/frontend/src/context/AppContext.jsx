import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  initialQuestsCSharp,
  initialQuestsJava,
  initialQuestsPython,
  shopItems,
  QUESTS_BY_CHAPTER,
} from '../data/mockData';
import { translations } from '../i18n/translations';
import { apiFetch } from '../utils/api';
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
  updateRegisteredUserByEmail,
  getAuthTokenExpiration,
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
  const [isBanned, setIsBanned] = useState(false);
  const [timeoutUntil, setTimeoutUntil] = useState(null);
  const [dynamicShopItems, setDynamicShopItems] = useState([]);

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

  // Coin wallet (backend-authoritative shop currency — separate from the legacy local
  // `gold`/XP economy, which stays client-side for this pass).
  const [coins, setCoins] = useState(0);
  const [hasUnlimitedCoins, setHasUnlimitedCoins] = useState(false);
  // Full owned-items list from the backend (covers every cosmetic category — avatar/frame/theme/
  // badge — not just the legacy avatar-only purchasedItems/ownedAvatarIds arrays below).
  const [marketInventory, setMarketInventory] = useState([]);
  // Backend-authoritative map unlock/completion state: [{track, chapterIndex, levelIndex, isUnlocked, isCompleted}]
  const [mapProgress, setMapProgress] = useState([]);
  // One-shot "next completed level gives 2x XP" flag, consumed by a Double XP Potion purchase.
  const [doubleXpPending, setDoubleXpPending] = useState(false);
  const [streakFreezes, setStreakFreezes] = useState(0);

  // Load shop items from backend on mount
  const loadShopItems = async () => {
    try {
      const { ok, data } = await apiFetch('/api/shop');
      if (ok) setDynamicShopItems(data);
    } catch { /* offline fallback to mockData */ }
  };

  // Admin ban/timeout poll — check every 30s
  const checkBanStatus = async (email) => {
    if (!email) return;
    try {
      const { ok, data } = await apiFetch(`/api/auth/status?email=${encodeURIComponent(email)}`, { auth: true });
      if (ok) {
        setIsBanned(data.isBanned ?? false);
        setTimeoutUntil(data.timeoutUntil ? new Date(data.timeoutUntil) : null);
      }
    } catch { /* ignore network errors */ }
  };

  // Sync profile (avatar/emoji) to backend — target user is derived from the caller's own JWT
  const syncProfileToBackend = async (avatarUrl, emoji) => {
    try {
      await apiFetch('/api/auth/update-profile', {
        method: 'POST',
        auth: true,
        body: { avatarUrl, emoji },
      });
    } catch { /* offline — state already persisted locally */ }
  };

  // Coin wallet + inventory (backend-authoritative)
  const loadMarketInventory = async () => {
    try {
      const { ok, data } = await apiFetch('/api/market/inventory', { auth: true });
      if (ok) {
        setCoins(data.coins ?? 0);
        setHasUnlimitedCoins(data.hasUnlimitedCoins ?? false);
        setMarketInventory(data.inventory || []);
        applyEquippedTheme(data.inventory || []);
      }
    } catch { /* offline — keep last known balance */ }
  };

  // Custom Neon Theme — a lightweight CSS-variable override rather than a full theming engine.
  // Looks up the equipped "theme" inventory row's matching shop item (for its color) and applies
  // it as an accent override; clears back to the default palette when nothing is equipped.
  const applyEquippedTheme = (inventory) => {
    const equippedTheme = inventory.find((i) => i.itemType === 'theme' && i.isEquipped);
    const root = document.documentElement;
    if (equippedTheme) {
      const shopEntry = dynamicShopItems.find((s) => s.id === equippedTheme.shopItemId);
      const color = shopEntry?.gameColor || '#8b5cf6';
      root.style.setProperty('--accent-purple-light', color);
      root.style.setProperty('--glow-purple', `0 0 24px ${color}66`);
      root.setAttribute('data-neon-theme', 'active');
    } else {
      root.style.removeProperty('--accent-purple-light');
      root.style.removeProperty('--glow-purple');
      root.removeAttribute('data-neon-theme');
    }
  };

  // POST /api/market/equip — used for frame/theme (and, via the existing equipAvatar wrapper
  // below, avatar) single-slot cosmetics.
  const equipMarketItem = async (shopItemId) => {
    try {
      const { ok, status } = await apiFetch('/api/market/equip', {
        method: 'POST',
        auth: true,
        body: { shopItemId },
      });
      if (ok) {
        await loadMarketInventory();
        showToast('Təchiz edildi!', '✨');
      } else {
        showToast(`Xəta: ${status}`, '❌');
      }
      return ok;
    } catch { showToast('Əlaqə xətası', '❌'); return false; }
  };

  // Map progress (backend-authoritative unlock/completion state)
  const loadMapProgress = async (track = null) => {
    try {
      const qs = track ? `?track=${encodeURIComponent(track)}` : '';
      const { ok, data } = await apiFetch(`/api/map/progress${qs}`, { auth: true });
      if (ok) setMapProgress(data.progress || []);
    } catch { /* offline — QuestsGrid falls back to local completedQuests */ }
  };

  const syncMapCompletion = async (track, chapterIndex, levelIndex, isLastLevelOfChapter) => {
    try {
      await apiFetch('/api/map/complete', {
        method: 'POST',
        auth: true,
        body: { track, chapterIndex, levelIndex, isLastLevelOfChapter },
      });
      loadMapProgress(track);
    } catch { /* offline — local completedQuests still gates progress */ }
  };

  // Admin shop management
  const adminAddShopItem = async (newItem) => {
    try {
      const { ok, status } = await apiFetch('/api/shop', {
        method: 'POST',
        auth: true,
        body: newItem,
      });
      if (ok) {
        await loadShopItems();
        showToast(`"${newItem.name}" mağazaya əlavə edildi!`, '🛒');
      } else {
        showToast(`Xəta: ${status}`, '❌');
      }
    } catch { showToast('Əlaqə xətası', '❌'); }
  };

  const adminDeleteShopItem = async (itemId, itemName) => {
    try {
      const { ok, status } = await apiFetch(`/api/shop/${itemId}`, { method: 'DELETE', auth: true });
      if (ok) {
        await loadShopItems();
        showToast(`"${itemName}" silindi!`, '🗑️');
      } else {
        showToast(`Xəta: ${status}`, '❌');
      }
    } catch { showToast('Əlaqə xətası', '❌'); }
  };

  // Admin stock adjustment — `stock=null` (unlimited=true) clears the limit; otherwise sets the
  // absolute new value (the store page's +/- controls compute the new number and call this).
  const adminSetShopItemStock = async (itemId, stock, unlimited = false) => {
    try {
      const qs = unlimited ? 'unlimited=true' : `stock=${Number(stock)}`;
      const { ok, status } = await apiFetch(`/api/shop/${itemId}/stock?${qs}`, { method: 'POST', auth: true });
      if (ok) {
        await loadShopItems();
      } else {
        showToast(`Xəta: ${status}`, '❌');
      }
      return ok;
    } catch { showToast('Əlaqə xətası', '❌'); return false; }
  };

  // Admin user moderation (email-based to bridge localStorage IDs vs DB IDs)
  const adminBanUser = async (userId, email) => {
    try {
      const { ok, status } = await apiFetch(`/api/admin/ban/by-email?email=${encodeURIComponent(email)}`, { method: 'POST', auth: true });
      if (ok) {
        showToast(`${email} blokland\u0131`, '\ud83d\udeab');
        updateRegisteredUserByEmail(email, { isBanned: true, timeoutUntil: null });
        setUsersList(prev => prev.map(u => u.email === email ? { ...u, isBanned: true, timeoutUntil: null } : u));
      } else {
        showToast(`X\u0259ta: ${status}`, '\u274c');
      }
    } catch { showToast('\u018flaq\u0259 x\u0259tas\u0131', '\u274c'); }
  };

  const adminUnbanUser = async (userId, email) => {
    try {
      const { ok, status } = await apiFetch(`/api/admin/unban/by-email?email=${encodeURIComponent(email)}`, { method: 'POST', auth: true });
      if (ok) {
        showToast(`${email} bloku a\u00e7\u0131ld\u0131`, '\u2705');
        updateRegisteredUserByEmail(email, { isBanned: false });
        setUsersList(prev => prev.map(u => u.email === email ? { ...u, isBanned: false } : u));
      } else {
        showToast(`X\u0259ta: ${status}`, '\u274c');
      }
    } catch { showToast('\u018flaq\u0259 x\u0259tas\u0131', '\u274c'); }
  };

  const adminTimeoutUser = async (userId, email, minutes = 10) => {
    try {
      const { ok, status, data } = await apiFetch(`/api/admin/timeout/by-email?email=${encodeURIComponent(email)}&minutes=${minutes}`, { method: 'POST', auth: true });
      if (ok) {
        showToast(`${email} ${minutes} d\u0259qiq\u0259 m\u0259hdudla\u015fd\u0131r\u0131ld\u0131`, '\u23f1\ufe0f');
        updateRegisteredUserByEmail(email, { timeoutUntil: data.timeoutUntil });
        setUsersList(prev => prev.map(u => u.email === email ? { ...u, timeoutUntil: data.timeoutUntil } : u));
      } else {
        showToast(`X\u0259ta: ${status}`, '\u274c');
      }
    } catch { showToast('\u018flaq\u0259 x\u0259tas\u0131', '\u274c'); }
  };

  const adminRemoveTimeout = async (userId, email) => {
    try {
      const { ok, status } = await apiFetch(`/api/admin/remove-timeout/by-email?email=${encodeURIComponent(email)}`, { method: 'POST', auth: true });
      if (ok) {
        showToast(`${email} m\u0259hdudiyy\u0259ti g\u00f6t\u00fcr\u00fcld\u00fc`, '\u2705');
        updateRegisteredUserByEmail(email, { timeoutUntil: null });
        setUsersList(prev => prev.map(u => u.email === email ? { ...u, timeoutUntil: null } : u));
      } else {
        showToast(`X\u0259ta: ${status}`, '\u274c');
      }
    } catch { showToast('\u018flaq\u0259 x\u0259tas\u0131', '\u274c'); }
  };

  // Admin overrides: coins / unlimited coins / role / delete user \u2014 real backend calls,
  // replacing what used to be localStorage-only edits with no server-side effect.
  const adminSetCoins = async (email, amount) => {
    try {
      const { ok, status, data } = await apiFetch(`/api/admin/coins/by-email?email=${encodeURIComponent(email)}&amount=${Number(amount)}`, { method: 'POST', auth: true });
      if (ok) {
        showToast(`${email} \u2192 \ud83e\ude99 ${data.coins}`, '\ud83e\ude99');
        if (email.toLowerCase() === sessionEmail?.toLowerCase()) setCoins(data.coins);
      } else {
        showToast(`X\u0259ta: ${status}`, '\u274c');
      }
      return ok;
    } catch { showToast('\u018flaq\u0259 x\u0259tas\u0131', '\u274c'); return false; }
  };

  const adminSetUnlimitedCoins = async (email, enabled) => {
    try {
      const { ok, status, data } = await apiFetch(`/api/admin/coins/unlimited/by-email?email=${encodeURIComponent(email)}&enabled=${enabled}`, { method: 'POST', auth: true });
      if (ok) {
        showToast(`${email} \u2192 limitsiz coin: ${enabled ? 'A\u00c7IQ' : 'BA\u011eLI'}`, '\u267e\ufe0f');
        if (email.toLowerCase() === sessionEmail?.toLowerCase()) setHasUnlimitedCoins(data.hasUnlimitedCoins);
      } else {
        showToast(`X\u0259ta: ${status}`, '\u274c');
      }
      return ok;
    } catch { showToast('\u018flaq\u0259 x\u0259tas\u0131', '\u274c'); return false; }
  };

  const adminSetRole = async (email, role) => {
    try {
      const { ok, status } = await apiFetch(`/api/admin/role/by-email?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`, { method: 'POST', auth: true });
      if (!ok) showToast(`X\u0259ta: ${status}`, '\u274c');
      return ok;
    } catch { showToast('\u018flaq\u0259 x\u0259tas\u0131', '\u274c'); return false; }
  };

  const adminDeleteUserBackend = async (email) => {
    try {
      const { ok, status } = await apiFetch(`/api/admin/users/by-email?email=${encodeURIComponent(email)}`, { method: 'DELETE', auth: true });
      if (!ok) showToast(`X\u0259ta: ${status}`, '\u274c');
      return ok;
    } catch { showToast('\u018flaq\u0259 x\u0259tas\u0131', '\u274c'); return false; }
  };

  // New features added for state integration (loaded per user)
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [chats, setChats] = useState({});
  const [claimedChests, setClaimedChests] = useState([]);
  const [notifications, setNotifications] = useState([]);

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
    setNotifications(progress.notifications || []);
  }, []);

  // Hydrate session and global quests on mount (F5 protection)
  useEffect(() => {
    setQuests(getStoredQuests()); // Hydrate quests from global shared storage
    loadShopItems();              // Load dynamic shop items from backend
    const session = getSession();
    if (session?.email) {
      const progress = getUserProgress(session.email);
      applyProgress(progress);
      setSessionEmail(session.email);
      setUsersList(getAllUsersDirectory(session.email));
      setIsLoggedIn(true);
      checkBanStatus(session.email);
      loadMarketInventory();
      loadMapProgress();

      // A JWT issued before a ban/timeout could otherwise keep granting admin calls past its
      // expiry since nothing previously checked authTokenExpiration after writing it.
      const tokenExpiration = getAuthTokenExpiration();
      if (tokenExpiration && new Date(tokenExpiration) <= new Date()) {
        clearAuthSession();
        setUserRole('');
      } else {
        const role = localStorage.getItem('userRole');
        setUserRole(role || '');
      }
    }
    setIsHydrated(true);
  }, [applyProgress]);

  // Poll ban/timeout status every 30s while logged in
  useEffect(() => {
    if (!isLoggedIn || !sessionEmail) return;
    const interval = setInterval(() => checkBanStatus(sessionEmail), 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, sessionEmail]);

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

  const register = ({ firstName, lastName, email, password, emoji, avatarUrl }) => {
    const result = registerUser({ firstName, lastName, email, password, emoji, avatarUrl });
    if (!result.ok) return result;
    // Show welcome bonus toast after a small delay (caller handles modal close)
    setTimeout(() => {
      showToast('🎁 Xoş gəldiniz! +100 Qızıl · ❤️ 3 Can bonusu qazandınız!', '🎉');
    }, 400);
    return { ok: true, email: result.user.email };
  };

  const login = (email, password, backendData = null) => {
    const auth = authenticateUser(email, password);
    if (!auth.ok) return auth;

    skipPersistRef.current = true;
    const progress = getUserProgress(auth.user.email);
    if (backendData) {
      if (backendData.avatarUrl) {
        progress.customProfileImage = backendData.avatarUrl;
        progress.activeAvatarUrl = backendData.avatarUrl;
        progress.activeAvatarId = null;
      } else if (backendData.emoji) {
        progress.activeAvatarUrl = backendData.emoji;
        progress.customProfileImage = null;
      }
    }
    applyProgress(progress);
    setSessionEmail(auth.user.email);
    setSession(auth.user.email);
    setUsersList(getAllUsersDirectory(auth.user.email));
    setIsLoggedIn(true);

    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);

    skipPersistRef.current = false;

    loadMarketInventory();
    loadMapProgress();

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
    setCoins(0);
    setHasUnlimitedCoins(false);
    setMapProgress([]);
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

    // Check timeout restriction
    if (timeoutUntil && new Date() < new Date(timeoutUntil)) {
      const remaining = Math.ceil((new Date(timeoutUntil) - new Date()) / 60000);
      showToast(`Müvəqqəti məhdudiyyət — ${remaining} dəqiqə qalır`, '⏱️');
      return;
    }

    const currentList = completedQuests[activeProgrammingLanguage] || [];
    if (currentList.includes(quest.id)) return;

    const updatedList = [...currentList, quest.id];
    setCompletedQuests((prev) => ({
      ...prev,
      [activeProgrammingLanguage]: updatedList,
    }));

    // Double XP Potion — consumed on the next completed level, one-shot.
    const xpMultiplier = doubleXpPending ? 2 : 1;
    const awardedXp = quest.xpReward * xpMultiplier;
    if (doubleXpPending) {
      setDoubleXpPending(false);
      pushNotification('shop', `Double XP Potion istifadə edildi! +${awardedXp} XP (2x) ⚡`, '⚡');
    }

    addGold(quest.goldReward);
    addXp(awardedXp);
    addTrackRewards(activeProgrammingLanguage, quest.goldReward, awardedXp);
    showToast(`+${quest.goldReward} 🪙  +${awardedXp} XP${xpMultiplier > 1 ? ' (2x!)' : ''} qazandınız!`, '⭐');

    // Push quest completion notification
    pushNotification('quest', `${quest.title} mərhələsini tamamladınız! +${quest.goldReward} 🪙`, '🏆');

    // Sync unlock/completion state to the backend so progress isn't only ever known to this browser
    const trackChapters = QUESTS_BY_CHAPTER[activeProgrammingLanguage] || [];
    for (let ci = 0; ci < trackChapters.length; ci++) {
      const li = (trackChapters[ci] || []).findIndex((q) => q.id === quest.id);
      if (li !== -1) {
        const isLastLevelOfChapter = li === trackChapters[ci].length - 1;
        syncMapCompletion(activeProgrammingLanguage, ci, li, isLastLevelOfChapter);
        break;
      }
    }

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

  // Spends real backend-tracked Coins (not the legacy local `gold`) and records the purchase
  // server-side via /api/market/purchase — this used to be a purely local/optimistic mutation
  // that the backend never learned about at all.
  const buyItem = async (item) => {
    if (!hasUnlimitedCoins && coins < item.price) {
      showToast('Kifayət qədər coin yoxdur', '⚠️');
      return false;
    }

    const singleOwnedTypes = ['avatar', 'badge', 'frame', 'theme'];
    if (singleOwnedTypes.includes(item.itemType) && marketInventory.some((i) => i.shopItemId === item.id)) {
      return false;
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
    }

    const { ok, status, data } = await apiFetch('/api/market/purchase', {
      method: 'POST',
      auth: true,
      body: { shopItemId: item.id },
    });

    if (!ok) {
      showToast(status === 400 ? (data?.message || 'Alına bilmədi') : 'Əlaqə xətası', '❌');
      return false;
    }

    setCoins(data.coins);
    setHasUnlimitedCoins(data.hasUnlimitedCoins);
    loadShopItems(); // refresh catalog so stock counts (decremented server-side) stay live
    loadMarketInventory(); // refresh owned-items list so the single-purchase check above stays accurate

    if (item.itemType === 'avatar' || item.itemType === 'badge') {
      setPurchasedItems((prev) => [...prev, item.id]);
      if (item.itemType === 'avatar') {
        setOwnedAvatarIds((prev) => [...prev, item.id]);
        showToast(`"${item.name}" koleksiyona əlavə edildi! Profildən geyindirin 🎭`, '🛒');
        pushNotification('shop', `"${item.name}" avatarı alındı! 🎭`, '🛒');
      } else {
        showToast(`"${item.name}" alındı! 🎉`, '🛒');
        pushNotification('shop', `"${item.name}" nişanı alındı! 🏆`, '🛒');
      }
    } else if (item.itemType === 'frame') {
      showToast(`"${item.name}" alındı! Mağazadan geyindirin 🖼️`, '🛒');
      pushNotification('shop', `"${item.name}" çərçivəsi alındı!`, '🖼️');
    } else if (item.itemType === 'theme') {
      showToast(`"${item.name}" alındı! Mağazadan tətbiq edin 🎨`, '🛒');
      pushNotification('shop', `"${item.name}" teması alındı!`, '🎨');
    } else if (item.itemType === 'potion_heart') {
      setHeartPotionPurchasedAt(Date.now());
      setUser((prev) => ({ ...prev, hearts: Math.min(3, prev.hearts + 1) }));
      showToast('Can İksiri istifadə edildi! +1 Can', '💖');
      pushNotification('shop', 'Can İksiri istifadə edildi! +1 Can ❤️', '💖');
    } else if (item.itemType === 'joker_5050') {
      setUser((prev) => ({ ...prev, jokers: prev.jokers + 1 }));
      showToast('50/50 Joker alındı!', '🃏');
      pushNotification('shop', '50/50 Joker alındı! 🃏', '🃏');
    } else if (item.itemType === 'streak_freeze') {
      setStreakFreezes((prev) => prev + 1);
      showToast('Streak Freeze alındı! Növbəti buraxılan gündə streak qorunacaq.', '🧊');
      pushNotification('shop', 'Streak Freeze alındı! 🧊', '🧊');
    } else if (item.itemType === 'double_xp') {
      setDoubleXpPending(true);
      showToast('Double XP Potion aktivləşdi! Növbəti tamamladığınız səviyyə 2x XP verəcək.', '⚡');
      pushNotification('shop', 'Double XP Potion aktivləşdi! ⚡', '⚡');
    }

    return true;
  };

  const equipAvatar = (avatarId) => {
    if (!ownedAvatarIds.includes(avatarId)) return false;
    setActiveAvatarId(avatarId);
    // Check dynamic shop items first, fall back to static
    const allItems = dynamicShopItems.length > 0 ? dynamicShopItems : shopItems;
    const item = allItems.find((i) => i.id === avatarId);
    if (item) {
      setActiveAvatarUrl(item.emoji);
      setCustomProfileImage(null);
      // Sync emoji to backend (target user comes from the caller's own JWT)
      syncProfileToBackend(null, item.emoji);
    }
    return true;
  };

  const setCustomProfilePhoto = (dataUrl) => {
    setCustomProfileImage(dataUrl);
    setActiveAvatarUrl(dataUrl);
    // Sync custom photo to backend
    syncProfileToBackend(dataUrl, null);
    setActiveAvatarId(null);
  };

  const clearCustomProfilePhoto = () => {
    setCustomProfileImage(null);
    const fallbackId = ownedAvatarIds.includes(activeAvatarId) ? activeAvatarId : ownedAvatarIds[0];
    const allItems = dynamicShopItems.length > 0 ? dynamicShopItems : shopItems;
    const item = allItems.find((i) => i.id === fallbackId);
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

  const updateUserInfo = async (userId, updatedFields) => {
    const target = usersList.find((u) => u.id === userId);
    if (!target) return;

    const normalizedNewRole = updatedFields.role ? normalizeRole(updatedFields.role) : null;
    const wasAdmin = isAdminRole(user.role);
    const isSelf = target.email === sessionEmail?.toLowerCase();

    if (normalizedNewRole) {
      updateRegisteredUserById(userId, { role: normalizedNewRole });
      // Mirror the role change to the real backend — this used to be a localStorage-only edit
      // with no server-side effect at all.
      adminSetRole(target.email, normalizedNewRole === 'Admin' ? 'Admin' : 'User');
    }

    const progressUpdates = {};
    if (updatedFields.name !== undefined) progressUpdates.username = updatedFields.name;
    if (updatedFields.level !== undefined) progressUpdates.level = Number(updatedFields.level);
    if (updatedFields.gold !== undefined) progressUpdates.gold = Number(updatedFields.gold);
    if (updatedFields.xp !== undefined) progressUpdates.xp = Number(updatedFields.xp);
    if (normalizedNewRole) progressUpdates.role = normalizedNewRole;

    updateUserProgressFields(target.email, progressUpdates);

    // Coins/unlimited-coins are backend-authoritative — always a real call, never local-only.
    if (updatedFields.coins !== undefined) {
      adminSetCoins(target.email, updatedFields.coins);
    }
    if (updatedFields.hasUnlimitedCoins !== undefined) {
      adminSetUnlimitedCoins(target.email, updatedFields.hasUnlimitedCoins);
    }

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

  const deleteUser = async (userId) => {
    const target = usersList.find((u) => u.id === userId);
    if (!target || target.email === sessionEmail?.toLowerCase()) return;

    // Real backend delete — this used to be localStorage-only, so a deleted "user" would
    // still exist (and could still log in) on the actual server.
    await adminDeleteUserBackend(target.email);
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
    isBanned,
    timeoutUntil,
    dynamicShopItems,
    adminAddShopItem,
    adminDeleteShopItem,
    adminBanUser,
    adminUnbanUser,
    adminTimeoutUser,
    adminRemoveTimeout,
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
    setUserRole,
    // Backend-authoritative coin wallet + map progress
    coins,
    hasUnlimitedCoins,
    mapProgress,
    loadMapProgress,
    adminSetCoins,
    adminSetUnlimitedCoins,
    adminSetShopItemStock,
    marketInventory,
    equipMarketItem,
    streakFreezes,
    doubleXpPending,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

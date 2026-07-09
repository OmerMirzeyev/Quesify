/**
 * storage.js — Questify LocalStorage Persistence Layer
 *
 * SQL TABLE MAPPING (for future C# Web API + MS SQL Server migration):
 * ─────────────────────────────────────────────────────────────────────
 * STORAGE_KEYS.USERS          → Table: Users           (Id, FirstName, LastName, Email, PasswordHash, Role, CreatedAt)
 * STORAGE_KEYS.SESSION        → Table: Sessions         (Email, LoggedInAt)
 * STORAGE_KEYS.QUESTS         → Table: Quests           (Id, Language, Title, Topic, Icon, Difficulty, XpReward, GoldReward, Description, ChallengeDataJson)
 * progressKey(email)          → Table: UserProgress     (UserId, Gold, XP, Level, Hearts, Jokers, Streak, ...)
 * progress.trackStats         → Table: TrackStats       (UserId, Track, XP, Gold)
 * progress.completedQuests    → Table: CompletedQuests  (UserId, QuestId, Track, CompletedAt)
 * progress.purchasedItems     → Table: PurchasedItems   (UserId, ItemId, PurchasedAt)
 * progress.achievements       → Table: Achievements     (UserId, AchievementKey, UnlockedAt)
 * progress.failedQuestions    → Table: FailedQuestions  (UserId, QuestId, QuestionText, FailedAt)
 * progress.lastSpinTime       → Table: DailySpins       (UserId, SpunAt)
 * progress.friends            → Table: Friendships      (UserId, FriendEmail, Status, CreatedAt)
 * progress.friendRequests     → Table: FriendRequests   (Id, FromEmail, ToEmail, Status, CreatedAt)
 * progress.chats              → Table: ChatMessages     (SenderEmail, ReceiverEmail, MessageText, SentAt)
 * progress.claimedChests      → Table: ClaimedChests    (UserId, ChestId, ClaimedAt)
 * ─────────────────────────────────────────────────────────────────────
 */

import {
  initialQuestsCSharp,
  initialQuestsJava,
  initialQuestsPython,
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'questify_users',
  SESSION: 'questify_session',
  QUESTS: 'questify_quests',
  WEEKLY_ANCHOR: 'questify_weekly_anchor',
  ADMIN_LOGGED_IN: 'isAdminLoggedIn',
  progressKey: (email) => `questify_progress_${email.toLowerCase()}`,
};

/** Admin panel gate password (separate from user account password) */
export const ADMIN_PANEL_PASSWORD = 'questify2024';

/** Safe guard for SSR / private browsing — never read localStorage during render */
export function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getAdminLoggedIn() {
  if (!isBrowser()) return false;
  try {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_LOGGED_IN) === 'true';
  } catch {
    return false;
  }
}

export function setAdminLoggedIn() {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_LOGGED_IN, 'true');
  } catch {
    /* storage quota / private mode */
  }
}

export function clearAdminLoggedIn() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_LOGGED_IN);
  } catch {
    /* ignore */
  }
}

export const ALL_TRACKS = ['C#', 'Java', 'Python'];

export const EMPTY_TRACK_STATS = () => ({
  'C#': { xp: 0, gold: 0 },
  Java: { xp: 0, gold: 0 },
  Python: { xp: 0, gold: 0 },
});

export const DEFAULT_USER_PROGRESS = {
  // → Maps to: Users + UserProgress tables
  user: {
    username: 'Tələbə',
    firstName: '',
    lastName: '',
    emoji: '🎮',
    level: 1,
    gold: 250,          // 150 baseline + 100 welcome bonus
    xp: 0,
    maxXp: 1000,
    role: 'İstifadəçi',
    hearts: 3,
    jokers: 0,
    streak: 0,
  },
  welcomeBonusClaimed: false,   // → UserProgress.WelcomeBonusClaimed (bit/boolean)
  trackStats: EMPTY_TRACK_STATS(),
  unlockedLanguages: [],
  activeProgrammingLanguage: null,
  completedQuests: { 'C#': [], Java: [], Python: [] },
  purchasedItems: [],
  ownedAvatarIds: [1],
  activeAvatarId: 1,
  customProfileImage: null,
  activeAvatarUrl: '🎮',
  achievements: { firstQuest: false, goldSaver: false, streakMaster: false },
  failedQuestions: [],
  lastHeartRegenTime: Date.now(),
  heartPotionPurchasedAt: null,
  lastSpinTime: null,
  currentTab: 'dashboard',
  // New features added for state integration
  friends: [],          // Array of email strings
  friendRequests: [],  // Array of request objects: { id, fromEmail, toEmail, status }
  chats: {},           // Object schema: { [friendEmail]: [{ id, sender, text, timestamp }] }
  claimedChests: [],   // Array of chest ID strings: e.g., ['csharp-chest-1']
  notifications: [],   // Array of notification objects: { id, type, message, icon, isRead, timestamp }
};

function safeParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch {
    return fallback;
  }
}

export function getRegisteredUsers() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.USERS), []);
}

export function saveRegisteredUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Global Quests Persistence (Shared table simulation)
export function getStoredQuests() {
  const stored = safeParse(localStorage.getItem(STORAGE_KEYS.QUESTS), null);
  if (!stored) {
    const initial = {
      'C#': initialQuestsCSharp,
      Java: initialQuestsJava,
      Python: initialQuestsPython,
    };
    saveStoredQuests(initial);
    return initial;
  }
  return stored;
}

export function saveStoredQuests(quests) {
  localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
}

export function registerUser({ firstName, lastName, email, password, emoji }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();

  if (users.some((u) => u.email === normalizedEmail)) {
    return { ok: false, error: 'email_taken' };
  }

  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();
  const displayName = `${trimmedFirst} ${trimmedLast}`.trim();

  const isAdmin = normalizedEmail === 'admin@questify.az';
  const chosenEmoji = emoji || '🎮';

  const newUser = {
    id: Date.now(),
    firstName: trimmedFirst,
    lastName: trimmedLast,
    username: displayName,
    email: normalizedEmail,
    password,
    role: isAdmin ? 'Admin' : 'İstifadəçi',
    createdAt: Date.now(),
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  const progress = {
    ...DEFAULT_USER_PROGRESS,
    welcomeBonusClaimed: true,  // Mark as claimed on registration
    user: {
      ...DEFAULT_USER_PROGRESS.user,
      username: displayName,
      firstName: trimmedFirst,
      lastName: trimmedLast,
      role: newUser.role,
      emoji: isAdmin ? '🛡️' : chosenEmoji,
      gold: isAdmin ? 9999 : 250,   // 250 = 150 baseline + 100 welcome bonus
      level: isAdmin ? 99 : 1,
      xp: isAdmin ? 9500 : 0,
      streak: isAdmin ? 3 : 0,
      hearts: 3,
    },
    trackStats: EMPTY_TRACK_STATS(),
  };

  saveUserProgress(normalizedEmail, progress);
  return { ok: true, user: newUser };
}

export function authenticateUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();
  const match = users.find(
    (u) => u.email === normalizedEmail && u.password === password
  );
  if (!match) return { ok: false, error: 'invalid_credentials' };
  return { ok: true, user: match };
}

export function getSession() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.SESSION), null);
}

export function setSession(email) {
  localStorage.setItem(
    STORAGE_KEYS.SESSION,
    JSON.stringify({ email: email.toLowerCase(), loggedInAt: Date.now() })
  );
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function getUserProgress(email) {
  const key = STORAGE_KEYS.progressKey(email);
  const saved = safeParse(localStorage.getItem(key), null);
  if (!saved) return { ...DEFAULT_USER_PROGRESS, trackStats: EMPTY_TRACK_STATS() };

  const reg = getRegisteredUsers().find((u) => u.email === email.toLowerCase());

  return {
    ...DEFAULT_USER_PROGRESS,
    ...saved,
    user: {
      ...DEFAULT_USER_PROGRESS.user,
      ...saved.user,
      firstName: saved.user?.firstName || reg?.firstName || '',
      lastName: saved.user?.lastName || reg?.lastName || '',
      username: saved.user?.username || reg?.username || DEFAULT_USER_PROGRESS.user.username,
    },
    trackStats: {
      ...EMPTY_TRACK_STATS(),
      ...(saved.trackStats || {}),
    },
    completedQuests: {
      ...DEFAULT_USER_PROGRESS.completedQuests,
      ...saved.completedQuests,
    },
    achievements: {
      ...DEFAULT_USER_PROGRESS.achievements,
      ...saved.achievements,
    },
    friends: saved.friends || [],
    friendRequests: saved.friendRequests || [],
    chats: saved.chats || {},
    claimedChests: saved.claimedChests || [],
    notifications: saved.notifications || [],
  };
}

export function saveUserProgress(email, progress) {
  localStorage.setItem(
    STORAGE_KEYS.progressKey(email),
    JSON.stringify(progress)
  );
}

export function buildProgressSnapshot(state) {
  return {
    user: state.user,
    welcomeBonusClaimed: state.welcomeBonusClaimed ?? true,
    trackStats: state.trackStats,
    unlockedLanguages: state.unlockedLanguages,
    activeProgrammingLanguage: state.activeProgrammingLanguage,
    completedQuests: state.completedQuests,
    purchasedItems: state.purchasedItems,
    ownedAvatarIds: state.ownedAvatarIds,
    activeAvatarId: state.activeAvatarId,
    customProfileImage: state.customProfileImage,
    activeAvatarUrl: state.activeAvatarUrl,
    achievements: state.achievements,
    failedQuestions: state.failedQuestions,
    lastHeartRegenTime: state.lastHeartRegenTime,
    heartPotionPurchasedAt: state.heartPotionPurchasedAt,
    lastSpinTime: state.lastSpinTime,
    currentTab: state.currentTab,
    friends: state.friends || [],
    friendRequests: state.friendRequests || [],
    chats: state.chats || {},
    notifications: state.notifications || [],
  };
}

/** Leaderboard row for a specific language track → mimics SQL: SELECT ... FROM TrackStats JOIN Users WHERE Track = @track */
export function getLeaderboardForTrack(track, currentSessionEmail = null) {
  const normalizedSession = currentSessionEmail?.toLowerCase() ?? null;

  return getRegisteredUsers().map((reg) => {
    const progress = getUserProgress(reg.email);
    const stats = progress.trackStats?.[track] || { xp: 0, gold: 0 };

    return {
      id: reg.id,
      email: reg.email,
      name: progress.user.username,
      firstName: reg.firstName || progress.user.firstName,
      lastName: reg.lastName || progress.user.lastName,
      emoji: progress.user.emoji,
      level: progress.user.level,
      gold: stats.gold,
      xp: stats.xp,
      role: reg.role,
      isCurrentUser: normalizedSession === reg.email,
    };
  });
}

/**
 * Global leaderboard — aggregates XP and Gold across ALL tracks
 * Mimics SQL: SELECT UserId, SUM(XP) as TotalXP, SUM(Gold) as TotalGold FROM TrackStats GROUP BY UserId
 */
export function getGlobalLeaderboard(currentSessionEmail = null) {
  const normalizedSession = currentSessionEmail?.toLowerCase() ?? null;

  return getRegisteredUsers().map((reg) => {
    const progress = getUserProgress(reg.email);
    const trackStats = progress.trackStats || EMPTY_TRACK_STATS();

    // Aggregate across all tracks
    const totalXp = ALL_TRACKS.reduce((sum, t) => sum + (trackStats[t]?.xp || 0), 0);
    const totalGold = progress.user.gold; // Global gold = total wallet gold

    return {
      id: reg.id,
      email: reg.email,
      name: progress.user.username,
      firstName: reg.firstName || progress.user.firstName,
      lastName: reg.lastName || progress.user.lastName,
      emoji: progress.user.emoji,
      level: progress.user.level,
      gold: totalGold,
      xp: totalXp,
      role: reg.role,
      isCurrentUser: normalizedSession === reg.email,
    };
  });
}

/** Admin directory — global wallet stats */
export function getAllUsersDirectory(currentSessionEmail = null) {
  const normalizedSession = currentSessionEmail?.toLowerCase() ?? null;

  return getRegisteredUsers().map((reg) => {
    const progress = getUserProgress(reg.email);
    return {
      id: reg.id,
      email: reg.email,
      name: progress.user.username,
      firstName: reg.firstName || progress.user.firstName,
      lastName: reg.lastName || progress.user.lastName,
      emoji: progress.user.emoji,
      level: progress.user.level,
      gold: progress.user.gold,
      xp: progress.user.xp,
      role: reg.role,
      isCurrentUser: normalizedSession === reg.email,
    };
  });
}

/** Simulated weekly reset — countdown to next Sunday 23:59:59 */
export function getWeeklyResetRemainingMs() {
  const now = new Date();
  const endOfWeek = new Date(now);
  const day = now.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  if (endOfWeek <= now) {
    endOfWeek.setDate(endOfWeek.getDate() + 7);
  }
  return Math.max(0, endOfWeek.getTime() - now.getTime());
}

export function formatWeeklyCountdown(ms) {
  if (ms <= 0) return '0 gün 00:00';
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const minutes = totalMin % 60;
  return `${days} gün ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function updateRegisteredUserById(userId, updates) {
  const users = getRegisteredUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  users[idx] = { ...users[idx], ...updates };
  saveRegisteredUsers(users);
  return users[idx];
}

export function updateUserProgressFields(email, userFieldUpdates) {
  const progress = getUserProgress(email);
  progress.user = { ...progress.user, ...userFieldUpdates };
  saveUserProgress(email, progress);
  return progress;
}

export function deleteRegisteredUserById(userId) {
  const users = getRegisteredUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return false;

  saveRegisteredUsers(users.filter((u) => u.id !== userId));
  localStorage.removeItem(STORAGE_KEYS.progressKey(target.email));
  return true;
}

export function normalizeRole(role) {
  return role === 'Admin' || role === 'AdminRole' ? 'Admin' : 'İstifadəçi';
}

export function isAdminRole(role) {
  return role === 'Admin' || role === 'AdminRole';
}

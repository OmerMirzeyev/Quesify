const STORAGE_KEYS = {
  USERS: 'questify_users',
  SESSION: 'questify_session',
  progressKey: (email) => `questify_progress_${email.toLowerCase()}`,
};

export const DEFAULT_USER_PROGRESS = {
  user: {
    username: 'Tələbə',
    emoji: '🎮',
    level: 1,
    gold: 150,
    xp: 0,
    maxXp: 1000,
    role: 'İstifadəçi',
    hearts: 3,
    jokers: 0,
    streak: 0,
  },
  unlockedLanguages: [],
  activeProgrammingLanguage: null,
  completedQuests: { 'C#': [], Java: [], Python: [] },
  purchasedItems: [],
  ownedAvatarIds: [1],
  activeAvatarId: 1,
  customProfileImage: null,
  activeAvatarUrl: '🟫',
  achievements: { firstQuest: false, goldSaver: false, streakMaster: false },
  failedQuestions: [],
  lastHeartRegenTime: Date.now(),
  heartPotionPurchasedAt: null,
  lastSpinTime: null,
  currentTab: 'dashboard',
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

export function registerUser({ username, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();

  if (users.some((u) => u.email === normalizedEmail)) {
    return { ok: false, error: 'email_taken' };
  }

  const isAdmin = normalizedEmail === 'admin@questify.az';
  const newUser = {
    id: Date.now(),
    username: username.trim(),
    email: normalizedEmail,
    password,
    role: isAdmin ? 'Admin' : 'İstifadəçi',
    createdAt: Date.now(),
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  const progress = {
    ...DEFAULT_USER_PROGRESS,
    user: {
      ...DEFAULT_USER_PROGRESS.user,
      username: newUser.username,
      role: newUser.role,
      emoji: isAdmin ? '🛡️' : '🎮',
      gold: isAdmin ? 9999 : 150,
      level: isAdmin ? 99 : 1,
      xp: isAdmin ? 9500 : 0,
      streak: isAdmin ? 3 : 0,
    },
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
  if (!saved) return { ...DEFAULT_USER_PROGRESS };

  return {
    ...DEFAULT_USER_PROGRESS,
    ...saved,
    user: { ...DEFAULT_USER_PROGRESS.user, ...saved.user },
    completedQuests: {
      ...DEFAULT_USER_PROGRESS.completedQuests,
      ...saved.completedQuests,
    },
    achievements: {
      ...DEFAULT_USER_PROGRESS.achievements,
      ...saved.achievements,
    },
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
  };
}

/** Build admin/leaderboard directory from registered accounts only */
export function getAllUsersDirectory(currentSessionEmail = null) {
  const normalizedSession = currentSessionEmail?.toLowerCase() ?? null;

  return getRegisteredUsers().map((reg) => {
    const progress = getUserProgress(reg.email);
    return {
      id: reg.id,
      email: reg.email,
      name: progress.user.username,
      emoji: progress.user.emoji,
      level: progress.user.level,
      gold: progress.user.gold,
      xp: progress.user.xp,
      role: reg.role,
      isCurrentUser: normalizedSession === reg.email,
    };
  });
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

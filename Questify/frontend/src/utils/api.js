import { getAuthToken } from './storage';

// Single source of truth for the backend origin. Set VITE_API_BASE_URL in a .env file to
// point the built app at a deployed backend or a LAN IP (needed to test from a phone browser —
// 'localhost' on a phone resolves to the phone itself, not the dev machine).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5271';

/**
 * Every network call in the app should go through this helper instead of calling fetch()
 * directly, so the base URL and auth header are never duplicated/hardcoded per call site.
 *
 * @param {string} path - e.g. '/api/auth/login'
 * @param {{method?: string, body?: any, auth?: boolean, headers?: object, timeoutMs?: number}} options
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 * @throws {DOMException} name 'AbortError' if the request exceeds `timeoutMs` (default 30s) —
 *   without this, a fetch() with no server response hangs forever and callers (e.g. the chatbot's
 *   typing indicator) never get a chance to recover.
 */
export async function apiFetch(path, { method = 'GET', body, auth = false, headers = {}, timeoutMs = 30000 } = {}) {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };

  if (auth) {
    const token = getAuthToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty/non-JSON body */
  }

  return { ok: res.ok, status: res.status, data };
}

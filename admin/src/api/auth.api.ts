import { API_URL } from './client';

export type AdminUser = { id: string; name: string; email: string; phone: string | null; role: 'USER' | 'ADMIN'; preferredLanguage: 'SO' | 'EN'; preferredCurrency: 'USD' | 'SOS'; createdAt: string };
type ApiResponse<T> = { success: boolean; message: string; data?: T };
type Session = { user: AdminUser; accessToken: string; refreshToken: string };

const ACCESS_KEY = 'qorshe.admin.accessToken';
const REFRESH_KEY = 'qorshe.admin.refreshToken';

function readSession() { return { accessToken: sessionStorage.getItem(ACCESS_KEY), refreshToken: sessionStorage.getItem(REFRESH_KEY) }; }
function saveSession(session: Pick<Session, 'accessToken' | 'refreshToken'>) { sessionStorage.setItem(ACCESS_KEY, session.accessToken); sessionStorage.setItem(REFRESH_KEY, session.refreshToken); }
export function clearAdminSession() { sessionStorage.removeItem(ACCESS_KEY); sessionStorage.removeItem(REFRESH_KEY); }

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const session = readSession();
  const headers = new Headers(init.headers); headers.set('Content-Type', 'application/json'); if (session.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 401 && retry && session.refreshToken) {
    const refreshed = await request<{ accessToken: string; refreshToken: string }>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: session.refreshToken }) }, false).catch(() => null);
    if (refreshed) { saveSession(refreshed); return request<T>(path, init, false); }
    clearAdminSession();
  }
  const payload = (await response.json().catch(() => ({ success: false, message: 'Network error.' }))) as ApiResponse<T>;
  if (!response.ok || !payload.success) throw new Error(payload.message || 'Request failed.');
  return (payload.data ?? payload) as T;
}

export const adminAuthApi = {
  login: async (input: { email: string; password: string }) => { const session = await request<Session>('/auth/login', { method: 'POST', body: JSON.stringify(input) }); saveSession(session); return session; },
  me: () => request<{ user: AdminUser }>('/auth/me'),
  logout: async () => { const session = readSession(); if (session.refreshToken) await request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: session.refreshToken }) }).catch(() => undefined); clearAdminSession(); },
};

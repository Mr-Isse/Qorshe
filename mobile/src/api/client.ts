import { clearSession, getSession, saveSession } from '../utils/secureSession';

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

function requireApiUrl() {
  if (!API_URL) throw new Error('API URL is not configured. Set EXPO_PUBLIC_API_URL in mobile/.env.');
  return API_URL;
}

type ApiResponse<T> = { success: boolean; message: string; data?: T };
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const session = await getSession();
      if (!session.refreshToken) return null;
      const response = await fetch(`${requireApiUrl()}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: session.refreshToken }) });
      if (!response.ok) return null;
      const payload = (await response.json()) as ApiResponse<{ accessToken: string; refreshToken: string }>;
      if (!payload.success || !payload.data) return null;
      await saveSession(payload.data.accessToken, payload.data.refreshToken);
      return payload.data.accessToken;
    })().finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const session = await getSession();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (session.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`);
  const response = await fetch(`${requireApiUrl()}${path}`, { ...init, headers });
  if (response.status === 401 && retry && !path.includes('/auth/refresh')) {
    const nextAccessToken = await refreshAccessToken();
    if (nextAccessToken) return apiFetch<T>(path, init, false);
    await clearSession();
  }
  const payload = (await response.json().catch(() => ({ success: false, message: 'Network error.' }))) as ApiResponse<T>;
  if (!response.ok || !payload.success) throw new Error(payload.message || 'Request failed.');
  return (payload.data ?? payload) as T;
}

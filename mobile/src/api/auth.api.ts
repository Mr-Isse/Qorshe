import { apiFetch } from './client';

export type AuthUser = { id: string; name: string; email: string; phone: string | null; role: 'USER' | 'ADMIN'; status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'; preferredLanguage: 'SO' | 'EN'; preferredCurrency: 'USD' | 'SOS'; createdAt: string; updatedAt: string };
type AuthSession = { user: AuthUser; accessToken: string; refreshToken: string };

export const authApi = {
  register: (input: { name: string; email: string; phone?: string; password: string }) => apiFetch<{ user: AuthUser }>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  login: (input: { email: string; password: string }) => apiFetch<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  me: () => apiFetch<{ user: AuthUser }>('/auth/me'),
  logout: (refreshToken: string) => apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  forgotPassword: (email: string) => apiFetch<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, newPassword: string) => apiFetch<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),
  updateProfile: (input: { name?: string; phone?: string; preferredLanguage?: 'SO' | 'EN'; preferredCurrency?: 'USD' | 'SOS' }) => apiFetch<AuthUser>('/users/me', { method: 'PATCH', body: JSON.stringify(input) }),
  deactivateAccount: () => apiFetch<AuthUser>('/users/me', { method: 'DELETE' }),
};

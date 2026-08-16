import { adminRequest } from './auth.api';

export type AdminUserRecord = { id: string; name: string; email: string; phone: string | null; role: 'USER' | 'ADMIN'; status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'; preferredLanguage: 'SO' | 'EN'; preferredCurrency: 'USD' | 'SOS'; createdAt: string; updatedAt: string };
export type UsersQuery = { page?: number; limit?: number; search?: string; role?: 'USER' | 'ADMIN'; status?: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' };

export const usersApi = {
  list: (query: UsersQuery) => { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value) params.set(key, String(value)); }); return adminRequest<{ success: boolean; message: string; data: AdminUserRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/admin/users?${params.toString()}`, {}, true, false); },
  get: (id: string) => adminRequest<AdminUserRecord & { _count: { transactions: number; budgets: number; savingsGoals: number; financialGoals: number } }>(`/admin/users/${id}`),
  updateStatus: (id: string, status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED') => adminRequest<AdminUserRecord>(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

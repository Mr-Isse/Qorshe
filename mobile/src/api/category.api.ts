import { apiFetch } from './client';

export type Category = { id: string; name: string; type: 'INCOME' | 'EXPENSE'; icon: string | null; isDefault: boolean; isActive: boolean; createdAt: string; updatedAt: string };

export const categoryApi = {
  list: (query: { type?: 'INCOME' | 'EXPENSE'; search?: string; includeInactive?: boolean }) => { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); }); return apiFetch<Category[]>(`/categories?${params.toString()}`); },
  create: (input: { name: string; type: 'INCOME' | 'EXPENSE'; icon?: string }) => apiFetch<Category>('/categories', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: { name: string; type: 'INCOME' | 'EXPENSE'; icon?: string }) => apiFetch<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deactivate: (id: string) => apiFetch<Category>(`/categories/${id}`, { method: 'DELETE' }),
  restore: (id: string) => apiFetch<Category>(`/categories/${id}/restore`, { method: 'PATCH' }),
};

import { adminRequest } from './auth.api';

export type AdminCategory = { id: string; name: string; type: 'INCOME' | 'EXPENSE'; icon: string | null; isDefault: boolean; isActive: boolean; createdAt: string; updatedAt: string; _count?: { transactions: number; budgets: number } };
export type CategoryQuery = { page?: number; limit?: number; search?: string; type?: 'INCOME' | 'EXPENSE'; isActive?: boolean };

type CategoryListResponse = { success: boolean; message: string; data: AdminCategory[]; pagination: { page: number; limit: number; total: number; totalPages: number } };

export const categoryApi = {
  list: (query: CategoryQuery) => { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); }); return adminRequest<CategoryListResponse>(`/admin/categories?${params.toString()}`, {}, true, false); },
  create: (input: { name: string; type: 'INCOME' | 'EXPENSE'; icon?: string }) => adminRequest<AdminCategory>('/admin/categories', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: { name: string; type: 'INCOME' | 'EXPENSE'; icon?: string }) => adminRequest<AdminCategory>(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  setActive: (id: string, isActive: boolean) => adminRequest<AdminCategory>(isActive ? `/admin/categories/${id}/restore` : `/admin/categories/${id}`, isActive ? { method: 'PATCH' } : { method: 'DELETE' }),
};

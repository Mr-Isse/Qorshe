import { adminRequest } from './auth.api';

export type AdminTransaction = { id: string; type: 'INCOME' | 'EXPENSE'; amount: string; currency: 'USD' | 'SOS'; title: string; description: string | null; date: string; createdAt: string; updatedAt: string; category: { id: string; name: string; type: 'INCOME' | 'EXPENSE'; icon: string | null } | null; user: { id: string; name: string; email: string } };
export type AdminTransactionQuery = { page?: number; limit?: number; search?: string; type?: 'INCOME' | 'EXPENSE'; categoryId?: string; currency?: 'USD' | 'SOS'; startDate?: string; endDate?: string };
type ListResponse = { success: boolean; message: string; data: AdminTransaction[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
function queryString(query: AdminTransactionQuery) { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value) params.set(key, String(value)); }); return params.toString(); }
export const adminTransactionApi = { list: (query: AdminTransactionQuery) => adminRequest<ListResponse>(`/admin/transactions?${queryString(query)}`, {}, true, false), summary: () => adminRequest<Record<string, { incomeRecords: number; expenseRecords: number; incomeTotal: string; expenseTotal: string }>>('/admin/transactions/summary'), };

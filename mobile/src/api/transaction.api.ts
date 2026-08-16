import { apiFetch } from './client';

export type Transaction = { id: string; type: 'INCOME' | 'EXPENSE'; amount: string; currency: 'USD' | 'SOS'; title: string; description: string | null; date: string; createdAt: string; updatedAt: string; category: { id: string; name: string; type: 'INCOME' | 'EXPENSE'; icon: string | null } | null };
export type TransactionInput = { type: 'INCOME' | 'EXPENSE'; categoryId: string; amount: string; currency: 'USD' | 'SOS'; description?: string; date: string };
export type TransactionQuery = { page?: number; limit?: number; type?: 'INCOME' | 'EXPENSE'; categoryId?: string; search?: string; startDate?: string; endDate?: string; currency?: 'USD' | 'SOS' };
export type TransactionSummary = Record<'USD' | 'SOS', { income: string; expense: string; balance: string; transactionCount: number }>;

function queryString(query: TransactionQuery) { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); }); return params.toString(); }
export const transactionApi = {
  list: (query: TransactionQuery) => apiFetch<{ data: Transaction[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/transactions?${queryString(query)}`),
  summary: (query: Pick<TransactionQuery, 'startDate' | 'endDate' | 'currency'> = {}) => apiFetch<TransactionSummary>(`/transactions/summary?${queryString(query)}`),
  create: (input: TransactionInput) => apiFetch<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: TransactionInput) => apiFetch<Transaction>(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  remove: (id: string) => apiFetch<unknown>(`/transactions/${id}`, { method: 'DELETE' }),
};

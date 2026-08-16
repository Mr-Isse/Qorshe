import { adminRequest } from './auth.api';

export type AdminDebt = { id: string; userId: string; type: 'I_OWE' | 'OWED_TO_ME'; personName: string; title: string; originalAmount: string; remainingAmount: string; totalPaid: string; currency: 'USD' | 'SOS'; dueDate?: string | null; status: string; user?: { id: string; name: string; email: string } };
export type DebtAdminQuery = { type?: string; status?: string; currency?: string; search?: string; page?: number; limit?: number };
export type DebtPage = { data: AdminDebt[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
export type DebtSummary = { totalOriginal: string; totalPaid: string; totalRemaining: string; activeCount: number; overdueCount: number; paidCount: number };
export type AdminDebtSummary = Record<'USD' | 'SOS', Record<'I_OWE' | 'OWED_TO_ME', DebtSummary>>;
function qs(values: DebtAdminQuery) { const p = new URLSearchParams(); Object.entries(values).forEach(([key, value]) => value && p.set(key, String(value))); return p.toString(); }
export const adminDebtApi = { list: (query: DebtAdminQuery = {}) => adminRequest<DebtPage>(`/admin/debts?${qs(query)}`), summary: () => adminRequest<AdminDebtSummary>('/admin/debts/summary') };

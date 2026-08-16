import { adminRequest } from './auth.api';

export type AdminSavings = { id: string; name: string; description: string | null; targetAmount: string; currentAmount: string; remainingAmount: string; progress: number; status: 'ACTIVE' | 'NEAR_TARGET' | 'COMPLETED' | 'OVERDUE'; currency: 'USD' | 'SOS'; startDate: string; targetDate: string; isActive: boolean; user: { id: string; name: string; email: string } };
export type SavingsQuery = { page?: number; limit?: number; search?: string; currency?: 'USD' | 'SOS'; status?: AdminSavings['status']; isActive?: boolean };
type ListResponse = { success: boolean; message: string; data: AdminSavings[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
function queryString(query: SavingsQuery) { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); }); return params.toString(); }
export const adminSavingsApi = { list: (query: SavingsQuery) => adminRequest<ListResponse>(`/admin/savings?${queryString(query)}`, {}, true, false), summary: () => adminRequest<Record<string, { targetAmount: string; savedAmount: string; remainingAmount: string; totalPlans: number; activePlans: number; completedPlans: number; overduePlans: number }>>('/admin/savings/summary') };

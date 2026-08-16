import { adminRequest } from './auth.api';

export type AdminGoal = { id: string; name: string; description: string | null; targetAmount: string; currentAmount: string; remainingAmount: string; progress: number; status: 'ACTIVE' | 'NEAR_TARGET' | 'COMPLETED' | 'OVERDUE'; currency: 'USD' | 'SOS'; startDate: string; targetDate: string; isActive: boolean; user: { id: string; name: string; email: string } };
export type GoalQuery = { page?: number; limit?: number; search?: string; currency?: 'USD' | 'SOS'; status?: AdminGoal['status']; isActive?: boolean };
type ListResponse = { success: boolean; message: string; data: AdminGoal[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
function queryString(query: GoalQuery) { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); }); return params.toString(); }
export const adminGoalsApi = { list: (query: GoalQuery) => adminRequest<ListResponse>(`/admin/goals?${queryString(query)}`, {}, true, false), summary: () => adminRequest<Record<string, { targetAmount: string; savedAmount: string; remainingAmount: string; totalGoals: number; activeGoals: number; completedGoals: number; overdueGoals: number }>>('/admin/goals/summary') };

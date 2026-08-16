import { adminRequest } from './auth.api';
export type AdminInvestmentSummary = Record<'USD' | 'SOS', { investmentCount: number; activeInvestments: number; closedInvestments: number; soldInvestments: number; totalTrackedValue: string | null; valueAvailable: boolean; investmentTypes: Record<string, number> }>;
export type AdminInvestmentActivity = Record<'USD' | 'SOS', { monthlyActivity: Array<{ month: string; transactionCount: number; volume: string }>; transactionTypes: Record<string, number> }>;
export const adminInvestmentApi = { summary: () => adminRequest<AdminInvestmentSummary>('/admin/investments/summary'), activity: () => adminRequest<AdminInvestmentActivity>('/admin/investments/activity') };

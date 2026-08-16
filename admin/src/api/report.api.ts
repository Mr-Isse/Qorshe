import { adminRequest } from './auth.api';
export type AdminReportQuery = { period?: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM'; startDate?: string; endDate?: string; currency?: 'USD' | 'SOS' };
export type AdminOverview = { totalIncome: string; totalExpenses: string; netBalance: string; transactionCount: number };
function queryString(query: AdminReportQuery) { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); }); return params.toString(); }
export const adminReportApi = { overview: (query: AdminReportQuery = {}) => adminRequest<Record<'USD' | 'SOS', AdminOverview>>(`/admin/reports/overview?${queryString(query)}`) };

import { adminRequest } from './auth.api';

export type AdminNotification = { id: string; type: string; title: string; message: string; entityType: string | null; entityId: string | null; isRead: boolean; createdAt: string; user: { id: string; name: string; email: string } };
export type AdminNotificationQuery = { page?: number; limit?: number; search?: string; isRead?: boolean; type?: string };
type ListResponse = { success: boolean; message: string; data: AdminNotification[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
function queryString(query: AdminNotificationQuery) { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); }); return params.toString(); }
export const adminNotificationApi = { list: (query: AdminNotificationQuery) => adminRequest<ListResponse>(`/admin/notifications?${queryString(query)}`, {}, true, false), summary: () => adminRequest<{ total: number; unread: number; pushEnabledUsers: number; byType: Record<string, number> }>('/admin/notifications/summary') };

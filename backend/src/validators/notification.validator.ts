import { z } from 'zod';

export const notificationQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), isRead: z.enum(['true', 'false']).transform((value) => value === 'true').optional(), type: z.enum(['BUDGET_ALERT', 'SAVINGS_REMINDER', 'GOAL_REMINDER', 'BUDGET_WARNING', 'BUDGET_EXCEEDED', 'SAVINGS_PROGRESS', 'SAVINGS_COMPLETED', 'GOAL_PROGRESS', 'GOAL_DEADLINE', 'GOAL_COMPLETED', 'RECURRING_UPCOMING', 'RECURRING_GENERATED', 'SYSTEM']).optional() });
export const notificationPreferenceUpdateSchema = z.object({ budgetNotifications: z.boolean().optional(), savingsNotifications: z.boolean().optional(), goalNotifications: z.boolean().optional(), recurringNotifications: z.boolean().optional(), systemNotifications: z.boolean().optional(), pushEnabled: z.boolean().optional() }).refine((value) => Object.keys(value).length > 0, 'At least one preference is required.');
export const deviceRegistrationSchema = z.object({ expoPushToken: z.string().trim().min(1).max(300), platform: z.enum(['ios', 'android', 'web']).optional() });
export const reminderProcessSchema = z.object({ asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format.').optional() });
export const adminNotificationQuerySchema = notificationQuerySchema.extend({ search: z.string().trim().max(100).optional() });

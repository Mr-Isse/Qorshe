import { Prisma } from '@prisma/client';
import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format.').refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), 'Date is invalid.');
const amount = z.union([z.string(), z.number()]).transform(String).refine((value) => /^\d{1,15}(\.\d{1,4})?$/.test(value), 'Amount must be a positive decimal with up to 4 decimal places.').refine((value) => { try { return new Prisma.Decimal(value).greaterThan(0); } catch { return false; } }, 'Amount must be greater than zero.');
const fields = z.object({ name: z.string().trim().min(1).max(120), description: z.string().trim().max(500).optional().or(z.literal('')), type: z.enum(['INCOME', 'EXPENSE']), categoryId: z.string().uuid(), amount, currency: z.enum(['USD', 'SOS']), frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']), interval: z.coerce.number().int().min(1).max(365), startDate: dateString, endDate: dateString.nullable().optional() });
function validateDates<T extends { startDate?: string; endDate?: string | null }>(value: T, ctx: z.RefinementCtx) { if (value.endDate && value.startDate && value.endDate < value.startDate) ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'End date must be on or after the start date.' }); }
export const createRecurringTransactionSchema = fields.superRefine(validateDates);
export const updateRecurringTransactionSchema = fields.partial().superRefine(validateDates);
export const recurringTransactionQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), type: z.enum(['INCOME', 'EXPENSE']).optional(), currency: z.enum(['USD', 'SOS']).optional(), isActive: z.enum(['true', 'false']).transform((value) => value === 'true').optional(), isPaused: z.enum(['true', 'false']).transform((value) => value === 'true').optional(), search: z.string().trim().max(100).optional() });
export const upcomingQuerySchema = z.object({ days: z.coerce.number().int().min(1).max(366).default(90) });
export const processQuerySchema = z.object({ asOf: dateString.optional() });
export type RecurringTransactionInput = z.infer<typeof fields>;

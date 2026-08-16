import { Prisma } from '@prisma/client';
import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format.').refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), 'Date is invalid.');
const amount = z.union([z.string(), z.number()]).transform((value) => String(value)).refine((value) => /^\d{1,15}(\.\d{1,4})?$/.test(value), 'Amount must be a positive decimal with up to 4 decimal places.').refine((value) => { try { return new Prisma.Decimal(value).greaterThan(0); } catch { return false; } }, 'Amount must be greater than zero.');
const plan = z.object({ name: z.string().trim().min(1).max(100), description: z.string().trim().max(500).optional().or(z.literal('')), targetAmount: amount, currency: z.enum(['USD', 'SOS']), startDate: dateString, targetDate: dateString }).refine((value) => value.targetDate >= value.startDate, { path: ['targetDate'], message: 'Target date must be on or after start date.' });
const entry = z.object({ amount, description: z.string().trim().max(500).optional().or(z.literal('')), date: dateString });
export const createGoalSchema = plan;
export const updateGoalSchema = plan;
export const contributionSchema = entry;
export const withdrawalSchema = entry;
export const goalQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), search: z.string().trim().max(100).optional(), currency: z.enum(['USD', 'SOS']).optional(), status: z.enum(['ACTIVE', 'NEAR_TARGET', 'COMPLETED', 'OVERDUE']).optional(), isActive: z.coerce.boolean().optional() });
export const goalHistoryQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });
export type GoalInput = z.infer<typeof plan>;
export type GoalEntryInput = z.infer<typeof entry>;

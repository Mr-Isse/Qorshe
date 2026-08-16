import { Prisma } from '@prisma/client';
import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format.').refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), 'Date is invalid.');
const amount = z.union([z.string(), z.number()]).transform((value) => String(value)).refine((value) => /^\d{1,15}(\.\d{1,4})?$/.test(value), 'Amount must be a positive decimal with up to 4 decimal places.').refine((value) => { try { return new Prisma.Decimal(value).greaterThan(0); } catch { return false; } }, 'Amount must be greater than zero.');
const base = z.object({ name: z.string().trim().min(1).max(100), categoryId: z.string().uuid(), amount, currency: z.enum(['USD', 'SOS']), startDate: dateString, endDate: dateString }).refine((value) => value.endDate >= value.startDate, { path: ['endDate'], message: 'End date must be on or after start date.' });
export const createBudgetSchema = base;
export const updateBudgetSchema = base;
export const budgetQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), categoryId: z.string().uuid().optional(), currency: z.enum(['USD', 'SOS']).optional(), isActive: z.coerce.boolean().optional(), search: z.string().trim().max(100).optional(), status: z.enum(['SAFE', 'WARNING', 'NEAR_LIMIT', 'EXCEEDED']).optional() });
export const budgetSummaryQuerySchema = z.object({ currency: z.enum(['USD', 'SOS']).optional() });
export type BudgetInput = z.infer<typeof base>;

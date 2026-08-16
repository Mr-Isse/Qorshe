import { Prisma } from '@prisma/client';
import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format.').refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), 'Date is invalid.');
const amount = z.union([z.string(), z.number()]).transform((value) => String(value)).refine((value) => /^\d{1,15}(\.\d{1,4})?$/.test(value), 'Amount must be a positive decimal with up to 4 decimal places.').refine((value) => { try { return new Prisma.Decimal(value).greaterThan(0); } catch { return false; } }, 'Amount must be greater than zero.');
const base = z.object({ type: z.enum(['INCOME', 'EXPENSE']), categoryId: z.string().uuid(), amount, currency: z.enum(['USD', 'SOS']), description: z.string().trim().max(500).optional().or(z.literal('')), date: dateString });
export const createTransactionSchema = base;
export const updateTransactionSchema = base;
export const transactionQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), type: z.enum(['INCOME', 'EXPENSE']).optional(), categoryId: z.string().uuid().optional(), search: z.string().trim().max(100).optional(), startDate: dateString.optional(), endDate: dateString.optional(), currency: z.enum(['USD', 'SOS']).optional(), sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'), sortOrder: z.enum(['asc', 'desc']).default('desc') });
export const summaryQuerySchema = z.object({ startDate: dateString.optional(), endDate: dateString.optional(), currency: z.enum(['USD', 'SOS']).optional() });
export type TransactionInput = z.infer<typeof base>;

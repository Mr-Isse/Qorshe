import { z } from 'zod';

const icon = z.string().trim().min(1).max(40).regex(/^[a-z0-9-]+$/, 'Icon must be a safe identifier.').optional().nullable();
const categoryType = z.enum(['INCOME', 'EXPENSE']);

export const categoryInputSchema = z.object({ name: z.string().trim().min(1).max(80), type: categoryType, icon });
export const categoryQuerySchema = z.object({ type: categoryType.optional(), search: z.string().trim().max(80).optional(), includeInactive: z.coerce.boolean().default(false) });
export const adminCategoryQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), type: categoryType.optional(), search: z.string().trim().max(80).optional(), isActive: z.coerce.boolean().optional() });
export const adminCategoryStatusSchema = z.object({ isActive: z.boolean() });

export type CategoryInput = z.infer<typeof categoryInputSchema>;

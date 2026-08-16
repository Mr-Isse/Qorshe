import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().min(6).max(30).optional().or(z.literal('')),
  preferredLanguage: z.enum(['SO', 'EN']).optional(),
  preferredCurrency: z.enum(['USD', 'SOS']).optional(),
}).strict();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

import { z } from 'zod';

export const aiChatSchema = z.object({ message: z.string().trim().min(1).max(4000), conversationId: z.string().uuid().optional() });
export const aiConversationQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(20) });
export const aiConversationIdSchema = z.object({ id: z.string().uuid() });

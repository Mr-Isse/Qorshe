import type { Request, Response } from 'express';
import { getPrismaClient } from '../config/prisma';
import { updateUserSchema } from '../validators/user.validator';

const publicUserSelect = { id: true, name: true, email: true, phone: true, role: true, preferredLanguage: true, preferredCurrency: true, createdAt: true } as const;

export async function getCurrentUser(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const user = await getPrismaClient().user.findUnique({ where: { id: req.user.id }, select: publicUserSelect });
  if (!user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  return res.json({ success: true, message: 'Current user retrieved', data: { user } });
}

export async function updateCurrentUser(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed.', errors: parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) });
  const user = await getPrismaClient().user.update({ where: { id: req.user.id }, data: parsed.data, select: publicUserSelect });
  return res.json({ success: true, message: 'Profile updated successfully', data: { user } });
}

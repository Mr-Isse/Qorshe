import type { Request, Response } from 'express';
import { getPrismaClient } from '../config/prisma';
import { updateUserSchema } from '../validators/user.validator';

const publicUserSelect = { id: true, name: true, email: true, phone: true, role: true, status: true, preferredLanguage: true, preferredCurrency: true, createdAt: true, updatedAt: true } as const;

export async function getCurrentUser(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const user = await getPrismaClient().user.findUnique({ where: { id: req.user.id }, select: publicUserSelect });
  if (!user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  return res.json({ success: true, message: 'Profile retrieved successfully', data: user });
}

export async function updateCurrentUser(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed.', errors: parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) });
  const data = { ...parsed.data, phone: parsed.data.phone?.trim() || null };
  try {
    const user = await getPrismaClient().user.update({ where: { id: req.user.id }, data, select: publicUserSelect });
    return res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch {
    return res.status(409).json({ success: false, message: 'The supplied phone number is already in use.' });
  }
}

export async function deactivateCurrentUser(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const prisma = getPrismaClient();
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { status: 'DEACTIVATED' }, select: publicUserSelect });
  await prisma.refreshToken.updateMany({ where: { userId: req.user.id, revokedAt: null }, data: { revokedAt: new Date() } });
  return res.json({ success: true, message: 'Account deactivated. Your financial records have been preserved.', data: user });
}

import type { Request, Response } from 'express';
import { getPrismaClient } from '../config/prisma';
import { adminUsersQuerySchema, updateUserStatusSchema } from '../validators/admin-user.validator';

const safeUserSelect = { id: true, name: true, email: true, phone: true, role: true, status: true, preferredLanguage: true, preferredCurrency: true, createdAt: true, updatedAt: true } as const;

export async function listUsers(req: Request, res: Response) {
  const parsed = adminUsersQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid user list filters.' });
  const { page, limit, search, role, status, sortBy, sortOrder } = parsed.data;
  const where = { ...(role ? { role } : {}), ...(status ? { status } : {}), ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }, { phone: { contains: search, mode: 'insensitive' as const } }] } : {}) };
  const prisma = getPrismaClient();
  const [users, total] = await prisma.$transaction([prisma.user.findMany({ where, select: safeUserSelect, orderBy: { [sortBy]: sortOrder }, skip: (page - 1) * limit, take: limit }), prisma.user.count({ where })]);
  return res.json({ success: true, message: 'Users retrieved successfully', data: users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

export async function getUserDetails(req: Request, res: Response) {
  const targetId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
  const user = await getPrismaClient().user.findUnique({ where: { id: targetId }, select: { ...safeUserSelect, _count: { select: { transactions: true, budgets: true, savingsGoals: true, financialGoals: true } } } });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.json({ success: true, message: 'User details retrieved successfully', data: user });
}

export async function updateUserStatus(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const targetId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
  const parsed = updateUserStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid account status.' });
  if (req.user.id === targetId && parsed.data.status !== 'ACTIVE') return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account.' });
  const prisma = getPrismaClient();
  const user = await prisma.user.update({ where: { id: targetId }, data: { status: parsed.data.status }, select: safeUserSelect });
  if (parsed.data.status !== 'ACTIVE') await prisma.refreshToken.updateMany({ where: { userId: targetId, revokedAt: null }, data: { revokedAt: new Date() } });
  return res.json({ success: true, message: 'User status updated successfully', data: user });
}

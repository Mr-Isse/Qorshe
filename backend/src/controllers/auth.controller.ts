import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { getPrismaClient } from '../config/prisma';
import { env } from '../config/env';
import { comparePassword, createAccessToken, createOpaqueToken, createRefreshToken, hashPassword, hashToken, verifyRefreshToken } from '../utils/auth';
import { changePasswordSchema, forgotPasswordSchema, loginSchema, refreshSchema, registerSchema, resetPasswordSchema } from '../validators/auth.validator';

const publicUserSelect = { id: true, name: true, email: true, phone: true, role: true, preferredLanguage: true, preferredCurrency: true, createdAt: true } as const;
const genericResetMessage = 'If the account exists, password reset instructions will be sent.';

function validationError(res: Response, error: unknown) {
  if (error && typeof error === 'object' && 'issues' in error) {
    return res.status(400).json({ success: false, message: 'Validation failed.', errors: (error as { issues: Array<{ path: (string | number)[]; message: string }> }).issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) });
  }
  return null;
}

function refreshExpiryDate(): Date {
  const match = env.refreshTokenTtl.match(/^(\d+)([smhd])$/);
  const amount = match ? Number(match[1]) : 7;
  const multiplier = match?.[2] === 'h' ? 60 * 60 * 1000 : match?.[2] === 'm' ? 60 * 1000 : match?.[2] === 's' ? 1000 : 24 * 60 * 60 * 1000;
  return new Date(Date.now() + amount * multiplier);
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const input = parsed.data;
  const prisma = getPrismaClient();
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });

  try {
    const user = await prisma.user.create({ data: { name: input.name, email: input.email, phone: input.phone || null, password: await hashPassword(input.password) }, select: publicUserSelect });
    return res.status(201).json({ success: true, message: 'Registration successful', data: { user } });
  } catch {
    return res.status(409).json({ success: false, message: 'An account with these details already exists.' });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const user = await getPrismaClient().user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await comparePassword(parsed.data.password, user.password))) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

  const tokenId = randomUUID();
  const refreshToken = createRefreshToken(user.id, tokenId);
  await getPrismaClient().refreshToken.create({ data: { id: tokenId, userId: user.id, tokenHash: hashToken(refreshToken), expiresAt: refreshExpiryDate() } });
  const accessToken = createAccessToken(user.id, user.role);
  const safeUser = await getPrismaClient().user.findUniqueOrThrow({ where: { id: user.id }, select: publicUserSelect });
  return res.json({ success: true, message: 'Login successful', data: { user: safeUser, accessToken, refreshToken } });
}

export async function refresh(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  try {
    const payload = verifyRefreshToken(parsed.data.refreshToken);
    if (payload.type !== 'refresh') throw new Error('invalid refresh token');
    const prisma = getPrismaClient();
    const stored = await prisma.refreshToken.findUnique({ where: { id: payload.tokenId }, include: { user: true } });
    if (!stored || stored.revokedAt || stored.expiresAt <= new Date() || stored.tokenHash !== hashToken(parsed.data.refreshToken)) return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    const nextId = randomUUID();
    const nextRefreshToken = createRefreshToken(stored.userId, nextId);
    await prisma.$transaction([prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } }), prisma.refreshToken.create({ data: { id: nextId, userId: stored.userId, tokenHash: hashToken(nextRefreshToken), expiresAt: refreshExpiryDate() } })]);
    return res.json({ success: true, message: 'Token refreshed', data: { accessToken: createAccessToken(stored.user.id, stored.user.role), refreshToken: nextRefreshToken } });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
}

export async function logout(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body);
  if (parsed.success) {
    try {
      const payload = verifyRefreshToken(parsed.data.refreshToken);
      await getPrismaClient().refreshToken.updateMany({ where: { id: payload.tokenId, tokenHash: hashToken(parsed.data.refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
    } catch { /* Logout remains idempotent and does not reveal token state. */ }
  }
  return res.json({ success: true, message: 'Logout successful' });
}

export async function me(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const user = await getPrismaClient().user.findUnique({ where: { id: req.user.id }, select: publicUserSelect });
  if (!user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  return res.json({ success: true, message: 'Current user retrieved', data: { user } });
}

export async function changePassword(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !(await comparePassword(parsed.data.currentPassword, user.password))) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  await prisma.$transaction([prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(parsed.data.newPassword) } }), prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } })]);
  return res.json({ success: true, message: 'Password changed successfully.' });
}

export async function forgotPassword(req: Request, res: Response) {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.json({ success: true, message: genericResetMessage });
  const user = await getPrismaClient().user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const rawToken = createOpaqueToken();
    await getPrismaClient().passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + env.passwordResetTtlMinutes * 60 * 1000) } });
    // Email delivery is intentionally not implemented in Module 3; the raw token is never returned or logged.
  }
  return res.json({ success: true, message: genericResetMessage });
}

export async function resetPassword(req: Request, res: Response) {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const prisma = getPrismaClient();
  const token = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(parsed.data.token) } });
  if (!token || token.usedAt || token.expiresAt <= new Date()) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  await prisma.$transaction([prisma.user.update({ where: { id: token.userId }, data: { password: await hashPassword(parsed.data.newPassword) } }), prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }), prisma.refreshToken.updateMany({ where: { userId: token.userId, revokedAt: null }, data: { revokedAt: new Date() } })]);
  return res.json({ success: true, message: 'Password reset successfully.' });
}

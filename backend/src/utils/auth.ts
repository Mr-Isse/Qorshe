import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env';
import type { AccessTokenPayload, RefreshTokenPayload } from '../types/auth';

const SALT_ROUNDS = 12;

function requireSecret(secret: string, name: string): string {
  if (!secret) throw new Error(`${name} is not configured`);
  return secret;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function createAccessToken(userId: string, role: Role): string {
  const payload: AccessTokenPayload = { userId, role, type: 'access' };
  return jwt.sign(payload, requireSecret(env.jwtSecret, 'JWT_SECRET'), { expiresIn: env.accessTokenTtl as jwt.SignOptions['expiresIn'] });
}

export function createRefreshToken(userId: string, tokenId: string): string {
  const payload: RefreshTokenPayload = { userId, tokenId, type: 'refresh' };
  return jwt.sign(payload, requireSecret(env.jwtRefreshSecret, 'JWT_REFRESH_SECRET'), { expiresIn: env.refreshTokenTtl as jwt.SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, requireSecret(env.jwtSecret, 'JWT_SECRET')) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, requireSecret(env.jwtRefreshSecret, 'JWT_REFRESH_SECRET')) as RefreshTokenPayload;
}

export function createOpaqueToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

import type { RequestHandler } from 'express';
import { getPrismaClient } from '../config/prisma';
import { verifyAccessToken } from '../utils/auth';

export const requireAuth: RequestHandler = async (req, res, next) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication is required.' });
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    if (payload.type !== 'access' || !payload.userId || !payload.role) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    }
    const user = await getPrismaClient().user.findUnique({ where: { id: payload.userId }, select: { id: true, role: true, status: true } });
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'Authentication is required.' });
    }
    req.user = { id: user.id, role: user.role };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

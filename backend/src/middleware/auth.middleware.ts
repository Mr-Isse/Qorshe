import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/auth';

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication is required.' });
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    if (payload.type !== 'access' || !payload.userId || !payload.role) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    }
    req.user = { id: payload.userId, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

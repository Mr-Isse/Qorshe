import { Router } from 'express';
import { getPrismaClient } from '../config/prisma';

const router = Router();

router.get('/health', async (_req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.json({ success: true, message: 'QORSHE API is running', database: 'not_configured' });
  }

  try {
    await getPrismaClient().$queryRaw`SELECT 1`;
    return res.json({ success: true, message: 'QORSHE API is running', database: 'connected' });
  } catch {
    return res.status(503).json({ success: false, message: 'QORSHE API is running', database: 'unavailable' });
  }
});

export default router;

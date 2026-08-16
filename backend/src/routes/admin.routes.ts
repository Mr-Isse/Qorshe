import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.get('/test', requireAuth, requireRole('ADMIN'), (_req, res) => res.json({ success: true, message: 'Admin authorization is working.' }));
export default router;

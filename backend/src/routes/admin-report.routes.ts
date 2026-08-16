import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import * as controller from '../controllers/report.controller';
const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/overview', controller.adminOverview);
export default router;

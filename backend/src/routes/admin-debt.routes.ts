import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import * as controller from '../controllers/debt.controller';
const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/summary', controller.adminSummary);
router.get('/', controller.adminListDebts);
export default router;

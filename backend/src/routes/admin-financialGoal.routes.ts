import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import * as goalController from '../controllers/financialGoal.controller';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/', asyncHandler(goalController.listAdminGoals));
router.get('/summary', asyncHandler(goalController.getAdminGoalSummary));
export default router;

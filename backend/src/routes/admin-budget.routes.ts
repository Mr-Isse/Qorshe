import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import * as budgetController from '../controllers/budget.controller';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/', asyncHandler(budgetController.listAdminBudgets));
router.get('/summary', asyncHandler(budgetController.getAdminBudgetSummary));
export default router;

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import * as budgetController from '../controllers/budget.controller';

const router = Router();
router.use(requireAuth);
router.post('/', asyncHandler(budgetController.createBudget));
router.get('/', asyncHandler(budgetController.getBudgets));
router.get('/summary', asyncHandler(budgetController.getBudgetSummary));
router.get('/:id', asyncHandler(budgetController.getBudgetById));
router.patch('/:id', asyncHandler(budgetController.updateBudget));
router.delete('/:id', asyncHandler(budgetController.deactivateBudget));
router.patch('/:id/restore', asyncHandler(budgetController.restoreBudget));
export default router;

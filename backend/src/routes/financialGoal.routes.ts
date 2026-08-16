import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import * as goalController from '../controllers/financialGoal.controller';

const router = Router();
router.use(requireAuth);
router.post('/', asyncHandler(goalController.createGoal));
router.get('/', asyncHandler(goalController.getGoals));
router.get('/summary', asyncHandler(goalController.getGoalSummary));
router.get('/:id', asyncHandler(goalController.getGoalById));
router.patch('/:id', asyncHandler(goalController.updateGoal));
router.delete('/:id', asyncHandler(goalController.deactivateGoal));
router.patch('/:id/restore', asyncHandler(goalController.restoreGoal));
router.post('/:id/contribute', asyncHandler(goalController.contributeToGoal));
router.post('/:id/withdraw', asyncHandler(goalController.withdrawFromGoal));
router.get('/:id/history', asyncHandler(goalController.getGoalHistory));
export default router;

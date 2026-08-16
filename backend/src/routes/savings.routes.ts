import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import * as savingsController from '../controllers/savings.controller';

const router = Router();
router.use(requireAuth);
router.post('/', asyncHandler(savingsController.createSavings));
router.get('/', asyncHandler(savingsController.getSavings));
router.get('/summary', asyncHandler(savingsController.getSavingsSummary));
router.get('/:id', asyncHandler(savingsController.getSavingsById));
router.patch('/:id', asyncHandler(savingsController.updateSavings));
router.delete('/:id', asyncHandler(savingsController.deactivateSavings));
router.patch('/:id/restore', asyncHandler(savingsController.restoreSavings));
router.post('/:id/deposit', asyncHandler(savingsController.depositSavings));
router.post('/:id/withdraw', asyncHandler(savingsController.withdrawSavings));
router.get('/:id/history', asyncHandler(savingsController.getSavingsHistory));
export default router;

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import * as savingsController from '../controllers/savings.controller';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/', asyncHandler(savingsController.listAdminSavings));
router.get('/summary', asyncHandler(savingsController.getAdminSavingsSummary));
export default router;

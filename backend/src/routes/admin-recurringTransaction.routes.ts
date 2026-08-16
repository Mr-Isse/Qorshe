import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import * as controller from '../controllers/recurringTransaction.controller';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/', asyncHandler(controller.listAdminRecurringTransactions));
router.get('/summary', asyncHandler(controller.getAdminRecurringSummary));
export default router;

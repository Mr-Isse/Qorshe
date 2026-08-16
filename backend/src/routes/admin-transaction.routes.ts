import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import * as transactionController from '../controllers/transaction.controller';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/', asyncHandler(transactionController.listAdminTransactions));
router.get('/summary', asyncHandler(transactionController.getAdminTransactionSummary));
export default router;

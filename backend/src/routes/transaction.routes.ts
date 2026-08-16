import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import * as transactionController from '../controllers/transaction.controller';

const router = Router();
router.use(requireAuth);
router.post('/', asyncHandler(transactionController.createTransaction));
router.get('/', asyncHandler(transactionController.getTransactions));
router.get('/summary', asyncHandler(transactionController.getTransactionSummary));
router.get('/:id', asyncHandler(transactionController.getTransactionById));
router.patch('/:id', asyncHandler(transactionController.updateTransaction));
router.delete('/:id', asyncHandler(transactionController.deleteTransaction));
export default router;

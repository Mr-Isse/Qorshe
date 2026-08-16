import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as controller from '../controllers/recurringTransaction.controller';

const router = Router();
router.use(requireAuth);
router.post('/', controller.createRecurringTransaction);
router.get('/', controller.listRecurringTransactions);
router.get('/upcoming', controller.getUpcomingOccurrences);
router.post('/process', controller.processDueRecurringTransactions);
router.get('/:id', controller.getRecurringTransaction);
router.patch('/:id', controller.updateRecurringTransaction);
router.patch('/:id/pause', controller.pauseRecurringTransaction);
router.patch('/:id/resume', controller.resumeRecurringTransaction);
router.patch('/:id/restore', controller.restoreRecurringTransaction);
router.delete('/:id', controller.deactivateRecurringTransaction);
export default router;

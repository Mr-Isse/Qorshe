import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import * as controller from '../controllers/notification.controller';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/', asyncHandler(controller.listAdminNotifications));
router.get('/summary', asyncHandler(controller.getAdminNotificationSummary));
export default router;

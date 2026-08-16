import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import * as adminUserController from '../controllers/admin-user.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/test', (_req, res) => res.json({ success: true, message: 'Admin authorization is working.' }));
router.get('/users', asyncHandler(adminUserController.listUsers));
router.get('/users/:id', asyncHandler(adminUserController.getUserDetails));
router.patch('/users/:id/status', asyncHandler(adminUserController.updateUserStatus));
export default router;

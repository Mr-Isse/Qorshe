import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as userController from '../controllers/user.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth);
router.get('/me', asyncHandler(userController.getCurrentUser));
router.patch('/me', asyncHandler(userController.updateCurrentUser));
router.delete('/me', asyncHandler(userController.deactivateCurrentUser));
export default router;

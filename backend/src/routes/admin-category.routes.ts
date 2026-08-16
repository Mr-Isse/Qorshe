import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import * as categoryController from '../controllers/category.controller';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/', asyncHandler(categoryController.listAdminCategories));
router.post('/', asyncHandler(categoryController.createAdminCategory));
router.patch('/:id', asyncHandler(categoryController.updateAdminCategory));
router.delete('/:id', asyncHandler(categoryController.deactivateAdminCategory));
router.patch('/:id/restore', asyncHandler(categoryController.restoreAdminCategory));
export default router;

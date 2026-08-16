import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import * as categoryController from '../controllers/category.controller';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(categoryController.getCategories));
router.get('/:id', asyncHandler(categoryController.getCategoryById));
router.post('/', asyncHandler(categoryController.createCategory));
router.patch('/:id', asyncHandler(categoryController.updateCategory));
router.delete('/:id', asyncHandler(categoryController.deactivateCategory));
router.patch('/:id/restore', asyncHandler(categoryController.restoreCategory));
export default router;

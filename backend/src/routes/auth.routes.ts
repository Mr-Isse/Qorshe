import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import * as authController from '../controllers/auth.controller';
import { asyncHandler } from '../utils/asyncHandler';

const sensitiveLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Too many authentication requests. Please try again later.' } });
const router = Router();

router.post('/register', sensitiveLimiter, asyncHandler(authController.register));
router.post('/login', sensitiveLimiter, asyncHandler(authController.login));
router.post('/refresh', sensitiveLimiter, asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', requireAuth, asyncHandler(authController.me));
router.patch('/change-password', requireAuth, asyncHandler(authController.changePassword));
router.post('/forgot-password', sensitiveLimiter, asyncHandler(authController.forgotPassword));
router.post('/reset-password', sensitiveLimiter, asyncHandler(authController.resetPassword));

export default router;

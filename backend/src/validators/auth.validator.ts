import { z } from 'zod';

const strongPassword = z.string().min(8, 'Password must be at least 8 characters.').regex(/[A-Z]/, 'Password must include an uppercase letter.').regex(/[a-z]/, 'Password must include a lowercase letter.').regex(/[0-9]/, 'Password must include a number.');
const email = z.string().trim().toLowerCase().email('Please provide a valid email.');

export const registerSchema = z.object({ name: z.string().trim().min(2).max(100), email, phone: z.string().trim().min(6).max(30).optional().or(z.literal('')), password: strongPassword });
export const loginSchema = z.object({ email, password: z.string().min(1) });
export const refreshSchema = z.object({ refreshToken: z.string().min(1) });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: strongPassword });
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({ token: z.string().min(1), newPassword: strongPassword });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

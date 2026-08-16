import type { Request, Response } from 'express';
import { getPrismaClient } from '../config/prisma';
import { adminCategoryQuerySchema, categoryInputSchema, categoryQuerySchema } from '../validators/category.validator';

const categorySelect = { id: true, name: true, type: true, icon: true, isDefault: true, isActive: true, createdAt: true, updatedAt: true } as const;

function normalizedName(name: string) { return name.trim().replace(/\s+/g, ' '); }
function visibleWhere(userId: string, includeInactive: boolean) { return { OR: [{ isDefault: true }, { userId }], ...(includeInactive ? {} : { isActive: true }) }; }

async function duplicateExists(name: string, type: 'INCOME' | 'EXPENSE', userId: string, excludeId?: string) {
  return getPrismaClient().category.findFirst({ where: { name: { equals: normalizedName(name), mode: 'insensitive' }, type, ...(excludeId ? { NOT: { id: excludeId } } : {}), OR: [{ isDefault: true }, { userId }] }, select: { id: true } });
}

export async function getCategories(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const parsed = categoryQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid category filters.' });
  const { type, search, includeInactive } = parsed.data;
  const categories = await getPrismaClient().category.findMany({ where: { ...visibleWhere(req.user.id, includeInactive), ...(type ? { type } : {}), ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}) }, select: categorySelect, orderBy: [{ isDefault: 'desc' }, { name: 'asc' }] });
  return res.json({ success: true, message: 'Categories retrieved successfully', data: categories });
}

export async function getCategoryById(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
  const category = await getPrismaClient().category.findFirst({ where: { id, OR: [{ isDefault: true }, { userId: req.user.id }] }, select: categorySelect });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
  return res.json({ success: true, message: 'Category retrieved successfully', data: category });
}

export async function createCategory(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const parsed = categoryInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid category data.', errors: parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) });
  const duplicate = await duplicateExists(parsed.data.name, parsed.data.type, req.user.id);
  if (duplicate) return res.status(409).json({ success: false, message: 'A category with this name and type already exists.' });
  const category = await getPrismaClient().category.create({ data: { name: normalizedName(parsed.data.name), type: parsed.data.type, icon: parsed.data.icon || null, userId: req.user.id, isDefault: false }, select: categorySelect });
  return res.status(201).json({ success: true, message: 'Category created successfully', data: category });
}

export async function updateCategory(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
  const parsed = categoryInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid category data.', errors: parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) });
  const existing = await getPrismaClient().category.findUnique({ where: { id }, include: { _count: { select: { transactions: true, budgets: true } } } });
  if (!existing) return res.status(404).json({ success: false, message: 'Category not found.' });
  if (existing.isDefault || existing.userId !== req.user.id) return res.status(403).json({ success: false, message: 'You cannot modify this category.' });
  if (existing.type !== parsed.data.type && (existing._count.transactions > 0 || existing._count.budgets > 0)) return res.status(409).json({ success: false, message: 'Category type cannot change after financial records reference it.' });
  const duplicate = await duplicateExists(parsed.data.name, parsed.data.type, req.user.id, id);
  if (duplicate) return res.status(409).json({ success: false, message: 'A category with this name and type already exists.' });
  const category = await getPrismaClient().category.update({ where: { id }, data: { name: normalizedName(parsed.data.name), type: parsed.data.type, icon: parsed.data.icon || null }, select: categorySelect });
  return res.json({ success: true, message: 'Category updated successfully', data: category });
}

export async function deactivateCategory(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
  const category = await getPrismaClient().category.findUnique({ where: { id }, select: { isDefault: true, userId: true } });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
  if (category.isDefault || category.userId !== req.user.id) return res.status(403).json({ success: false, message: 'You cannot deactivate this category.' });
  const updated = await getPrismaClient().category.update({ where: { id }, data: { isActive: false }, select: categorySelect });
  return res.json({ success: true, message: 'Category deactivated successfully', data: updated });
}

export async function restoreCategory(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
  const category = await getPrismaClient().category.findUnique({ where: { id }, select: { isDefault: true, userId: true } });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
  if (category.isDefault || category.userId !== req.user.id) return res.status(403).json({ success: false, message: 'You cannot restore this category.' });
  const updated = await getPrismaClient().category.update({ where: { id }, data: { isActive: true }, select: categorySelect });
  return res.json({ success: true, message: 'Category restored successfully', data: updated });
}

export async function listAdminCategories(req: Request, res: Response) {
  const parsed = adminCategoryQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid category filters.' });
  const { page, limit, type, search, isActive } = parsed.data;
  const where = { isDefault: true, ...(type ? { type } : {}), ...(typeof isActive === 'boolean' ? { isActive } : {}), ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}) };
  const prisma = getPrismaClient();
  const [categories, total] = await prisma.$transaction([prisma.category.findMany({ where, select: { ...categorySelect, _count: { select: { transactions: true, budgets: true } } }, orderBy: { name: 'asc' }, skip: (page - 1) * limit, take: limit }), prisma.category.count({ where })]);
  return res.json({ success: true, message: 'System categories retrieved successfully', data: categories, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

export async function createAdminCategory(req: Request, res: Response) {
  const parsed = categoryInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid category data.', errors: parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) });
  const duplicate = await getPrismaClient().category.findFirst({ where: { isDefault: true, name: { equals: normalizedName(parsed.data.name), mode: 'insensitive' }, type: parsed.data.type }, select: { id: true } });
  if (duplicate) return res.status(409).json({ success: false, message: 'A system category with this name and type already exists.' });
  const category = await getPrismaClient().category.create({ data: { name: normalizedName(parsed.data.name), type: parsed.data.type, icon: parsed.data.icon || null, isDefault: true, userId: null }, select: categorySelect });
  return res.status(201).json({ success: true, message: 'System category created successfully', data: category });
}

export async function updateAdminCategory(req: Request, res: Response) {
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
  const parsed = categoryInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid category data.' });
  const existing = await getPrismaClient().category.findUnique({ where: { id }, include: { _count: { select: { transactions: true, budgets: true } } } });
  if (!existing || !existing.isDefault) return res.status(404).json({ success: false, message: 'System category not found.' });
  if (existing.type !== parsed.data.type && (existing._count.transactions > 0 || existing._count.budgets > 0)) return res.status(409).json({ success: false, message: 'Category type cannot change after financial records reference it.' });
  const duplicate = await getPrismaClient().category.findFirst({ where: { isDefault: true, name: { equals: normalizedName(parsed.data.name), mode: 'insensitive' }, type: parsed.data.type, NOT: { id } }, select: { id: true } });
  if (duplicate) return res.status(409).json({ success: false, message: 'A system category with this name and type already exists.' });
  const category = await getPrismaClient().category.update({ where: { id }, data: { name: normalizedName(parsed.data.name), type: parsed.data.type, icon: parsed.data.icon || null }, select: categorySelect });
  return res.json({ success: true, message: 'System category updated successfully', data: category });
}

export async function updateAdminCategoryStatus(req: Request, res: Response) {
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
  const active = req.body?.isActive === true;
  const category = await getPrismaClient().category.findUnique({ where: { id }, select: { isDefault: true } });
  if (!category?.isDefault) return res.status(404).json({ success: false, message: 'System category not found.' });
  const updated = await getPrismaClient().category.update({ where: { id }, data: { isActive: active }, select: categorySelect });
  return res.json({ success: true, message: active ? 'System category restored successfully' : 'System category deactivated successfully', data: updated });
}

export async function deactivateAdminCategory(req: Request, res: Response) {
  req.body = { isActive: false };
  return updateAdminCategoryStatus(req, res);
}

export async function restoreAdminCategory(req: Request, res: Response) {
  req.body = { isActive: true };
  return updateAdminCategoryStatus(req, res);
}

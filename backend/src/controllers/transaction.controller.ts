import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { getPrismaClient } from '../config/prisma';
import { createTransactionSchema, summaryQuerySchema, transactionQuerySchema, updateTransactionSchema, type TransactionInput } from '../validators/transaction.validator';

const categorySelect = { id: true, name: true, type: true, icon: true } as const;
const transactionSelect = { id: true, type: true, amount: true, currency: true, title: true, description: true, date: true, createdAt: true, updatedAt: true, category: { select: categorySelect } } as const;

function dateAtStart(value: string) { return new Date(`${value}T00:00:00.000Z`); }
function dateAtEnd(value: string) { return new Date(`${value}T23:59:59.999Z`); }
function serialize(transaction: { amount: Prisma.Decimal; title: string; [key: string]: unknown }) { return { ...transaction, amount: transaction.amount.toString(), description: transaction.description || null }; }
function validationError(res: Response, error: { issues: Array<{ path: (string | number)[]; message: string }> }) { return res.status(400).json({ success: false, message: 'Validation failed.', errors: error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) }); }

async function accessibleCategory(userId: string, categoryId: string, requireActive = true) {
  return getPrismaClient().category.findFirst({ where: { id: categoryId, ...(requireActive ? { isActive: true } : {}), OR: [{ isDefault: true }, { userId }] }, select: { id: true, type: true, isActive: true } });
}

async function validateCategory(userId: string, input: TransactionInput) {
  const category = await accessibleCategory(userId, input.categoryId);
  if (!category) return { error: 'Category is not available or inactive.' } as const;
  if (category.type !== input.type) return { error: 'Transaction type must match category type.' } as const;
  return { category } as const;
}

export async function createTransaction(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const parsed = createTransactionSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const check = await validateCategory(req.user.id, parsed.data);
  if ('error' in check) return res.status(400).json({ success: false, message: check.error });
  const data = parsed.data;
  const transaction = await getPrismaClient().transaction.create({ data: { userId: req.user.id, categoryId: data.categoryId, type: data.type, amount: new Prisma.Decimal(data.amount), currency: data.currency, title: data.description || '', description: data.description || null, date: dateAtStart(data.date) }, select: transactionSelect });
  return res.status(201).json({ success: true, message: 'Transaction created successfully', data: serialize(transaction) });
}

export async function getTransactions(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const parsed = transactionQuerySchema.safeParse(req.query);
  if (!parsed.success) return validationError(res, parsed.error);
  const filters = parsed.data;
  if (filters.categoryId && !(await accessibleCategory(req.user.id, filters.categoryId, false))) return res.status(404).json({ success: false, message: 'Category not found.' });
  const where = { userId: req.user.id, isDeleted: false, ...(filters.type ? { type: filters.type } : {}), ...(filters.categoryId ? { categoryId: filters.categoryId } : {}), ...(filters.currency ? { currency: filters.currency } : {}), ...(filters.search ? { OR: [{ description: { contains: filters.search, mode: 'insensitive' as const } }, { title: { contains: filters.search, mode: 'insensitive' as const } }] } : {}), ...(filters.startDate || filters.endDate ? { date: { ...(filters.startDate ? { gte: dateAtStart(filters.startDate) } : {}), ...(filters.endDate ? { lte: dateAtEnd(filters.endDate) } : {}) } } : {}) };
  const prisma = getPrismaClient();
  const [rows, total] = await prisma.$transaction([prisma.transaction.findMany({ where, select: transactionSelect, orderBy: { [filters.sortBy]: filters.sortOrder }, skip: (filters.page - 1) * filters.limit, take: filters.limit }), prisma.transaction.count({ where })]);
  return res.json({ success: true, message: 'Transactions retrieved successfully', data: rows.map(serialize), pagination: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) } });
}

export async function getTransactionById(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
  const transaction = await getPrismaClient().transaction.findFirst({ where: { id, userId: req.user.id, isDeleted: false }, select: transactionSelect });
  if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });
  return res.json({ success: true, message: 'Transaction retrieved successfully', data: serialize(transaction) });
}

export async function updateTransaction(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
  const parsed = updateTransactionSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const existing = await getPrismaClient().transaction.findFirst({ where: { id, userId: req.user.id, isDeleted: false }, select: { id: true } });
  if (!existing) return res.status(404).json({ success: false, message: 'Transaction not found.' });
  const check = await validateCategory(req.user.id, parsed.data);
  if ('error' in check) return res.status(400).json({ success: false, message: check.error });
  const data = parsed.data;
  const transaction = await getPrismaClient().transaction.update({ where: { id }, data: { categoryId: data.categoryId, type: data.type, amount: new Prisma.Decimal(data.amount), currency: data.currency, title: data.description || '', description: data.description || null, date: dateAtStart(data.date) }, select: transactionSelect });
  return res.json({ success: true, message: 'Transaction updated successfully', data: serialize(transaction) });
}

export async function deleteTransaction(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
  const transaction = await getPrismaClient().transaction.updateMany({ where: { id, userId: req.user.id, isDeleted: false }, data: { isDeleted: true, deletedAt: new Date() } });
  if (!transaction.count) return res.status(404).json({ success: false, message: 'Transaction not found.' });
  return res.json({ success: true, message: 'Transaction deleted successfully' });
}

function summaryWhere(userId: string, filters: { startDate?: string; endDate?: string; currency?: 'USD' | 'SOS' }) { return { userId, isDeleted: false, ...(filters.currency ? { currency: filters.currency } : {}), ...(filters.startDate || filters.endDate ? { date: { ...(filters.startDate ? { gte: dateAtStart(filters.startDate) } : {}), ...(filters.endDate ? { lte: dateAtEnd(filters.endDate) } : {}) } } : {}) }; }

export async function getTransactionSummary(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  const parsed = summaryQuerySchema.safeParse(req.query);
  if (!parsed.success) return validationError(res, parsed.error);
  const rows = await getPrismaClient().transaction.groupBy({ by: ['currency', 'type'], where: summaryWhere(req.user.id, parsed.data), _sum: { amount: true }, _count: { _all: true } });
  const currencies: Record<string, { income: string; expense: string; balance: string; transactionCount: number }> = {};
  for (const row of rows) { const current = currencies[row.currency] ?? { income: '0', expense: '0', balance: '0', transactionCount: 0 }; const amount = row._sum.amount ?? new Prisma.Decimal(0); const income = new Prisma.Decimal(current.income); const expense = new Prisma.Decimal(current.expense); const nextIncome = row.type === 'INCOME' ? income.plus(amount) : income; const nextExpense = row.type === 'EXPENSE' ? expense.plus(amount) : expense; currencies[row.currency] = { income: nextIncome.toString(), expense: nextExpense.toString(), balance: nextIncome.minus(nextExpense).toString(), transactionCount: current.transactionCount + row._count._all }; }
  return res.json({ success: true, message: 'Transaction summary retrieved successfully', data: currencies });
}

export async function listAdminTransactions(req: Request, res: Response) {
  const parsed = transactionQuerySchema.safeParse(req.query);
  if (!parsed.success) return validationError(res, parsed.error);
  const filters = parsed.data; const where = { isDeleted: false, ...(filters.type ? { type: filters.type } : {}), ...(filters.categoryId ? { categoryId: filters.categoryId } : {}), ...(filters.currency ? { currency: filters.currency } : {}), ...(filters.search ? { OR: [{ description: { contains: filters.search, mode: 'insensitive' as const } }, { title: { contains: filters.search, mode: 'insensitive' as const } }] } : {}), ...(filters.startDate || filters.endDate ? { date: { ...(filters.startDate ? { gte: dateAtStart(filters.startDate) } : {}), ...(filters.endDate ? { lte: dateAtEnd(filters.endDate) } : {}) } } : {}) };
  const prisma = getPrismaClient(); const select = { ...transactionSelect, user: { select: { id: true, name: true, email: true } } } as const;
  const [rows, total] = await prisma.$transaction([prisma.transaction.findMany({ where, select, orderBy: { [filters.sortBy]: filters.sortOrder }, skip: (filters.page - 1) * filters.limit, take: filters.limit }), prisma.transaction.count({ where })]);
  return res.json({ success: true, message: 'Admin transactions retrieved successfully', data: rows.map(serialize), pagination: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) } });
}

export async function getAdminTransactionSummary(req: Request, res: Response) {
  const parsed = summaryQuerySchema.safeParse(req.query);
  if (!parsed.success) return validationError(res, parsed.error);
  const rows = await getPrismaClient().transaction.groupBy({ by: ['currency', 'type'], where: { isDeleted: false, ...(parsed.data.currency ? { currency: parsed.data.currency } : {}), ...(parsed.data.startDate || parsed.data.endDate ? { date: { ...(parsed.data.startDate ? { gte: dateAtStart(parsed.data.startDate) } : {}), ...(parsed.data.endDate ? { lte: dateAtEnd(parsed.data.endDate) } : {}) } } : {}) }, _count: { _all: true }, _sum: { amount: true } });
  const summary = rows.reduce<Record<string, { incomeRecords: number; expenseRecords: number; incomeTotal: string; expenseTotal: string }>>((result, row) => { const current = result[row.currency] ?? { incomeRecords: 0, expenseRecords: 0, incomeTotal: '0', expenseTotal: '0' }; const total = row._sum.amount ?? new Prisma.Decimal(0); if (row.type === 'INCOME') { current.incomeRecords += row._count._all; current.incomeTotal = new Prisma.Decimal(current.incomeTotal).plus(total).toString(); } else { current.expenseRecords += row._count._all; current.expenseTotal = new Prisma.Decimal(current.expenseTotal).plus(total).toString(); } result[row.currency] = current; return result; }, {});
  return res.json({ success: true, message: 'Admin transaction summary retrieved successfully', data: summary });
}

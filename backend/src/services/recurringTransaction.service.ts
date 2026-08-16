import { Prisma } from '@prisma/client';
import { getPrismaClient } from '../config/prisma';
import { createRecurringNotification } from '../utils/notification.utils';

const MAX_OCCURRENCES_PER_SCHEDULE = 1000;
type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export function dateAtStart(value: string) { return new Date(`${value}T00:00:00.000Z`); }
export function dateKey(value: Date) { return value.toISOString().slice(0, 10); }
export function addInterval(value: Date, frequency: Frequency, interval: number) {
  const year = value.getUTCFullYear(); const month = value.getUTCMonth(); const day = value.getUTCDate();
  if (frequency === 'DAILY') return new Date(Date.UTC(year, month, day + interval));
  if (frequency === 'WEEKLY') return new Date(Date.UTC(year, month, day + (interval * 7)));
  if (frequency === 'MONTHLY') { const targetMonth = month + interval; const targetYear = year + Math.floor(targetMonth / 12); const normalizedMonth = ((targetMonth % 12) + 12) % 12; const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate(); return new Date(Date.UTC(targetYear, normalizedMonth, Math.min(day, lastDay))); }
  const targetYear = year + interval; const lastDay = new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate(); return new Date(Date.UTC(targetYear, month, Math.min(day, lastDay)));
}

export async function processRecurringTransactions(userId?: string, asOf = new Date()) {
  const prisma = getPrismaClient(); const now = asOf; let generated = 0; let schedulesProcessed = 0; let occurrencesSkipped = 0; const generatedEvents: Array<{ userId: string; scheduleId: string; name: string; amount: Prisma.Decimal; currency: string; occurrence: Date }> = [];
  await prisma.$transaction(async (tx) => {
    const schedules = await tx.recurringTransaction.findMany({ where: { ...(userId ? { userId } : {}), isActive: true, isPaused: false, nextRunDate: { lte: now } }, orderBy: { nextRunDate: 'asc' } });
    for (const schedule of schedules) {
      schedulesProcessed += 1; let occurrence = schedule.nextRunDate; let processedForSchedule = 0; let lastOccurrence: Date | null = null;
      while (occurrence <= now && processedForSchedule < MAX_OCCURRENCES_PER_SCHEDULE) {
        if (schedule.endDate && occurrence > schedule.endDate) break;
        const inserted = await tx.transaction.createMany({ data: { userId: schedule.userId, categoryId: schedule.categoryId, recurringTransactionId: schedule.id, recurringOccurrenceDate: occurrence, type: schedule.type, amount: schedule.amount, currency: schedule.currency, title: schedule.name, description: schedule.description, date: occurrence }, skipDuplicates: true });
        if (inserted.count) { generated += inserted.count; generatedEvents.push({ userId: schedule.userId, scheduleId: schedule.id, name: schedule.name, amount: schedule.amount, currency: schedule.currency, occurrence }); } else occurrencesSkipped += 1;
        lastOccurrence = occurrence; processedForSchedule += 1; occurrence = addInterval(occurrence, schedule.frequency, schedule.interval);
      }
      const reachedEnd = Boolean(schedule.endDate && occurrence > schedule.endDate);
      await tx.recurringTransaction.update({ where: { id: schedule.id }, data: { ...(lastOccurrence ? { lastRunDate: lastOccurrence } : {}), nextRunDate: occurrence, ...(reachedEnd ? { isActive: false } : {}) } });
    }
  });
  for (const event of generatedEvents) await createRecurringNotification(event.userId, 'RECURRING_GENERATED', 'Recurring transaction generated', `${event.name} for ${event.currency} ${event.amount.toString()} was added to your transactions.`, event.scheduleId, `recurring:${event.scheduleId}:generated:${event.occurrence.toISOString()}`);
  return { generated, occurrencesSkipped, schedulesProcessed, asOf: now.toISOString() };
}

export function serializeRecurring<T extends { amount: Prisma.Decimal; [key: string]: unknown }>(schedule: T) { return { ...schedule, amount: schedule.amount.toString() }; }

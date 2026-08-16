-- Module 11: Notifications & Reminders

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BUDGET_WARNING';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BUDGET_EXCEEDED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SAVINGS_PROGRESS';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SAVINGS_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'GOAL_PROGRESS';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'GOAL_DEADLINE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'GOAL_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'RECURRING_UPCOMING';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'RECURRING_GENERATED';

ALTER TABLE "Notification"
  ADD COLUMN "entityType" TEXT,
  ADD COLUMN "entityId" UUID,
  ADD COLUMN "eventKey" TEXT;

CREATE UNIQUE INDEX "Notification_userId_eventKey_key" ON "Notification"("userId", "eventKey");
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

CREATE TABLE "NotificationPreference" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "budgetNotifications" BOOLEAN NOT NULL DEFAULT true,
    "savingsNotifications" BOOLEAN NOT NULL DEFAULT true,
    "goalNotifications" BOOLEAN NOT NULL DEFAULT true,
    "recurringNotifications" BOOLEAN NOT NULL DEFAULT true,
    "systemNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

CREATE TABLE "UserDevice" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "expoPushToken" TEXT NOT NULL,
    "platform" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRegisteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserDevice_expoPushToken_key" ON "UserDevice"("expoPushToken");
CREATE INDEX "UserDevice_userId_isActive_idx" ON "UserDevice"("userId", "isActive");

ALTER TABLE "NotificationPreference"
  ADD CONSTRAINT "NotificationPreference_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserDevice"
  ADD CONSTRAINT "UserDevice_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

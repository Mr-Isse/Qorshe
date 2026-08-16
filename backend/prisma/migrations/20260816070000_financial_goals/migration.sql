-- Module 9: Financial Goals
-- The initial schema already creates FinancialGoal and FinancialGoalStatus.
-- This migration adds the lifecycle fields required by Module 9 and the atomic ledger.

ALTER TABLE "FinancialGoal"
  ADD COLUMN "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "targetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE TYPE "FinancialGoalEntryType" AS ENUM ('CONTRIBUTION', 'WITHDRAWAL');

CREATE TABLE "FinancialGoalEntry" (
    "id" UUID NOT NULL,
    "goalId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "FinancialGoalEntryType" NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinancialGoalEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FinancialGoal_currency_idx" ON "FinancialGoal"("currency");
CREATE INDEX "FinancialGoal_isActive_idx" ON "FinancialGoal"("isActive");
CREATE INDEX "FinancialGoal_targetDate_idx" ON "FinancialGoal"("targetDate");
CREATE INDEX "FinancialGoalEntry_goalId_idx" ON "FinancialGoalEntry"("goalId");
CREATE INDEX "FinancialGoalEntry_userId_idx" ON "FinancialGoalEntry"("userId");
CREATE INDEX "FinancialGoalEntry_date_idx" ON "FinancialGoalEntry"("date");
CREATE INDEX "FinancialGoalEntry_type_idx" ON "FinancialGoalEntry"("type");

ALTER TABLE "FinancialGoalEntry"
  ADD CONSTRAINT "FinancialGoalEntry_goalId_fkey"
  FOREIGN KEY ("goalId") REFERENCES "FinancialGoal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FinancialGoalEntry"
  ADD CONSTRAINT "FinancialGoalEntry_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Module 14: Debt Management

CREATE TYPE "DebtType" AS ENUM ('I_OWE', 'OWED_TO_ME');
CREATE TYPE "DebtStatus" AS ENUM ('ACTIVE', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');
ALTER TYPE "NotificationType" ADD VALUE 'DEBT_DUE_SOON';
ALTER TYPE "NotificationType" ADD VALUE 'DEBT_OVERDUE';
ALTER TYPE "NotificationType" ADD VALUE 'DEBT_PAID';
ALTER TYPE "NotificationType" ADD VALUE 'DEBT_REPAYMENT';
ALTER TABLE "NotificationPreference" ADD COLUMN "debtNotifications" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "Debt" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "DebtType" NOT NULL,
    "personName" TEXT NOT NULL,
    "personPhone" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "originalAmount" DECIMAL(19,4) NOT NULL,
    "remainingAmount" DECIMAL(19,4) NOT NULL,
    "currency" "Currency" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "DebtStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DebtRepayment" (
    "id" UUID NOT NULL,
    "debtId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" "Currency" NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DebtRepayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Debt_userId_status_idx" ON "Debt"("userId", "status");
CREATE INDEX "Debt_userId_type_currency_idx" ON "Debt"("userId", "type", "currency");
CREATE INDEX "Debt_userId_dueDate_idx" ON "Debt"("userId", "dueDate");
CREATE INDEX "Debt_userId_isDeleted_idx" ON "Debt"("userId", "isDeleted");
CREATE INDEX "DebtRepayment_debtId_paymentDate_idx" ON "DebtRepayment"("debtId", "paymentDate");
CREATE INDEX "DebtRepayment_userId_paymentDate_idx" ON "DebtRepayment"("userId", "paymentDate");

ALTER TABLE "Debt" ADD CONSTRAINT "Debt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DebtRepayment" ADD CONSTRAINT "DebtRepayment_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DebtRepayment" ADD CONSTRAINT "DebtRepayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "SavingsEntryType" AS ENUM ('DEPOSIT', 'WITHDRAWAL');

-- CreateTable
CREATE TABLE "Savings" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetAmount" DECIMAL(19,4) NOT NULL,
    "currentAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Savings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsEntry" (
    "id" UUID NOT NULL,
    "savingsId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "SavingsEntryType" NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavingsEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Savings_userId_idx" ON "Savings"("userId");
CREATE INDEX "Savings_currency_idx" ON "Savings"("currency");
CREATE INDEX "Savings_isActive_idx" ON "Savings"("isActive");
CREATE INDEX "Savings_targetDate_idx" ON "Savings"("targetDate");
CREATE INDEX "SavingsEntry_savingsId_idx" ON "SavingsEntry"("savingsId");
CREATE INDEX "SavingsEntry_userId_idx" ON "SavingsEntry"("userId");
CREATE INDEX "SavingsEntry_date_idx" ON "SavingsEntry"("date");
CREATE INDEX "SavingsEntry_type_idx" ON "SavingsEntry"("type");

-- AddForeignKey
ALTER TABLE "Savings" ADD CONSTRAINT "Savings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SavingsEntry" ADD CONSTRAINT "SavingsEntry_savingsId_fkey" FOREIGN KEY ("savingsId") REFERENCES "Savings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SavingsEntry" ADD CONSTRAINT "SavingsEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

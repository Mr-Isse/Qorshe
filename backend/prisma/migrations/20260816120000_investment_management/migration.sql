-- Module 15: Investment Management

CREATE TYPE "InvestmentType" AS ENUM ('STOCK', 'CRYPTO', 'REAL_ESTATE', 'BUSINESS', 'GOLD', 'OTHER');
CREATE TYPE "InvestmentStatus" AS ENUM ('ACTIVE', 'SOLD', 'CLOSED');
CREATE TYPE "InvestmentTransactionType" AS ENUM ('BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL', 'DIVIDEND', 'OTHER');
ALTER TYPE "NotificationType" ADD VALUE 'INVESTMENT_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'INVESTMENT_PROFIT_MILESTONE';
ALTER TYPE "NotificationType" ADD VALUE 'INVESTMENT_LOSS_WARNING';
ALTER TABLE "NotificationPreference" ADD COLUMN "investmentNotifications" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "Investment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InvestmentType" NOT NULL,
    "description" TEXT,
    "currency" "Currency" NOT NULL,
    "quantity" DECIMAL(24,8) NOT NULL,
    "averageBuyPrice" DECIMAL(19,4) NOT NULL,
    "currentPrice" DECIMAL(19,4),
    "status" "InvestmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvestmentTransaction" (
    "id" UUID NOT NULL,
    "investmentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "InvestmentTransactionType" NOT NULL,
    "quantity" DECIMAL(24,8) NOT NULL,
    "price" DECIMAL(19,4) NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" "Currency" NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvestmentTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Investment_userId_idx" ON "Investment"("userId");
CREATE INDEX "Investment_userId_type_idx" ON "Investment"("userId", "type");
CREATE INDEX "Investment_userId_status_idx" ON "Investment"("userId", "status");
CREATE INDEX "Investment_userId_currency_idx" ON "Investment"("userId", "currency");
CREATE INDEX "Investment_userId_createdAt_idx" ON "Investment"("userId", "createdAt");
CREATE INDEX "InvestmentTransaction_investmentId_idx" ON "InvestmentTransaction"("investmentId");
CREATE INDEX "InvestmentTransaction_userId_idx" ON "InvestmentTransaction"("userId");
CREATE INDEX "InvestmentTransaction_type_idx" ON "InvestmentTransaction"("type");
CREATE INDEX "InvestmentTransaction_transactionDate_idx" ON "InvestmentTransaction"("transactionDate");

ALTER TABLE "Investment" ADD CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvestmentTransaction" ADD CONSTRAINT "InvestmentTransaction_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvestmentTransaction" ADD CONSTRAINT "InvestmentTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

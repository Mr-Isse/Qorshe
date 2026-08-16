-- AlterTable
ALTER TABLE "Budget" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Budget" ADD COLUMN "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Budget" ADD COLUMN "endDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Budget" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Budget" ALTER COLUMN "month" SET DEFAULT 1;
ALTER TABLE "Budget" ALTER COLUMN "year" SET DEFAULT 1970;

-- DropIndex
DROP INDEX IF EXISTS "Budget_userId_categoryId_month_year_key";

-- CreateIndex
CREATE INDEX "Budget_startDate_endDate_idx" ON "Budget"("startDate", "endDate");
CREATE INDEX "Budget_currency_idx" ON "Budget"("currency");
CREATE INDEX "Budget_isActive_idx" ON "Budget"("isActive");
CREATE INDEX "Budget_userId_categoryId_currency_idx" ON "Budget"("userId", "categoryId", "currency");

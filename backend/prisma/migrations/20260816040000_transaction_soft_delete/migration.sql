-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "title" SET DEFAULT '';
ALTER TABLE "Transaction" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Transaction" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Transaction_userId_type_idx" ON "Transaction"("userId", "type");
CREATE INDEX "Transaction_userId_categoryId_idx" ON "Transaction"("userId", "categoryId");
CREATE INDEX "Transaction_currency_idx" ON "Transaction"("currency");
CREATE INDEX "Transaction_isDeleted_idx" ON "Transaction"("isDeleted");

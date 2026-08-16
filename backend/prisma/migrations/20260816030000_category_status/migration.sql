-- AlterTable
ALTER TABLE "Category" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");
CREATE INDEX "Category_userId_type_isActive_idx" ON "Category"("userId", "type", "isActive");

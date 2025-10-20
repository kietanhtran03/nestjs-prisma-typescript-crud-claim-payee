/*
  Warnings:

  - A unique constraint covering the columns `[taxId]` on the table `ClaimPayee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountName]` on the table `PaymentAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ClaimPayee_taxId_key" ON "ClaimPayee"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAccount_accountName_key" ON "PaymentAccount"("accountName");

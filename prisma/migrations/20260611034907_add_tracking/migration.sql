/*
  Warnings:

  - You are about to drop the column `shippingFee` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `shippingFee`,
    ADD COLUMN `shippingCompany` VARCHAR(191) NULL,
    ADD COLUMN `trackingNumber` VARCHAR(191) NULL;

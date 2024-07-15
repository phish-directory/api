/*
  Warnings:

  - You are about to drop the column `category` on the `WalshyAPIResponse` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `WalshyAPIResponse` table. All the data in the column will be lost.
  - Added the required column `badDomain` to the `WalshyAPIResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WalshyAPIResponse" DROP COLUMN "category",
DROP COLUMN "status",
ADD COLUMN     "badDomain" BOOLEAN NOT NULL;

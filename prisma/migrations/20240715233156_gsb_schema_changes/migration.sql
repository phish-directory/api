/*
  Warnings:

  - You are about to drop the column `matched` on the `GoogleSafeBrowsingAPIResponse` table. All the data in the column will be lost.
  - You are about to drop the column `threatType` on the `GoogleSafeBrowsingAPIResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GoogleSafeBrowsingAPIResponse" DROP COLUMN "matched",
DROP COLUMN "threatType";

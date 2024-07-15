/*
  Warnings:

  - You are about to drop the column `registrar` on the `VirusTotalAPIResponse` table. All the data in the column will be lost.
  - You are about to drop the column `reputation` on the `VirusTotalAPIResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VirusTotalAPIResponse" DROP COLUMN "registrar",
DROP COLUMN "reputation";

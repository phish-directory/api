/*
  Warnings:

  - You are about to drop the column `positives` on the `VirusTotalAPIResponse` table. All the data in the column will be lost.
  - You are about to drop the column `scans` on the `VirusTotalAPIResponse` table. All the data in the column will be lost.
  - Added the required column `registrar` to the `VirusTotalAPIResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reputation` to the `VirusTotalAPIResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VirusTotalAPIResponse" DROP COLUMN "positives",
DROP COLUMN "scans",
ADD COLUMN     "registrar" TEXT NOT NULL,
ADD COLUMN     "reputation" INTEGER NOT NULL;

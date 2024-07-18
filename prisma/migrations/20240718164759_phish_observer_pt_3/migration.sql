/*
  Warnings:

  - You are about to drop the column `node` on the `PhishObserverAPIResponse` table. All the data in the column will be lost.
  - You are about to drop the column `scanId` on the `PhishObserverAPIResponse` table. All the data in the column will be lost.
  - You are about to drop the column `scanRegion` on the `PhishObserverAPIResponse` table. All the data in the column will be lost.
  - You are about to drop the column `submitRegion` on the `PhishObserverAPIResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PhishObserverAPIResponse" DROP COLUMN "node",
DROP COLUMN "scanId",
DROP COLUMN "scanRegion",
DROP COLUMN "submitRegion";

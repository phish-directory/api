/*
  Warnings:

  - You are about to drop the column `phishing` on the `PhishermanAPIResponse` table. All the data in the column will be lost.
  - You are about to drop the column `threatLevel` on the `PhishermanAPIResponse` table. All the data in the column will be lost.
  - Added the required column `classification` to the `PhishermanAPIResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verifiedPhish` to the `PhishermanAPIResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PhishermanAPIResponse" DROP COLUMN "phishing",
DROP COLUMN "threatLevel",
ADD COLUMN     "classification" TEXT NOT NULL,
ADD COLUMN     "verifiedPhish" BOOLEAN NOT NULL;

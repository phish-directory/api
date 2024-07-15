/*
  Warnings:

  - You are about to drop the column `dateReported` on the `Domain` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Domain` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Domain" DROP CONSTRAINT "Domain_userId_fkey";

-- AlterTable
ALTER TABLE "Domain" DROP COLUMN "dateReported",
DROP COLUMN "userId";

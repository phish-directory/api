/*
  Warnings:

  - You are about to drop the column `type` on the `Domain` table. All the data in the column will be lost.
  - You are about to drop the `Screencapture` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TmpVerdict` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Permissions" AS ENUM ('basic', 'trusted', 'admin');

-- CreateEnum
CREATE TYPE "Classifications" AS ENUM ('postal', 'banking', 'item_scams', 'other');

-- DropForeignKey
ALTER TABLE "Screencapture" DROP CONSTRAINT "Screencapture_domainId_fkey";

-- DropForeignKey
ALTER TABLE "TmpVerdict" DROP CONSTRAINT "TmpVerdict_domainId_fkey";

-- AlterTable
ALTER TABLE "Domain" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'user',
ADD COLUMN     "permission" "Permissions" NOT NULL DEFAULT 'basic';

-- DropTable
DROP TABLE "Screencapture";

-- DropTable
DROP TABLE "TmpVerdict";

-- DropEnum
DROP TYPE "DomainType";

-- DropEnum
DROP TYPE "verdict";

-- CreateTable
CREATE TABLE "Capture" (
    "id" SERIAL NOT NULL,
    "domainId" INTEGER,
    "binary" BYTEA NOT NULL,

    CONSTRAINT "Capture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classification" (
    "id" SERIAL NOT NULL,
    "classification" "Classifications" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "domainId" INTEGER NOT NULL,
    "classifierId" INTEGER NOT NULL,

    CONSTRAINT "Classification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DomainToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DomainToUser_AB_unique" ON "_DomainToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_DomainToUser_B_index" ON "_DomainToUser"("B");

-- AddForeignKey
ALTER TABLE "Capture" ADD CONSTRAINT "Capture_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_classifierId_fkey" FOREIGN KEY ("classifierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomainToUser" ADD CONSTRAINT "_DomainToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomainToUser" ADD CONSTRAINT "_DomainToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

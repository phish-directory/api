/*
  Warnings:

  - The primary key for the `_DomainToUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_EmailToUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_DomainToUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_EmailToUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AbuseContactType" AS ENUM ('HostingService', 'LinkShortener', 'Registrar', 'Other');

-- CreateEnum
CREATE TYPE "AbuseContactReportMethod" AS ENUM ('Email', 'ContactForm', 'Discord', 'Other', 'Unknown');

-- AlterTable
ALTER TABLE "_DomainToUser" DROP CONSTRAINT "_DomainToUser_AB_pkey";

-- AlterTable
ALTER TABLE "_EmailToUser" DROP CONSTRAINT "_EmailToUser_AB_pkey";

-- CreateTable
CREATE TABLE "AbuseContact" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AbuseContactType" NOT NULL,
    "reportMethod" "AbuseContactReportMethod" NOT NULL,
    "reportContactEmail" TEXT,
    "reportContactForm" TEXT,
    "reportContactDiscord" TEXT,
    "reportContactOther" TEXT,

    CONSTRAINT "AbuseContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "_DomainToUser_AB_unique" ON "_DomainToUser"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_EmailToUser_AB_unique" ON "_EmailToUser"("A", "B");

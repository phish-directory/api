/*
  Warnings:

  - You are about to drop the column `dateCreated` on the `Domain` table. All the data in the column will be lost.
  - You are about to drop the column `dateUpdated` on the `Domain` table. All the data in the column will be lost.
  - You are about to drop the column `lastChecked` on the `Domain` table. All the data in the column will be lost.
  - You are about to drop the column `dateCreated` on the `ExpressRequest` table. All the data in the column will be lost.
  - You are about to drop the column `dateCreated` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dateDeleted` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dateUpdated` on the `User` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Capture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Classification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Domain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ExpressRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Capture" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Classification" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Domain" DROP COLUMN "dateCreated",
DROP COLUMN "dateUpdated",
DROP COLUMN "lastChecked",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ExpressRequest" DROP COLUMN "dateCreated",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "dateCreated",
DROP COLUMN "dateDeleted",
DROP COLUMN "dateUpdated",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

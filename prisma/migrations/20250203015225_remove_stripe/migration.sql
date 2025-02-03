/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "stripeCustomerId";

-- AlterTable
ALTER TABLE "_DomainToUser" ADD CONSTRAINT "_DomainToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_DomainToUser_AB_unique";

-- AlterTable
ALTER TABLE "_EmailToUser" ADD CONSTRAINT "_EmailToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EmailToUser_AB_unique";

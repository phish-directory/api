/*
  Warnings:

  - You are about to drop the `_DomainToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DomainToUser" DROP CONSTRAINT "_DomainToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_DomainToUser" DROP CONSTRAINT "_DomainToUser_B_fkey";

-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "userId" INTEGER;

-- DropTable
DROP TABLE "_DomainToUser";

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

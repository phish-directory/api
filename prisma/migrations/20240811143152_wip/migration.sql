/*
  Warnings:

  - You are about to drop the column `classifierId` on the `Classification` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Classification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Classification" DROP CONSTRAINT "Classification_classifierId_fkey";

-- AlterTable
ALTER TABLE "Classification" DROP COLUMN "classifierId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

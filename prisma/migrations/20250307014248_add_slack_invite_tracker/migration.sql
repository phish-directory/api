-- CreateEnum
CREATE TYPE "sInvite" AS ENUM ('no', 'error', 'yes');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "invitedToSlack" "sInvite" NOT NULL DEFAULT 'no';

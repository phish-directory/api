-- CreateEnum
CREATE TYPE "ExtendedData" AS ENUM ('off', 'on', 'forced');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "useExtendedData" "ExtendedData" NOT NULL DEFAULT 'off';

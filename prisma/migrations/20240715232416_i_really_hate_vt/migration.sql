/*
  Warnings:

  - Added the required column `malicious` to the `VirusTotalAPIResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suspicious` to the `VirusTotalAPIResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VirusTotalAPIResponse" ADD COLUMN     "malicious" BOOLEAN NOT NULL,
ADD COLUMN     "suspicious" BOOLEAN NOT NULL;

/*
  Warnings:

  - Made the column `domainId` on table `PhishObserverAPIResponse` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PhishObserverAPIResponse" DROP CONSTRAINT "PhishObserverAPIResponse_domainId_fkey";

-- AlterTable
ALTER TABLE "PhishObserverAPIResponse" ALTER COLUMN "domainId" SET NOT NULL;

-- CreateTable
CREATE TABLE "UrlScanResponse" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "domainId" INTEGER NOT NULL,

    CONSTRAINT "UrlScanResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PhishObserverAPIResponse" ADD CONSTRAINT "PhishObserverAPIResponse_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrlScanResponse" ADD CONSTRAINT "UrlScanResponse_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

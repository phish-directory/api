/*
  Warnings:

  - You are about to drop the `UrlScanResponse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UrlScanResponse" DROP CONSTRAINT "UrlScanResponse_domainId_fkey";

-- DropTable
DROP TABLE "UrlScanResponse";

-- CreateTable
CREATE TABLE "UrlScanAPIResponse" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "domainId" INTEGER NOT NULL,

    CONSTRAINT "UrlScanAPIResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UrlScanAPIResponse" ADD CONSTRAINT "UrlScanAPIResponse_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

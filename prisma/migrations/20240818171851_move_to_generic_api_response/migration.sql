/*
  Warnings:

  - You are about to drop the `GoogleSafeBrowsingAPIResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IpQualityScoreAPIResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhishObserverAPIResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhishReportAPIResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhishermanAPIResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecurityTrailsAPIResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SinkingYachtsAPIResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UrlScanAPIResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VirusTotalAPIResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WalshyAPIResponse` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "APIs" AS ENUM ('SafeBrowsing', 'IpQualityScore', 'Phisherman', 'PhishObserver', 'PhishReport', 'SecurityTrails', 'SinkingYachts', 'UrlScan', 'VirusTotal', 'Walshy');

-- DropForeignKey
ALTER TABLE "GoogleSafeBrowsingAPIResponse" DROP CONSTRAINT "GoogleSafeBrowsingAPIResponse_domainId_fkey";

-- DropForeignKey
ALTER TABLE "IpQualityScoreAPIResponse" DROP CONSTRAINT "IpQualityScoreAPIResponse_domainId_fkey";

-- DropForeignKey
ALTER TABLE "PhishObserverAPIResponse" DROP CONSTRAINT "PhishObserverAPIResponse_domainId_fkey";

-- DropForeignKey
ALTER TABLE "PhishReportAPIResponse" DROP CONSTRAINT "PhishReportAPIResponse_domainId_fkey";

-- DropForeignKey
ALTER TABLE "PhishermanAPIResponse" DROP CONSTRAINT "PhishermanAPIResponse_domainId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityTrailsAPIResponse" DROP CONSTRAINT "SecurityTrailsAPIResponse_domainId_fkey";

-- DropForeignKey
ALTER TABLE "SinkingYachtsAPIResponse" DROP CONSTRAINT "SinkingYachtsAPIResponse_domainId_fkey";

-- DropForeignKey
ALTER TABLE "UrlScanAPIResponse" DROP CONSTRAINT "UrlScanAPIResponse_domainId_fkey";

-- DropForeignKey
ALTER TABLE "VirusTotalAPIResponse" DROP CONSTRAINT "VirusTotalAPIResponse_domainId_fkey";

-- DropForeignKey
ALTER TABLE "WalshyAPIResponse" DROP CONSTRAINT "WalshyAPIResponse_domainId_fkey";

-- DropTable
DROP TABLE "GoogleSafeBrowsingAPIResponse";

-- DropTable
DROP TABLE "IpQualityScoreAPIResponse";

-- DropTable
DROP TABLE "PhishObserverAPIResponse";

-- DropTable
DROP TABLE "PhishReportAPIResponse";

-- DropTable
DROP TABLE "PhishermanAPIResponse";

-- DropTable
DROP TABLE "SecurityTrailsAPIResponse";

-- DropTable
DROP TABLE "SinkingYachtsAPIResponse";

-- DropTable
DROP TABLE "UrlScanAPIResponse";

-- DropTable
DROP TABLE "VirusTotalAPIResponse";

-- DropTable
DROP TABLE "WalshyAPIResponse";

-- CreateTable
CREATE TABLE "RawAPIData" (
    "id" SERIAL NOT NULL,
    "sourceAPI" "APIs" NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "domainId" INTEGER,

    CONSTRAINT "RawAPIData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RawAPIData" ADD CONSTRAINT "RawAPIData_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

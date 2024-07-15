/*
  Warnings:

  - You are about to drop the column `asn` on the `IpQualityScoreAPIResponse` table. All the data in the column will be lost.
  - You are about to drop the column `isp` on the `IpQualityScoreAPIResponse` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `IpQualityScoreAPIResponse` table. All the data in the column will be lost.
  - You are about to drop the column `lon` on the `IpQualityScoreAPIResponse` table. All the data in the column will be lost.
  - You are about to drop the column `org` on the `IpQualityScoreAPIResponse` table. All the data in the column will be lost.
  - You are about to drop the column `threatLevel` on the `IpQualityScoreAPIResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "IpQualityScoreAPIResponse" DROP COLUMN "asn",
DROP COLUMN "isp",
DROP COLUMN "lat",
DROP COLUMN "lon",
DROP COLUMN "org",
DROP COLUMN "threatLevel";

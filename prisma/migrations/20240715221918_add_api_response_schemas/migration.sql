-- CreateTable
CREATE TABLE "GoogleSafeBrowsingAPIResponse" (
    "id" SERIAL NOT NULL,
    "domainId" INTEGER NOT NULL,
    "threatType" TEXT NOT NULL,
    "matched" BOOLEAN NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleSafeBrowsingAPIResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IpQualityScoreAPIResponse" (
    "id" SERIAL NOT NULL,
    "domainId" INTEGER NOT NULL,
    "proxy" BOOLEAN NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "asn" TEXT NOT NULL,
    "isp" TEXT NOT NULL,
    "org" TEXT NOT NULL,
    "threatLevel" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpQualityScoreAPIResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhishermanAPIResponse" (
    "id" SERIAL NOT NULL,
    "domainId" INTEGER NOT NULL,
    "phishing" BOOLEAN NOT NULL,
    "threatLevel" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhishermanAPIResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SinkingYachtsAPIResponse" (
    "id" SERIAL NOT NULL,
    "domainId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SinkingYachtsAPIResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirusTotalAPIResponse" (
    "id" SERIAL NOT NULL,
    "domainId" INTEGER NOT NULL,
    "positives" INTEGER NOT NULL,
    "scans" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirusTotalAPIResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalshyAPIResponse" (
    "id" SERIAL NOT NULL,
    "domainId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalshyAPIResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GoogleSafeBrowsingAPIResponse" ADD CONSTRAINT "GoogleSafeBrowsingAPIResponse_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IpQualityScoreAPIResponse" ADD CONSTRAINT "IpQualityScoreAPIResponse_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhishermanAPIResponse" ADD CONSTRAINT "PhishermanAPIResponse_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SinkingYachtsAPIResponse" ADD CONSTRAINT "SinkingYachtsAPIResponse_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirusTotalAPIResponse" ADD CONSTRAINT "VirusTotalAPIResponse_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalshyAPIResponse" ADD CONSTRAINT "WalshyAPIResponse_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "Permissions" AS ENUM ('basic', 'trusted', 'admin');

-- CreateEnum
CREATE TYPE "Classifications" AS ENUM ('postal', 'banking', 'item_scams', 'other');

-- CreateEnum
CREATE TYPE "APIs" AS ENUM ('SafeBrowsing', 'IpQualityScore', 'PhishObserver', 'PhishReport', 'SecurityTrails', 'SinkingYachts', 'UrlScan', 'VirusTotal', 'Walshy');

-- CreateEnum
CREATE TYPE "AbuseContactType" AS ENUM ('HostingService', 'LinkShortener', 'Registrar', 'Other');

-- CreateEnum
CREATE TYPE "AbuseContactReportMethod" AS ENUM ('Email', 'ContactForm', 'Discord', 'Other', 'Unknown');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "permission" "Permissions" NOT NULL DEFAULT 'basic',
    "stripeCustomerId" TEXT,
    "subscriptionItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "malicious" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastChecked" TIMESTAMP(3),

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "malicious" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastChecked" TIMESTAMP(3),

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpressRequest" (
    "id" SERIAL NOT NULL,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "headers" JSONB,
    "body" JSONB,
    "query" JSONB,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL DEFAULT '',
    "xIdentity" TEXT NOT NULL DEFAULT '',
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpressRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capture" (
    "id" SERIAL NOT NULL,
    "domainId" INTEGER,
    "binary" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classification" (
    "id" SERIAL NOT NULL,
    "classification" "Classifications" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "domainId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Classification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawAPIData" (
    "id" SERIAL NOT NULL,
    "sourceAPI" "APIs" NOT NULL,
    "data" JSONB NOT NULL,
    "domainId" INTEGER,
    "emailId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawAPIData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainReport" (
    "id" SERIAL NOT NULL,
    "domainId" INTEGER NOT NULL,
    "reporterId" INTEGER NOT NULL,
    "reviewerId" INTEGER,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "DomainReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbuseContact" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AbuseContactType" NOT NULL,
    "reportMethod" "AbuseContactReportMethod" NOT NULL,
    "reportContactEmail" TEXT,
    "reportContactForm" TEXT,
    "reportContactDiscord" TEXT,
    "reportContactOther" TEXT,

    CONSTRAINT "AbuseContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DomainToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EmailToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_id_key" ON "Domain"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_uuid_key" ON "Domain"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Email_uuid_key" ON "Email"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "_DomainToUser_AB_unique" ON "_DomainToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_DomainToUser_B_index" ON "_DomainToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EmailToUser_AB_unique" ON "_EmailToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_EmailToUser_B_index" ON "_EmailToUser"("B");

-- AddForeignKey
ALTER TABLE "ExpressRequest" ADD CONSTRAINT "ExpressRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capture" ADD CONSTRAINT "Capture_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawAPIData" ADD CONSTRAINT "RawAPIData_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawAPIData" ADD CONSTRAINT "RawAPIData_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainReport" ADD CONSTRAINT "DomainReport_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainReport" ADD CONSTRAINT "DomainReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainReport" ADD CONSTRAINT "DomainReport_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomainToUser" ADD CONSTRAINT "_DomainToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomainToUser" ADD CONSTRAINT "_DomainToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailToUser" ADD CONSTRAINT "_EmailToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailToUser" ADD CONSTRAINT "_EmailToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

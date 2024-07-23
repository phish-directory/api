-- CreateTable
CREATE TABLE "PhishReportAPIResponse" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "domainId" INTEGER NOT NULL,

    CONSTRAINT "PhishReportAPIResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PhishReportAPIResponse" ADD CONSTRAINT "PhishReportAPIResponse_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

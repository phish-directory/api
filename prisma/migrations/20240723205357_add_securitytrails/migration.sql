-- CreateTable
CREATE TABLE "SecurityTrailsAPIResponse" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "domainId" INTEGER NOT NULL,

    CONSTRAINT "SecurityTrailsAPIResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SecurityTrailsAPIResponse" ADD CONSTRAINT "SecurityTrailsAPIResponse_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

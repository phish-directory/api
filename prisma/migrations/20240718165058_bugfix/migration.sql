-- AlterTable
ALTER TABLE "PhishObserverAPIResponse" ADD COLUMN     "domainId" INTEGER;

-- AddForeignKey
ALTER TABLE "PhishObserverAPIResponse" ADD CONSTRAINT "PhishObserverAPIResponse_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

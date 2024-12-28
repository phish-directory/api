-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "_DomainToUser" ADD CONSTRAINT "_DomainToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_DomainToUser_AB_unique";

-- AlterTable
ALTER TABLE "_EmailToUser" ADD CONSTRAINT "_EmailToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EmailToUser_AB_unique";

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

-- AddForeignKey
ALTER TABLE "DomainReport" ADD CONSTRAINT "DomainReport_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainReport" ADD CONSTRAINT "DomainReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainReport" ADD CONSTRAINT "DomainReport_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

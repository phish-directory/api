-- CreateEnum
CREATE TYPE "verdict" AS ENUM ('postal', 'banking', 'item_scams', 'other');

-- CreateTable
CREATE TABLE "TmpVerdict" (
    "id" SERIAL NOT NULL,
    "verdict" "verdict" NOT NULL,
    "sUser" TEXT NOT NULL,
    "domainId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TmpVerdict_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TmpVerdict" ADD CONSTRAINT "TmpVerdict_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

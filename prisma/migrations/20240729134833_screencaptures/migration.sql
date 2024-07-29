-- CreateTable
CREATE TABLE "Screencapture" (
    "id" SERIAL NOT NULL,
    "domainId" INTEGER,
    "base64" TEXT NOT NULL,

    CONSTRAINT "Screencapture_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Screencapture" ADD CONSTRAINT "Screencapture_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

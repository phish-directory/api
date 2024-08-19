-- AlterTable
ALTER TABLE "RawAPIData" ADD COLUMN     "emailId" INTEGER;

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
CREATE TABLE "_EmailToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Email_uuid_key" ON "Email"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "_EmailToUser_AB_unique" ON "_EmailToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_EmailToUser_B_index" ON "_EmailToUser"("B");

-- AddForeignKey
ALTER TABLE "RawAPIData" ADD CONSTRAINT "RawAPIData_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailToUser" ADD CONSTRAINT "_EmailToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailToUser" ADD CONSTRAINT "_EmailToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

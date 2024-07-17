/*
  Warnings:

  - You are about to drop the `Request` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_userId_fkey";

-- DropTable
DROP TABLE "Request";

-- CreateTable
CREATE TABLE "ExpresRequest" (
    "id" SERIAL NOT NULL,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "headers" JSONB,
    "body" JSONB,
    "query" JSONB,
    "ip" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "ExpresRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExpresRequest" ADD CONSTRAINT "ExpresRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

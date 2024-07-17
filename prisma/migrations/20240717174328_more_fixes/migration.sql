/*
  Warnings:

  - You are about to drop the `ExpresRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExpresRequest" DROP CONSTRAINT "ExpresRequest_userId_fkey";

-- DropTable
DROP TABLE "ExpresRequest";

-- CreateTable
CREATE TABLE "ExpressRequest" (
    "id" SERIAL NOT NULL,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "headers" JSONB,
    "body" JSONB,
    "query" JSONB,
    "ip" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "ExpressRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExpressRequest" ADD CONSTRAINT "ExpressRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

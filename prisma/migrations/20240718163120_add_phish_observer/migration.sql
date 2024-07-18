-- CreateTable
CREATE TABLE "PhishObserverAPIResponse" (
    "id" SERIAL NOT NULL,
    "scanId" TEXT NOT NULL,
    "submitRegion" TEXT NOT NULL,
    "scanRegion" TEXT NOT NULL,
    "node" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhishObserverAPIResponse_pkey" PRIMARY KEY ("id")
);

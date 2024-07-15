-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('user', 'bot', 'admin');

-- CreateEnum
CREATE TYPE "DomainType" AS ENUM ('unknown', 'discord', 'slack', 'instagram', 'twitter', 'facebook', 'other');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL DEFAULT 'user',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "type" "DomainType" NOT NULL DEFAULT 'unknown',
    "domain" TEXT NOT NULL,
    "dateReported" TIMESTAMP(3)[],
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DomainToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_id_key" ON "Domain"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_uuid_key" ON "Domain"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "_DomainToUser_AB_unique" ON "_DomainToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_DomainToUser_B_index" ON "_DomainToUser"("B");

-- AddForeignKey
ALTER TABLE "_DomainToUser" ADD CONSTRAINT "_DomainToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomainToUser" ADD CONSTRAINT "_DomainToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

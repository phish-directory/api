/*
  Warnings:

  - You are about to drop the column `base64` on the `Screencapture` table. All the data in the column will be lost.
  - Added the required column `binary` to the `Screencapture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Screencapture" DROP COLUMN "base64",
ADD COLUMN     "binary" BYTEA NOT NULL;

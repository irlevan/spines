/*
  Warnings:

  - You are about to drop the column `pageOrPercent` on the `ProgressLog` table. All the data in the column will be lost.
  - Added the required column `percent` to the `ProgressLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ProgressLog" DROP COLUMN "pageOrPercent",
ADD COLUMN     "percent" DOUBLE PRECISION NOT NULL;

/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `TripUpdate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TripUpdate" DROP COLUMN "photoUrl",
ADD COLUMN     "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

/*
  Warnings:

  - Added the required column `travelDate` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "travelDate" TIMESTAMP(3);
UPDATE "Booking" SET "travelDate" = "createdAt" WHERE "travelDate" IS NULL;
ALTER TABLE "Booking" ALTER COLUMN "travelDate" SET NOT NULL;

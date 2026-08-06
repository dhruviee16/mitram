-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'vendor';

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "vendorId" TEXT;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "triggeredByDeviceId" INTEGER,
ALTER COLUMN "triggeredById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_triggeredByDeviceId_fkey" FOREIGN KEY ("triggeredByDeviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

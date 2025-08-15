-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "alertTypeId" INTEGER;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_alertTypeId_fkey" FOREIGN KEY ("alertTypeId") REFERENCES "AlertType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

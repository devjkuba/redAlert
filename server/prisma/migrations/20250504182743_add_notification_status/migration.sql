/*
  Warnings:

  - You are about to drop the column `alarmAction` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "alarmAction",
ADD COLUMN     "status" "NotificationStatus";

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "activeUntil" SET DEFAULT (CURRENT_DATE + interval '3 months');

-- DropEnum
DROP TYPE "AlarmAction";

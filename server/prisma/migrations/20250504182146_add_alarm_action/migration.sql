-- CreateEnum
CREATE TYPE "AlarmAction" AS ENUM ('ON', 'OFF');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "alarmAction" "AlarmAction";

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "activeUntil" SET DEFAULT (CURRENT_DATE + interval '3 months');

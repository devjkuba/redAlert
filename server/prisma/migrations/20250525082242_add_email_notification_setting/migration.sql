-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "activeUntil" SET DEFAULT (CURRENT_DATE + interval '3 months');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;

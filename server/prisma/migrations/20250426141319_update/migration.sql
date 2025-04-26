-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "activeUntil" SET DEFAULT (CURRENT_DATE + interval '3 months');

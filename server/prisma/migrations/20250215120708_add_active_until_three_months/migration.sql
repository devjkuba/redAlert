-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "activeUntil" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_DATE + interval '3 months');

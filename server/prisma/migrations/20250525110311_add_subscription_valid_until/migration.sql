-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "subscriptionValidUntil" TIMESTAMP(3),
ALTER COLUMN "activeUntil" SET DEFAULT (CURRENT_DATE + interval '3 months');

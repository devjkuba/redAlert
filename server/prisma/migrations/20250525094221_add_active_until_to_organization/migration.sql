-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "subscriptionPaid" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "activeUntil" SET DEFAULT (CURRENT_DATE + interval '3 months');

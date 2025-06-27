-- CreateTable
CREATE TABLE "EmergencyService" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "hasSms" BOOLEAN NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyService_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmergencyService" ADD CONSTRAINT "EmergencyService_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

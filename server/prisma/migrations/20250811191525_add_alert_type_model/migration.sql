-- CreateTable
CREATE TABLE "AlertType" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AlertType" ADD CONSTRAINT "AlertType_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "hasMonitoring" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MonitoringAccess" (
    "id" SERIAL NOT NULL,
    "watcherOrgId" INTEGER NOT NULL,
    "targetOrgId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoringAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonitoringAccess_watcherOrgId_targetOrgId_key" ON "MonitoringAccess"("watcherOrgId", "targetOrgId");

-- AddForeignKey
ALTER TABLE "MonitoringAccess" ADD CONSTRAINT "MonitoringAccess_watcherOrgId_fkey" FOREIGN KEY ("watcherOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringAccess" ADD CONSTRAINT "MonitoringAccess_targetOrgId_fkey" FOREIGN KEY ("targetOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

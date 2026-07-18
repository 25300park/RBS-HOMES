-- AlterTable: agentschedule.sourceScheduleId
ALTER TABLE `agentschedule` ADD COLUMN `sourceScheduleId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `agentschedule_sourceScheduleId_idx` ON `agentschedule`(`sourceScheduleId`);

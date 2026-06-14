-- AlterTable: unit.agentId
ALTER TABLE `unit` ADD COLUMN `agentId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Unit_agentId_idx` ON `unit`(`agentId`);

-- AddForeignKey: unit.agentId -> user.id
ALTER TABLE `unit` ADD CONSTRAINT `unit_agentId_fkey`
    FOREIGN KEY (`agentId`) REFERENCES `user`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `agentschedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agentId` INTEGER NOT NULL,
    `unitId` INTEGER NULL,
    `title` VARCHAR(200) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `memo` TEXT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `AgentSchedule_agentId_idx`(`agentId`),
    INDEX `AgentSchedule_unitId_idx`(`unitId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: agentschedule.agentId -> user.id
ALTER TABLE `agentschedule` ADD CONSTRAINT `agentschedule_agentId_fkey`
    FOREIGN KEY (`agentId`) REFERENCES `user`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: agentschedule.unitId -> unit.id
ALTER TABLE `agentschedule` ADD CONSTRAINT `agentschedule_unitId_fkey`
    FOREIGN KEY (`unitId`) REFERENCES `unit`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

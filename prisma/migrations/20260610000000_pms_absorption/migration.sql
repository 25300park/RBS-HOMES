-- AlterTable: User — PMS 확장 필드 추가
ALTER TABLE `user` ADD COLUMN `viberId` VARCHAR(100) NULL;

-- AlterTable: Unit — PMS 확장 필드 추가
ALTER TABLE `unit` ADD COLUMN `condoId` INTEGER NULL;

-- CreateIndex: Unit_condoId_fkey
CREATE INDEX `Unit_condoId_fkey` ON `unit`(`condoId`);

-- CreateEnum: PaymentType
ALTER TABLE `user` ADD COLUMN `_pms_enum_placeholder` TINYINT NULL;
ALTER TABLE `user` DROP COLUMN `_pms_enum_placeholder`;

-- CreateTable: condomaster
CREATE TABLE `condomaster` (
    `id`             INTEGER NOT NULL AUTO_INCREMENT,
    `condoName`      VARCHAR(200) NOT NULL,
    `address`        VARCHAR(500) NULL,
    `defaultBillDay` INTEGER NOT NULL DEFAULT 1,
    `createdAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: unit.condoId → condomaster.id
ALTER TABLE `unit` ADD CONSTRAINT `Unit_condoId_fkey`
    FOREIGN KEY (`condoId`) REFERENCES `condomaster`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: leasecontract
CREATE TABLE `leasecontract` (
    `id`          INTEGER NOT NULL AUTO_INCREMENT,
    `unitId`      INTEGER NOT NULL,
    `condoId`     INTEGER NULL,
    `landlordId`  INTEGER NOT NULL,
    `tenantId`    INTEGER NOT NULL,
    `startDate`   DATE NOT NULL,
    `endDate`     DATE NOT NULL,
    `monthlyRent` DECIMAL(12, 2) NOT NULL,
    `paymentType` ENUM('PDC','FULL_ADVANCE','HALF_ADVANCE','MONTHLY_TRANSFER') NOT NULL DEFAULT 'MONTHLY_TRANSFER',
    `status`      ENUM('ACTIVE','EXPIRING_SOON','EXPIRED','TERMINATED') NOT NULL DEFAULT 'ACTIVE',
    `notes`       TEXT NULL,
    `crmDealId`   VARCHAR(100) NULL,
    `createdById` INTEGER NULL,
    `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`   DATETIME(3) NOT NULL,

    INDEX `leasecontract_unitId_idx`(`unitId`),
    INDEX `leasecontract_landlordId_idx`(`landlordId`),
    INDEX `leasecontract_tenantId_idx`(`tenantId`),
    INDEX `leasecontract_status_idx`(`status`),
    INDEX `leasecontract_endDate_idx`(`endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: leasecontract.unitId → unit.id
ALTER TABLE `leasecontract` ADD CONSTRAINT `leasecontract_unitId_fkey`
    FOREIGN KEY (`unitId`) REFERENCES `unit`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: leasecontract.condoId → condomaster.id
ALTER TABLE `leasecontract` ADD CONSTRAINT `leasecontract_condoId_fkey`
    FOREIGN KEY (`condoId`) REFERENCES `condomaster`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: leasecontract.landlordId → user.id
ALTER TABLE `leasecontract` ADD CONSTRAINT `leasecontract_landlordId_fkey`
    FOREIGN KEY (`landlordId`) REFERENCES `user`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: leasecontract.tenantId → user.id
ALTER TABLE `leasecontract` ADD CONSTRAINT `leasecontract_tenantId_fkey`
    FOREIGN KEY (`tenantId`) REFERENCES `user`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: leasecontract.createdById → user.id
ALTER TABLE `leasecontract` ADD CONSTRAINT `leasecontract_createdById_fkey`
    FOREIGN KEY (`createdById`) REFERENCES `user`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: paymentschedule
CREATE TABLE `paymentschedule` (
    `id`              INTEGER NOT NULL AUTO_INCREMENT,
    `contractId`      INTEGER NOT NULL,
    `dueDate`         DATE NOT NULL,
    `amountDue`       DECIMAL(12, 2) NOT NULL,
    `status`          ENUM('PENDING','AWAITING_APPROVAL','PAID','OVERDUE') NOT NULL DEFAULT 'PENDING',
    `pdcNumber`       VARCHAR(100) NULL,
    `receiptImageUrl` VARCHAR(500) NULL,
    `receiptNotes`    TEXT NULL,
    `verifiedAt`      DATETIME(3) NULL,
    `verifiedById`    INTEGER NULL,
    `createdAt`       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`       DATETIME(3) NOT NULL,

    INDEX `paymentschedule_contractId_idx`(`contractId`),
    INDEX `paymentschedule_status_idx`(`status`),
    INDEX `paymentschedule_dueDate_idx`(`dueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: paymentschedule.contractId → leasecontract.id
ALTER TABLE `paymentschedule` ADD CONSTRAINT `paymentschedule_contractId_fkey`
    FOREIGN KEY (`contractId`) REFERENCES `leasecontract`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: paymentschedule.verifiedById → user.id
ALTER TABLE `paymentschedule` ADD CONSTRAINT `paymentschedule_verifiedById_fkey`
    FOREIGN KEY (`verifiedById`) REFERENCES `user`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: careservicerequest
CREATE TABLE `careservicerequest` (
    `id`             INTEGER NOT NULL AUTO_INCREMENT,
    `contractId`     INTEGER NOT NULL,
    `serviceType`    ENUM('AIRCON','CLEANING','REPAIR','HANDYMAN') NOT NULL,
    `preferredDate`  DATETIME(3) NOT NULL,
    `status`         ENUM('PENDING','SCHEDULED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    `price`          DECIMAL(10, 2) NULL,
    `description`    TEXT NULL,
    `reportImageUrl` VARCHAR(500) NULL,
    `scheduledAt`    DATETIME(3) NULL,
    `completedAt`    DATETIME(3) NULL,
    `assignedTo`     VARCHAR(100) NULL,
    `createdAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`      DATETIME(3) NOT NULL,

    INDEX `careservicerequest_contractId_idx`(`contractId`),
    INDEX `careservicerequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: careservicerequest.contractId → leasecontract.id
ALTER TABLE `careservicerequest` ADD CONSTRAINT `careservicerequest_contractId_fkey`
    FOREIGN KEY (`contractId`) REFERENCES `leasecontract`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: communitypost
CREATE TABLE `communitypost` (
    `id`        INTEGER NOT NULL AUTO_INCREMENT,
    `condoId`   INTEGER NOT NULL,
    `authorId`  INTEGER NOT NULL,
    `isNotice`  BOOLEAN NOT NULL DEFAULT false,
    `title`     VARCHAR(300) NOT NULL,
    `body`      TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `communitypost_condoId_idx`(`condoId`),
    INDEX `communitypost_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: communitypost.condoId → condomaster.id
ALTER TABLE `communitypost` ADD CONSTRAINT `communitypost_condoId_fkey`
    FOREIGN KEY (`condoId`) REFERENCES `condomaster`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: communitypost.authorId → user.id
ALTER TABLE `communitypost` ADD CONSTRAINT `communitypost_authorId_fkey`
    FOREIGN KEY (`authorId`) REFERENCES `user`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

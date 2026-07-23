-- CreateTable
CREATE TABLE `loi_document` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unitId` INTEGER NOT NULL,
    `landlordId` INTEGER NOT NULL,
    `tenantBrokerId` INTEGER NOT NULL,
    `landlordBrokerId` INTEGER NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('DRAFT','UNDER_LANDLORD_REVIEW','COUNTER_OFFERED','TENANT_APPROVED','SIGNED','REJECTED') NOT NULL DEFAULT 'DRAFT',
    `landlordSignature` TEXT NULL,
    `tenantSignature` TEXT NULL,
    `signedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `loi_document_unitId_idx`(`unitId`),
    INDEX `loi_document_landlordId_idx`(`landlordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_draft` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unitId` INTEGER NOT NULL,
    `loiId` INTEGER NOT NULL,
    `landlordBrokerId` INTEGER NOT NULL,
    `tenantBrokerId` INTEGER NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('DRAFT','UNDER_LANDLORD_REVIEW','SENT_TO_TENANT','REVISION_REQUESTED','APPROVED','FINALIZED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `contract_draft_unitId_idx`(`unitId`),
    INDEX `contract_draft_loiId_idx`(`loiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_upload` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unitId` INTEGER NOT NULL,
    `contractDraftId` INTEGER NOT NULL,
    `pdfUrl` VARCHAR(500) NOT NULL,
    `uploadedById` INTEGER NOT NULL,
    `leaseContractId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `contract_upload_leaseContractId_key`(`leaseContractId`),
    INDEX `contract_upload_unitId_idx`(`unitId`),
    INDEX `contract_upload_contractDraftId_idx`(`contractDraftId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `loi_document` ADD CONSTRAINT `loi_document_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loi_document` ADD CONSTRAINT `loi_document_landlordId_fkey` FOREIGN KEY (`landlordId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loi_document` ADD CONSTRAINT `loi_document_tenantBrokerId_fkey` FOREIGN KEY (`tenantBrokerId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loi_document` ADD CONSTRAINT `loi_document_landlordBrokerId_fkey` FOREIGN KEY (`landlordBrokerId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_draft` ADD CONSTRAINT `contract_draft_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_draft` ADD CONSTRAINT `contract_draft_loiId_fkey` FOREIGN KEY (`loiId`) REFERENCES `loi_document`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_draft` ADD CONSTRAINT `contract_draft_landlordBrokerId_fkey` FOREIGN KEY (`landlordBrokerId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_draft` ADD CONSTRAINT `contract_draft_tenantBrokerId_fkey` FOREIGN KEY (`tenantBrokerId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_upload` ADD CONSTRAINT `contract_upload_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_upload` ADD CONSTRAINT `contract_upload_contractDraftId_fkey` FOREIGN KEY (`contractDraftId`) REFERENCES `contract_draft`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_upload` ADD CONSTRAINT `contract_upload_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_upload` ADD CONSTRAINT `contract_upload_leaseContractId_fkey` FOREIGN KEY (`leaseContractId`) REFERENCES `leasecontract`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

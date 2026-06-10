-- Allow CRM-synced LeaseContracts to be created without a known landlord/tenant

-- DropForeignKey
ALTER TABLE `leasecontract` DROP FOREIGN KEY `leasecontract_landlordId_fkey`;

-- DropForeignKey
ALTER TABLE `leasecontract` DROP FOREIGN KEY `leasecontract_tenantId_fkey`;

-- AlterTable: leasecontract.landlordId / tenantId → nullable
ALTER TABLE `leasecontract`
    MODIFY `landlordId` INTEGER NULL,
    MODIFY `tenantId` INTEGER NULL;

-- AddForeignKey: leasecontract.landlordId → user.id
ALTER TABLE `leasecontract` ADD CONSTRAINT `leasecontract_landlordId_fkey`
    FOREIGN KEY (`landlordId`) REFERENCES `user`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: leasecontract.tenantId → user.id
ALTER TABLE `leasecontract` ADD CONSTRAINT `leasecontract_tenantId_fkey`
    FOREIGN KEY (`tenantId`) REFERENCES `user`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

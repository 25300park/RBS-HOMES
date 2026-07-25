-- CreateTable: 챗봇 검색 결과 0건 통계 로그
CREATE TABLE `searchmisslog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `keyword` VARCHAR(200) NULL,
    `area` VARCHAR(200) NULL,
    `sellType` VARCHAR(20) NULL,
    `type` VARCHAR(20) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `searchmisslog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

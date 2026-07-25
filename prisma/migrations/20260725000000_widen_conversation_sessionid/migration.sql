-- AlterTable: conversation.sessionId VarChar(64) → VarChar(191)
-- 카카오 user.id ("kakao:{id}" 형태) 수용을 위한 컬럼 길이 확장
ALTER TABLE `conversation` MODIFY COLUMN `sessionId` VARCHAR(191) NOT NULL;

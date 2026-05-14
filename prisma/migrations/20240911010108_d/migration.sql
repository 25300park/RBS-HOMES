-- ============================================
-- Migration: 20240911010108
-- 작업내용: Account 테이블 컬럼명 변경
--   - accessToken → access_token
--   - expiresAt   → expires_at
--   - idToken     → id_token
--   - tokenType   → token_type
--   (camelCase → snake_case 통일)
-- 작성일: 2024-09-11
-- ============================================

/*
  Warnings:

  - You are about to drop the column `accessToken` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `idToken` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `tokenType` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Account` DROP COLUMN `accessToken`,
    DROP COLUMN `expiresAt`,
    DROP COLUMN `idToken`,
    DROP COLUMN `tokenType`,
    ADD COLUMN `access_token` TEXT NULL,
    ADD COLUMN `expires_at` DATETIME(3) NULL,
    ADD COLUMN `id_token` TEXT NULL,
    ADD COLUMN `token_type` VARCHAR(191) NULL;

-- ============================================
-- Migration: 20240927174938
-- 작업내용: Unit 테이블 필드 추가/삭제
--   - priceRent  : 컬럼 삭제
--   - fullAddress: 컬럼 추가 (VARCHAR 250)
--   - ownerEmail : 컬럼 추가 (VARCHAR 50)
-- 작성일: 2024-09-27
-- ============================================

/*
  Warnings:

  - You are about to drop the column `priceRent` on the `Unit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Unit` DROP COLUMN `priceRent`,
    ADD COLUMN `fullAddress` VARCHAR(250) NULL,
    ADD COLUMN `ownerEmail` VARCHAR(50) NULL;

-- ============================================
-- Migration: 20240921070148
-- 작업내용: Unit 테이블 address1 NULL 허용
--   - address1: NOT NULL → NULL 허용으로 변경
-- 작성일: 2024-09-21
-- ============================================

-- AlterTable
ALTER TABLE `Unit` MODIFY `address1` INTEGER NULL;

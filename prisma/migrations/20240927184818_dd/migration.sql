-- ============================================
-- Migration: 20240927184818
-- 작업내용: Unit 테이블 amenity 타입 변경
--   - amenity: VarChar(50) → Json
-- 작성일: 2024-09-27
-- ============================================

/*
  Warnings:

  - You are about to alter the column `amenity` on the `Unit` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Json`.

*/
-- AlterTable
ALTER TABLE `Unit` MODIFY `amenity` JSON NULL;

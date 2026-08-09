-- ============================================================
-- Migration: 20260809000000_add_property_type_fields
-- 작업내용: 매물유형별 확장 필드 7개 추가 (all nullable)
--   totalFloors       INT         -- 건물 총 층수 (Building 필수, Office 선택)
--   completionStatus  VARCHAR(50) -- 준공 상태 (Office/Commercial 필수)
--   ceilingHeight     DOUBLE      -- 층고 미터 (Warehouse 필수, Office 선택)
--   roadFrontageM     DOUBLE      -- 도로접면 미터 (Commercial/Lot 필수)
--   footTraffic       VARCHAR(500)-- 유동인구 설명 (Commercial 필수)
--   existingTenants   VARCHAR(500)-- 임차인 현황 (Building 필수)
--   zoningType        VARCHAR(50) -- 용도지역 (Lot 필수)
-- 작성일: 2026-08-09
-- ============================================================

-- AlterTable
ALTER TABLE `unit`
  ADD COLUMN `totalFloors`      INTEGER      NULL,
  ADD COLUMN `completionStatus` VARCHAR(50)  NULL,
  ADD COLUMN `ceilingHeight`    DOUBLE       NULL,
  ADD COLUMN `roadFrontageM`    DOUBLE       NULL,
  ADD COLUMN `footTraffic`      VARCHAR(500) NULL,
  ADD COLUMN `existingTenants`  VARCHAR(500) NULL,
  ADD COLUMN `zoningType`       VARCHAR(50)  NULL;

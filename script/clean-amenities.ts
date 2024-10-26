// clean-amenities.ts
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupAmenities() {
  try {
    const units = await prisma.unit.findMany({
      where: {
        amenity: {
          not: null
        }
      }
    });

    console.log(`Found ${units.length} units to cleanup`);

    for (const unit of units) {
      if (unit.amenity) {
        try {
          // 현재 값에서 불필요한 이스케이프 제거
          const cleanValue = unit.amenity
            .replace(/\\"/g, '"')  // 이스케이프된 따옴표 제거
            .replace(/^"/, '')     // 시작 따옴표 제거
            .replace(/"$/, '');    // 끝 따옴표 제거

          console.log(`Unit ${unit.id} Before:`, unit.amenity);
          console.log(`Unit ${unit.id} After:`, cleanValue);

          await prisma.unit.update({
            where: { id: unit.id },
            data: {
              amenity: cleanValue
            }
          });
          console.log(`Successfully cleaned up unit ${unit.id}`);
        } catch (error) {
          console.error(`Failed to cleanup unit ${unit.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAmenities()
  .then(() => {
    console.log('Cleanup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });
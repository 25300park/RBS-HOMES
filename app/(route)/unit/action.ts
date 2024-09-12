// app/actions/getUnits.ts
import prisma from '@/lib/prisma';


export async function getUnitsWithAdmin(page: number, limit: number) {
  const units = await prisma.unit.findMany({
    skip: (page - 1) * limit,
    take: limit,
    include: {
      admin: true, // 관리자(User) 정보 포함
    },
  });

  const totalUnits = await prisma.unit.count(); // 전체 유닛 수를 계산하여 반환

  return {
    units: units.map((unit) => ({
      id: unit.id,
      title: unit.title,
      type: unit.type,
      sellType: unit.sellType,
      fullAddress: `${unit.address4 ?? ''}, ${unit.address3 ?? ''}, ${unit.address2 ?? ''}, ${unit.address1}`,
      address2: unit.address2,
      address3: unit.address3,
      area: unit.area,
      price: unit.price?.toNumber() ?? null,
      ownerName: unit.ownerName,
      images: unit.images as string[],
      bed: unit.bed,
      bath: unit.bath,
      parking: unit.parking,
      note: unit.note,
      admin: {
        id: unit.admin.id,
        username: unit.admin.username,
        email: unit.admin.email,
        image: unit.admin.image,
        level: unit.admin.level,
        name: unit.admin.name,
        mobile: unit.admin.mobile,
        facebook: unit.admin.facebook,
        status: unit.admin.status,
        license: unit.admin.license,
        company: unit.admin.company,
      },
    })),
    total: totalUnits,
  };
}
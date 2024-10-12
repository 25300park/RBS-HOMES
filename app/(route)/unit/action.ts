import prisma from "@/lib/prisma";

// DTO 함수 정의
const unitWithAdminDTO = (unit: any) => ({
  id: unit.id,
  title: unit.title,
  type: unit.type,
  sellType: unit.sellType,
  fullAddress: `${unit.address4 ?? ""}, ${unit.address3 ?? ""}, ${
    unit.address2 ?? ""
  }, ${unit.address1}`,
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
});

// 필터링 적용 함수
export async function getUnitsWithAdmin(
  page: number,
  limit: number,
  searchParams: Record<string, string>
) {
  // 필터링 조건 설정
  const sellType =
    searchParams.sellType !== "none" ? searchParams.sellType : undefined;
  const type = searchParams.type !== "none" ? searchParams.type : undefined;
  const bed = searchParams.bed ? parseInt(searchParams.bed) : undefined;
  const bath = searchParams.bath ? parseInt(searchParams.bath) : undefined;
  const parking = searchParams.parking
    ? parseInt(searchParams.parking)
    : undefined;
  const city =
    searchParams.city !== "All Cities" ? searchParams.city : undefined;
  const priceMin = searchParams.priceMin
    ? parseFloat(searchParams.priceMin)
    : undefined;
  const priceMax = searchParams.priceMax
    ? parseFloat(searchParams.priceMax)
    : undefined;
  const areaMin = searchParams.areaMin
    ? parseFloat(searchParams.areaMin)
    : undefined;
  const areaMax = searchParams.areaMax
    ? parseFloat(searchParams.areaMax)
    : undefined;
  const furniture =
    searchParams.furniture !== "none" ? searchParams.furniture : undefined;
  const pet = searchParams.pet !== "none" ? searchParams.pet : undefined;
  const search = searchParams.search || undefined;

  // 가격 필터 처리
  const priceFilter =
    priceMin !== undefined || priceMax !== undefined
      ? [
          { price: { gte: priceMin, lte: priceMax } },
          // { priceRent: { gte: priceMin, lte: priceMax } },
        ]
      : [];

  // 검색 필터 처리
  const searchFilter = search
    ? [{ title: { contains: search } }, { address3: { contains: search } }]
    : [];

  // 전체 필터 조건 설정
  const filterConditions = {
    sellType: sellType ? { equals: sellType } : undefined,
    type: type ? { equals: type } : undefined,
    bed: bed ? { gte: bed } : undefined,
    bath: bath ? { gte: bath } : undefined,
    parking: parking ? { gte: parking } : undefined,
    address2: city ? { equals: city } : undefined,
    area:
      areaMin !== undefined || areaMax !== undefined
        ? { gte: areaMin, lte: areaMax }
        : undefined,
    furniture: furniture ? { equals: furniture } : undefined,
    petPolicy: pet ? { equals: pet } : undefined,
    OR:
      [...priceFilter, ...searchFilter].length > 0
        ? [...priceFilter, ...searchFilter]
        : undefined,
  };

  // 트랜잭션으로 findMany와 count 동시에 실행
  const [units, totalUnits] = await prisma.$transaction([
    prisma.unit.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: filterConditions,
      include: {
        admin: true,
      },
    }),
    prisma.unit.count({
      where: filterConditions,
    }),
  ]);

  // DTO를 적용하여 반환
  return {
    units: units.map(unitWithAdminDTO),
    total: totalUnits,
  };
}

export const getUnitDetail = async (unitId: number) => {
  const unitDetail = await prisma.unit.findUnique({
    where: {
      id: unitId,
    },
    include: {
      admin: true,
    },
  });
  return { unitDetail };
};

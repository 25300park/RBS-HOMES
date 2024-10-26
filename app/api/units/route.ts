import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// API 호출 시 실행될 함수
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");

  // searchParams를 필터링 조건으로 변환
  const filters: Record<string, string> = {
    type: searchParams.get("type") || "none",
    sellType: searchParams.get("sellType") || "none",
    bed: searchParams.get("bed") || "",
    bath: searchParams.get("bath") || "",
    parking: searchParams.get("parking") || "",
    city: searchParams.get("city") || "All Cities",
    priceMin: searchParams.get("priceMin") || "",
    priceMax: searchParams.get("priceMax") || "",
    areaMin: searchParams.get("areaMin") || "",
    areaMax: searchParams.get("areaMax") || "",
    furniture: searchParams.get("furniture") || "none",
    pet: searchParams.get("pet") || "none",
    search: searchParams.get("search") || "",
    amenity: searchParams.get("amenity") || "",
  };

  try {
    // 필터링된 데이터를 가져오는 함수를 사용
    const { units, total } = await getFilteredUnits(page, limit, filters);
    // console.log(units, total)
    return NextResponse.json({ units, total });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// 필터링된 유닛 목록을 가져오는 함수
async function getFilteredUnits(page: number, limit: number, searchParams: Record<string, string>) {
  const type = searchParams.type !== "none" ? searchParams.type : undefined;
  const sellType = searchParams.sellType !== "none" ? searchParams.sellType : undefined;
  const bed = searchParams.bed ? parseInt(searchParams.bed) : undefined;
  const bath = searchParams.bath ? parseInt(searchParams.bath) : undefined;
  const parking = searchParams.parking ? parseInt(searchParams.parking) : undefined;
  const city = searchParams.city !== "All Cities" ? searchParams.city : undefined;
  const priceMin = searchParams.priceMin ? parseFloat(searchParams.priceMin) : undefined;
  const priceMax = searchParams.priceMax ? parseFloat(searchParams.priceMax) : undefined;
  const areaMin = searchParams.areaMin ? parseFloat(searchParams.areaMin) : undefined;
  const areaMax = searchParams.areaMax ? parseFloat(searchParams.areaMax) : undefined;
  const furniture = searchParams.furniture !== "none" ? searchParams.furniture : undefined;
  const pet = searchParams.pet !== "none" ? searchParams.pet : undefined;
  const search = searchParams.search || undefined;
  const amenity = searchParams.amenity
  ? decodeURIComponent(searchParams.amenity).split(",").map(a => a.trim()) // 공백 제거 및 디코딩
  : [];
  console.log(amenity)
  // 가격 필터 처리
  const priceFilter = priceMin !== undefined || priceMax !== undefined
    ? {
        price: {
          gte: priceMin || undefined,
          lte: priceMax || undefined,
        },
      }
    : undefined;

  // 검색 필터 처리
  const searchFilter = search
    ? {
        OR: [
          { title: { contains: search } },
          { address3: { contains: search } },
        ],
      }
    : undefined;

  // 어메니티 필터 처리 (모든 어메니티가 포함된 경우만 필터링)
  const amenityFilter = amenity.length > 0
    ? {
        amenity: {
          array_contains: amenity, // JSON 필드에 주어진 모든 어메니티가 포함된 경우 필터링
        },
      }
    : undefined;

  // 전체 필터 조건 설정
  const filterConditions = {
    type: type ? { equals: type } : undefined,
    sellType: sellType ? { equals: sellType } : undefined,
    bed: bed ? { gte: bed } : undefined,
    bath: bath ? { gte: bath } : undefined,
    parking: parking ? { gte: parking } : undefined,
    address2: city ? { equals: city } : undefined,
    area: areaMin !== undefined || areaMax !== undefined
      ? { gte: areaMin || undefined, lte: areaMax || undefined }
      : undefined,
    furniture: furniture ? { equals: furniture } : undefined,
    petPolicy: pet ? { equals: pet } : undefined,
    ...(amenityFilter && { ...amenityFilter }),
    ...(priceFilter && { ...priceFilter }),
    ...(searchFilter && { ...searchFilter }),
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

  // Decimal 값을 변환하여 반환
  const transformedUnits = units.map(unit => ({
    ...unit,
    price: unit.price ? unit?.price?.toNumber() : unit.price,
    outstandingPayment: unit.outstandingPayment
      ? unit?.outstandingPayment?.toNumber()
      : unit.outstandingPayment,
  }));

  return { units: transformedUnits, total: totalUnits };
}

"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getUnitListById = async (
  searchParams: Record<string, string>
): Promise<any> => {
  const session: any = await getServerSession(authOptions as any);
  const adminId = session.user.id;

  if (!adminId) {
    return { message: "Invalid access" };
  }
  const bed = searchParams.bed ? parseInt(searchParams.bed) : undefined;
  const sellType = searchParams.sellType ? searchParams.sellType : undefined;
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
  // 가격과 가격 임대 필터 처리
  const priceFilter =
    priceMin !== undefined || priceMax !== undefined
      ? [
          {
            price: {
              gte: priceMin,
              lte: priceMax,
            },
          },
        ]
      : [];

  // 검색 필터 처리
  const searchFilter = search
    ? [{ title: { contains: search } }, { address3: { contains: search } }]
    : [];

  // 유닛 검색
  const filters = [...priceFilter, ...searchFilter];
  const data = await prisma.unit.findMany({
    where: {
      adminId : adminId,
      sellType: sellType ? sellType : undefined,
      bed: bed ? { gte: bed } : undefined,
      bath: bath ? { gte: bath } : undefined,
      parking: parking ? { gte: parking } : undefined,
      address2: city ? { equals: city } : undefined,
      area:
        areaMin !== undefined || areaMax !== undefined
          ? {
              gte: areaMin,
              lte: areaMax,
            }
          : undefined,
      furniture: furniture ? { equals: furniture } : undefined,
      petPolicy: pet ? { equals: pet } : undefined,
      ...(filters.length > 0 && { OR: filters }), // 필터가 있을 때만 OR 사용
    },
  });

  const units = data.map((unit: any) => ({
    ...unit,
    outstandingPayment: unit.outstandingPayment
      ? parseFloat(unit.outstandingPayment.toString())
      : null,
    price: unit.price ? parseFloat(unit.price.toString()) : null,
    amenity: unit.amenity ? JSON.parse(unit.amenity) : [],
    images: unit.images ? JSON.parse(unit.images) : [],
  }));
  return units;
};

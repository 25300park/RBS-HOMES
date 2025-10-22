"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const getUnitListByOwner = async (
  searchParams: Record<string, string>
): Promise<any> => {
  const session: any = await getServerSession(authOptions as any);
  const adminId = session.user.id;

  if (!adminId) {
    return { message: "Invalid access" };
  }
  const type = searchParams.type !== "none" ? searchParams.type : undefined;
  const bed = searchParams.bed ? parseInt(searchParams.bed) : undefined;
  
  // activeTypes 파라미터만 처리
  const activeTypesArray = searchParams.activeTypes 
    ? searchParams.activeTypes.split(',') 
    : ["rent", "sale", "presale"]; // 기본적으로 모든 유형 포함
  
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
      status: { not: 5 }, 
      adminId: adminId,
      type: type ? { equals: type } : undefined,
      // 오직 activeTypes로만 필터링
      sellType: activeTypesArray.length > 0 ? { in: activeTypesArray } : undefined,
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

export const deleteUnit = async (unitId: any) => {
  try {
    await prisma.unit.update({
      where: {
        id: parseInt(unitId),
      },
      data: {
        status: 5,
      },
    });

    revalidatePath("/account/unit/my-list");

    return {
      status: 200,
      message: "delete successful",
    };
  } catch (err) {
    console.log(err);
    return {
      status: 400,
      message: "delete failed",
    };
  }
};
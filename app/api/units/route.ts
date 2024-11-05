export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type SortOption = "latest" | "oldest" | "priceAsc" | "priceDesc";

interface FilterParams {
  type?: string;
  sellType?: string;
  bed?: string;
  bath?: string;
  parking?: string;
  city?: string;
  priceMin?: string;
  priceMax?: string;
  areaMin?: string;
  areaMax?: string;
  furniture?: string;
  pet?: string;
  search?: string;
  amenities?: string;
  sort?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const session: any = await getServerSession(authOptions as any);
    const userId = session?.user?.id;

    const filters: FilterParams = {
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
      amenities: searchParams.get("amenities") || "",
      sort: searchParams.get("sort") || "latest",
    };

    const { units, total } = await getFilteredUnits(
      page,
      limit,
      filters,
      userId
    );

    return NextResponse.json({ units, total });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

const getAmenityFilter = (amenities: string[]) => {
  if (!amenities.length) return undefined;

  return {
    AND: [
      { amenity: { not: null } },
      { amenity: { not: "[]" } },
      ...amenities.map((amenity) => ({
        amenity: { contains: amenity },
      })),
    ],
  };
};

const getSearchFilter = (search?: string) => {
  if (!search) return undefined;

  // 검색어 전처리
  const searchTerms = search
    .split(/[\s,]+/)  // 공백이나 쉼표로 분리
    .filter(term => term.length > 0)
    .map(term => term.trim());

  if (searchTerms.length === 0) return undefined;

  return {
    OR: searchTerms.map(term => ({
      OR: [
        { title: { contains: term } },
        { fullAdress: { contains: term } },
        { address2: { contains: term } },
        { address3: { contains: term } },
        { address4: { contains: term } },
        { note: { contains: term } },
        { amenity: { contains: term } }
      ]
    }))
  };
};

const getPriceFilter = (priceMin?: number, priceMax?: number) => {
  if (!priceMin && !priceMax) return undefined;

  return {
    price: {
      gte: priceMin || undefined,
      lte: priceMax || undefined,
    },
  };
};

const getSortOption = (
  sort: SortOption
): Prisma.UnitOrderByWithRelationInput => {
  const sortOptions: Record<SortOption, Prisma.UnitOrderByWithRelationInput> = {
    latest: { lastUpdate: Prisma.SortOrder.desc },
    oldest: { lastUpdate: Prisma.SortOrder.asc },
    priceAsc: { price: Prisma.SortOrder.asc },
    priceDesc: { price: Prisma.SortOrder.desc },
  };

  return sortOptions[sort] || sortOptions.latest;
};

const parseNumericValue = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
};

async function getFilteredUnits(
  page: number,
  limit: number,
  params: FilterParams,
  userId?: number
) {
  // Parse filter values
  const type = params.type !== "none" ? params.type : undefined;
  const sellType = params.sellType !== "none" ? params.sellType : undefined;
  const bed = parseNumericValue(params.bed);
  const bath = parseNumericValue(params.bath);
  const parking = parseNumericValue(params.parking);
  const city = params.city !== "All Cities" ? params.city : undefined;
  const priceMin = parseNumericValue(params.priceMin);
  const priceMax = parseNumericValue(params.priceMax);
  const areaMin = parseNumericValue(params.areaMin);
  const areaMax = parseNumericValue(params.areaMax);
  const furniture = params.furniture !== "none" ? params.furniture : undefined;
  const pet = params.pet !== "none" ? params.pet : undefined;
  const amenities = params.amenities
    ? decodeURIComponent(params.amenities)
        .split(",")
        .map((a) => a.trim())
    : [];
  const sort = (params.sort as SortOption) || "latest";

  // Build filter conditions
  const filterConditions = {
    type: type ? { equals: type } : undefined,
    sellType: sellType ? { equals: sellType } : undefined,
    bed: bed ? { gte: bed } : undefined,
    bath: bath ? { gte: bath } : undefined,
    parking: parking ? { gte: parking } : undefined,
    address2: city ? { equals: city } : undefined,
    area:
      areaMin || areaMax
        ? {
            gte: areaMin || undefined,
            lte: areaMax || undefined,
          }
        : undefined,
    furniture: furniture ? { equals: furniture } : undefined,
    petPolicy: pet ? { equals: pet } : undefined,
    ...getAmenityFilter(amenities),
    ...getPriceFilter(priceMin, priceMax),
    ...getSearchFilter(params.search),
  };

  // Execute transaction
  const [units, totalUnits] = await prisma.$transaction([
    prisma.unit.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: filterConditions,
      include: {
        admin: true,
      },
      orderBy: getSortOption(sort),
    }),
    prisma.unit.count({
      where: filterConditions,
    }),
  ]);

  let favorites: { unitId: number }[] = [];
  if (userId) {
    favorites = await prisma.favorite.findMany({
      where: {
        userId,
        unitId: {
          in: units.map((unit) => unit.id),
        },
      },
      select: {
        unitId: true,
      },
    });
  }

  // 각 unit에 즐겨찾기 여부 추가
  const transformedUnits = units.map((unit) => ({
    ...unit,
    price: unit.price?.toNumber(),
    outstandingPayment: unit.outstandingPayment?.toNumber(),
    isFavorited: userId
      ? favorites.some((favorite) => favorite.unitId === unit.id)
      : false,
  }));

  return {
    units: transformedUnits,
    total: totalUnits,
    // favorites: favorites.map((favorite) => favorite.unitId),
  };
}

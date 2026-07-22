import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const DEFAULT_ACTIVE_TYPES = ["rent"];
const DEFAULT_AMENITIES = ["Gym", "Pool", "24/7 Security", "Garden"];
const DEFAULT_STATUS = [0, 3];

type SortOption = "latest" | "oldest" | "priceAsc" | "priceDesc";

export interface FilterParams {
  type?: string;
  sellType?: string;
  activeTypes?: string;
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
  status?: string;
}

const getAmenityFilter = (amenities: string[]) => {
  if (!amenities.length) return undefined;

  return {
    AND: [
      { amenity: { not: Prisma.DbNull } },
      ...amenities.map((amenity) => ({
        amenity: { array_contains: amenity },
      })),
    ],
  };
};

const getSearchFilter = (search?: string) => {
  if (!search) return undefined;

  const searchTerms = search
    .split(/[\s,]+/)
    .filter((term) => term.length > 0)
    .map((term) => term.trim());

  if (searchTerms.length === 0) return undefined;

  return {
    OR: searchTerms.map((term) => ({
      OR: [
        { title: { contains: term } },
        { fullAddress: { contains: term } },
        { address2: { contains: term } },
        { address3: { contains: term } },
        { address4: { contains: term } },
        { note: { contains: term } },
        { amenity: { string_contains: term } },
      ],
    })),
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

export async function getFilteredUnits(
  page: number,
  limit: number,
  params: FilterParams,
  userId?: number
) {
  const type = params.type !== "none" ? params.type : undefined;

  const activeTypesArray = params.activeTypes
    ? params.activeTypes.split(",")
    : DEFAULT_ACTIVE_TYPES;

  const statusArray = params.status
    ? params.status.split(",").map((s) => parseInt(s))
    : DEFAULT_STATUS;

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

  const amenities =
    params.amenities !== undefined
      ? params.amenities.trim() === ""
        ? []
        : decodeURIComponent(params.amenities)
            .split(",")
            .map((a) => a.trim())
      : DEFAULT_AMENITIES;

  const sort = (params.sort as SortOption) || "latest";

  const filterConditions = {
    status: { in: statusArray },
    type: type ? { equals: type } : undefined,
    sellType:
      activeTypesArray.length > 0 ? { in: activeTypesArray } : undefined,
    bed: bed ? { gte: bed } : undefined,
    bath: bath ? { gte: bath } : undefined,
    parking: parking ? { gte: parking } : undefined,
    address2: city ? { equals: city } : undefined,
    area:
      areaMin || areaMax
        ? { gte: areaMin || undefined, lte: areaMax || undefined }
        : undefined,
    furniture: furniture ? { equals: furniture } : undefined,
    petPolicy: pet ? { equals: pet } : undefined,
    ...getAmenityFilter(amenities),
    ...getPriceFilter(priceMin, priceMax),
    ...getSearchFilter(params.search),
  };

  const [units, totalUnits] = await prisma.$transaction([
    prisma.unit.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: filterConditions,
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            email: true,
            image: true,
            level: true,
            facebook: true,
            status: true,
            phone: true,
          },
        },
      },
      orderBy: getSortOption(sort),
    }),
    prisma.unit.count({ where: filterConditions }),
  ]);

  let favorites: { unitId: number }[] = [];
  if (userId) {
    favorites = await prisma.favorite.findMany({
      where: { userId, unitId: { in: units.map((unit) => unit.id) } },
      select: { unitId: true },
    });
  }

  const transformedUnits = units.map((unit) => {
    let images: string[] = [];
    if (unit.images) {
      if (Array.isArray(unit.images)) {
        images = unit.images as string[];
      } else if (typeof unit.images === "string") {
        try {
          images = JSON.parse(unit.images);
        } catch {
          images = [];
        }
      }
    }

    return {
      ...unit,
      images,
      price: unit.price?.toNumber(),
      outstandingPayment: unit.outstandingPayment?.toNumber(),
      isFavorited: userId
        ? favorites.some((favorite) => favorite.unitId === unit.id)
        : false,
    };
  });

  return { units: transformedUnits, total: totalUnits };
}

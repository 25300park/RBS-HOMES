import prisma from "@/lib/prisma";

const DEFAULT_STATUS = [0, 1, 3];

const POPULAR_AREAS = {
  bonifacio: {
    name: "Bonifacio Global City",
    keywords: ["Bonifacio", "BGC"],
    displayName: "BGC",
  },
  makati: {
    name: "Makati",
    keywords: ["Makati"],
    displayName: "Makati",
  },
  mandaluyong: {
    name: "Mandaluyong",
    keywords: ["Mandaluyong"],
    displayName: "Mandaluyong ",
  },
  muntinlupa: {
    name: "Muntinlupa",
    keywords: ["Muntinlupa"],
    displayName: "Muntinlupa",
  },
  pasay: {
    name: "Pasay",
    keywords: ["Pasay"],
    displayName: "Pasay",
  },
  quezon: {
    name: "Quezon City",
    keywords: ["Quezon City"],
    displayName: "Quezon City",
  },
  paranaque: {
    name: "Paranaque City",
    keywords: ["Paranaque"],
    displayName: "Paranaque",
  },
};

const ADMIN_SELECT = {
  id: true,
  username: true,
  email: true,
  image: true,
  level: true,
  facebook: true,
  status: true,
  phone: true,
} as const;

function createAreaFilter(keywords: string[]) {
  return {
    OR: keywords.flatMap((keyword) => [
      { address2: { contains: keyword } },
      { address3: { contains: keyword } },
      { address4: { contains: keyword } },
      { fullAddress: { contains: keyword } },
      { title: { contains: keyword } },
    ]),
  };
}

function transformUnits(units: any[]) {
  return units.map((unit) => {
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
      price: unit.price?.toNumber?.() ?? unit.price ?? null,
      outstandingPayment:
        unit.outstandingPayment?.toNumber?.() ??
        unit.outstandingPayment ??
        null,
      isFavorited: false,
      postedDate: unit.lastUpdate instanceof Date
        ? unit.lastUpdate.toISOString()
        : unit.lastUpdate,
    };
  });
}

export async function getFeaturedProperties(limit = 4) {
  const areaEntries = Object.entries(POPULAR_AREAS);

  // 모든 쿼리를 동시에 시작
  const [recentUnits, ...areaResults] = await Promise.all([
    prisma.unit.findMany({
      where: { status: { in: DEFAULT_STATUS } },
      include: { admin: { select: ADMIN_SELECT } },
      orderBy: { lastUpdate: "desc" },
      take: limit,
    }),
    ...areaEntries.map(([, area]) =>
      prisma.unit.findMany({
        where: {
          status: { in: DEFAULT_STATUS },
          ...createAreaFilter(area.keywords),
        },
        include: { admin: { select: ADMIN_SELECT } },
        orderBy: { lastUpdate: "desc" },
        take: limit,
      })
    ),
  ]);

  // 결과 취합
  const result: { [key: string]: any } = {};
  result.recentUnits = recentUnits;
  areaEntries.forEach(([areaKey], i) => {
    if (areaResults[i].length > 0) {
      result[`${areaKey}Units`] = areaResults[i];
    }
  });

  const transformed: { [key: string]: any } = {};
  for (const [key, units] of Object.entries(result)) {
    transformed[key] = transformUnits(units);
  }
  transformed.areaInfo = POPULAR_AREAS;

  return transformed;
}

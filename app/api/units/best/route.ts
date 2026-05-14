export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 湲곕낯 ?곹깭 (嫄곕옒 媛?ν븳 留ㅻЪ留?
const DEFAULT_STATUS = [0, 1, 3];

// ?멸린 吏???ㅼ젙
const POPULAR_AREAS = {
  bonifacio: {
    name: "Bonifacio Global City",
    keywords: ["Bonifacio", "BGC"],
    displayName: "BGC"
  },
  makati: {
    name: "Makati",
    keywords: ["Makati"],
    displayName: "Makati"
  },
  mandaluyong: {
    name: "Mandaluyong",
    keywords: ["Mandaluyong"],
    displayName: "Mandaluyong "
  },
  muntinlupa: {
    name: "Muntinlupa",
    keywords: ["Muntinlupa"],
    displayName: "Muntinlupa"
  },
  pasay: {
    name: "Pasay",
    keywords: ["Pasay"],
    displayName: "Pasay"
  },
  quezon: {
    name: "Quezon City",
    keywords: ["Quezon City"],
    displayName: "Quezon City"
  },
  paranaque: {
    name: "Paranaque City",
    keywords: ["Paranaque"],
    displayName: "Paranaque"
  }
};

interface Unit {
  id: number;
  title: string;
  price: any;
  address3: string;
  outstandingPayment: any;
  area: number;
  images: any;
  lastUpdate: Date;
  sellType: string;
  bed: number;
  bath: number;
  fullAdress: string;
  admin: {
    id: number;
    username: string;
    email: string;
    image: string;
    level: number;
    facebook: string;
    status: number;
    phone: string;
  };
}

// 吏??퀎 ?꾪꽣 議곌굔 ?앹꽦 ?⑥닔
function createAreaFilter(keywords: string[]) {
  return {
    OR: keywords.flatMap(keyword => [
      { address2: { contains: keyword } },
      { address3: { contains: keyword } },
      { address4: { contains: keyword } },
      { fullAdress: { contains: keyword } },
      { title: { contains: keyword } }
    ])
  };
}

// ?뱀젙 吏??쓽 留ㅻЪ??媛?몄삤???⑥닔
async function getUnitsByArea(areaKey: string, limit: number = 6) {
  const area = POPULAR_AREAS[areaKey as keyof typeof POPULAR_AREAS];
  if (!area) return [];

  return await prisma.unit.findMany({
    where: {
      status: {
        in: DEFAULT_STATUS,
      },
      ...createAreaFilter(area.keywords)
    },
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
    orderBy: {
      lastUpdate: "desc",
    },
    take: limit,
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const session: any = await getServerSession(authOptions as any);
    const userId = Number(session?.user?.id);

    // ?붿껌 ????뺤씤
    const type = searchParams.get("type") || "all"; // all, recent, ?먮뒗 ?뱀젙 吏??챸
    const limit = parseInt(searchParams.get("limit") || "6");
    const areas = searchParams.get("areas")?.split(",") || []; // ?뱀젙 吏??뱾留??붿껌

    let result: { [key: string]: any } = {};

    // 理쒓렐 留ㅻЪ (?꾩껜 吏??
    if (type === "recent" || type === "all") {
      result.recentUnits = await prisma.unit.findMany({
        where: {
          status: {
            in: DEFAULT_STATUS,
          },
        },
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
        orderBy: {
          lastUpdate: "desc",
        },
        take: limit,
      });
    }

    // 吏??퀎 留ㅻЪ??
    if (type === "all" || areas.length > 0) {
      const areasToFetch = areas.length > 0 ? areas : Object.keys(POPULAR_AREAS);
      
      for (const areaKey of areasToFetch) {
        if (POPULAR_AREAS[areaKey as keyof typeof POPULAR_AREAS]) {
          const units = await getUnitsByArea(areaKey, limit);
          if (units.length > 0) {
            result[`${areaKey}Units`] = units;
          }
        }
      }
    }

    // ?뱀젙 吏??쭔 ?붿껌?섎뒗 寃쎌슦
    if (type !== "all" && type !== "recent" && POPULAR_AREAS[type as keyof typeof POPULAR_AREAS]) {
      const units = await getUnitsByArea(type, limit);
      result[`${type}Units`] = units;
    }

    // ?ъ슜?먯쓽 利먭꺼李얘린 ?뺣낫 媛?몄삤湲?
    let favorites: { unitId: number }[] = [];
    if (userId) {
      const allUnitIds = Object.values(result)
        .flat()
        .map((unit: any) => unit.id);

      if (allUnitIds.length > 0) {
        favorites = await prisma.favorite.findMany({
          where: {
            userId,
            unitId: {
              in: allUnitIds,
            },
          },
          select: {
            unitId: true,
          },
        });
      }
    }

    // ?곗씠??蹂???⑥닔
    const transformUnits = (units: Unit[]) => {
      return units.map((unit) => ({
        ...unit,
        price: unit.price?.toNumber(),
        outstandingPayment: unit.outstandingPayment?.toNumber(),
        isFavorited: userId
          ? favorites.some((favorite) => favorite.unitId === unit.id)
          : false,
        postedDate: unit.lastUpdate.toISOString(),
      }));
    };

    // 紐⑤뱺 寃곌낵瑜?蹂??
    const transformedResult: { [key: string]: any } = {};
    for (const [key, units] of Object.entries(result)) {
      transformedResult[key] = transformUnits(units as Unit[]);
    }

    // 吏???뺣낫???④퍡 諛섑솚
    transformedResult.areaInfo = POPULAR_AREAS;

    return NextResponse.json(transformedResult);
  } catch (error) {
    console.error("Featured Properties API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured properties" },
      { status: 500 }
    );
  }
}
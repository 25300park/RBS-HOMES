export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 기본 상태 (거래 가능한 매물만)
const DEFAULT_STATUS = [0, 1, 3];

// 인기 지역 설정
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

// 지역별 필터 조건 생성 함수
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

// 특정 지역의 매물을 가져오는 함수
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

    // 요청 타입 확인
    const type = searchParams.get("type") || "all"; // all, recent, 또는 특정 지역명
    const limit = parseInt(searchParams.get("limit") || "6");
    const areas = searchParams.get("areas")?.split(",") || []; // 특정 지역들만 요청

    let result: { [key: string]: any } = {};

    // 최근 매물 (전체 지역)
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

    // 지역별 매물들
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

    // 특정 지역만 요청하는 경우
    if (type !== "all" && type !== "recent" && POPULAR_AREAS[type as keyof typeof POPULAR_AREAS]) {
      const units = await getUnitsByArea(type, limit);
      result[`${type}Units`] = units;
    }

    // 사용자의 즐겨찾기 정보 가져오기
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

    // 데이터 변환 함수
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

    // 모든 결과를 변환
    const transformedResult: { [key: string]: any } = {};
    for (const [key, units] of Object.entries(result)) {
      transformedResult[key] = transformUnits(units as Unit[]);
    }

    // 지역 정보도 함께 반환
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
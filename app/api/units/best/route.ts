export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 기본 상태 (거래 가능한 매물만)
const DEFAULT_STATUS = [0, 1, 3];

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const session: any = await getServerSession(authOptions as any);
    const userId = Number(session?.user?.id);

    // 요청 타입 확인 (popular-bonifacio, recent, 또는 둘 다)
    const type = searchParams.get("type") || "both";
    const limit = parseInt(searchParams.get("limit") || "6");

    let popularBonifacioUnits: any = [];
    let recentUnits: any = [];

    // 인기지역 (Bonifacio) 최신 매물 6개
    if (type === "popular-bonifacio" || type === "both") {
      popularBonifacioUnits = await prisma.unit.findMany({
        where: {
          status: {
            in: DEFAULT_STATUS,
          },
          OR: [
            { address2: { contains: "Bonifacio" } },
            { address3: { contains: "Bonifacio" } },
            { address4: { contains: "Bonifacio" } },
            { fullAdress: { contains: "Bonifacio" } },
            { title: { contains: "BGC" } },
            { address2: { contains: "BGC" } },
            { address3: { contains: "BGC" } },
            { address4: { contains: "BGC" } },
            { fullAdress: { contains: "BGC" } },
          ],
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

    // 최근 등록된 매물 6개 (전체 지역)
    if (type === "recent" || type === "both") {
      recentUnits = await prisma.unit.findMany({
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

    // 사용자의 즐겨찾기 정보 가져오기
    let favorites: { unitId: number }[] = [];
    if (userId) {
      const allUnitIds = [
        ...popularBonifacioUnits.map((unit:any) => unit.id),
        ...recentUnits.map((unit:any) => unit.id),
      ];

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

    const response = {
      popularBonifacioUnits: transformUnits(popularBonifacioUnits),
      recentUnits: transformUnits(recentUnits),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Featured Properties API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured properties" },
      { status: 500 }
    );
  }
}
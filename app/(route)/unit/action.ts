'use server'

import prisma from "@/lib/prisma";
import { reservationSchema } from "@/types/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from 'next/headers';

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

/**
 * IP 주소 추출 헬퍼 함수 (IPv6 처리 개선)
 */
const getClientIp = (): string => {
  const headersList = headers();
  
  console.log("Headers received:", {
    'x-forwarded-for': headersList.get('x-forwarded-for'),
    'x-real-ip': headersList.get('x-real-ip'),
    'cf-connecting-ip': headersList.get('cf-connecting-ip'),
  });

  const cleanIp = (ip: string | null): string => {
    if (!ip || ip.trim() === '') return 'unknown';
    
    ip = ip.trim();
    
    // [IPv6]:PORT 형태 처리 (예: [::1]:8080 -> ::1)
    if (ip.startsWith("[")) {
      const match = ip.match(/\[(.*?)\]/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // IPv6 주소 직접 처리 (예: ::1 또는 2001:db8::1)
    // IPv6은 콜론이 많으므로 콜론이 2개 이상이면 IPv6으로 판단
    if ((ip.match(/:/g) || []).length >= 2) {
      // IPv6 형태 그대로 반환
      return ip;
    }
    
    // IPv4 + 포트 처리 (예: 192.168.1.1:8080 -> 192.168.1.1)
    const parts = ip.split(":");
    if (parts.length === 2 && /^\d+$/.test(parts[1])) {
      return parts[0];
    }
    
    // 기타 경우 그대로 반환
    return ip;
  };

  // 1. Cloudflare
  let ip = headersList.get('cf-connecting-ip');
  if (ip) {
    const cleaned = cleanIp(ip);
    console.log("Using cf-connecting-ip:", cleaned);
    return cleaned;
  }

  // 2. x-forwarded-for (프록시)
  ip = headersList.get('x-forwarded-for');
  if (ip) {
    const ips = ip.split(",");
    const cleaned = cleanIp(ips[0].trim());
    console.log("Using x-forwarded-for:", cleaned);
    return cleaned;
  }

  // 3. x-real-ip (nginx)
  ip = headersList.get('x-real-ip');
  if (ip) {
    const cleaned = cleanIp(ip);
    console.log("Using x-real-ip:", cleaned);
    return cleaned;
  }

  console.log("No IP header found, returning 'unknown'");
  return 'unknown';
};

async function recordUnitViewSimple(
  unitId: number,
  userId: string | null,
  ip: string
) {
  try {
    // 1초 이내의 중복 확인 (경쟁 조건 방지)
    const oneSecondAgo = new Date(Date.now() - 1000);
    
    const existingLog = await prisma.unitViewLog.findFirst({
      where: {
        unitId,
        userId: userId ? parseInt(userId) : null,
        ip: ip,
        createdAt: {
          gte: oneSecondAgo,
        },
      },
    });

    if (existingLog) {
      console.log("Recent view log already exists, skipping:", { unitId, userId, ip });
      return;
    }

    // 로그 생성
    await prisma.unitViewLog.create({
      data: {
        unitId,
        userId: userId ? parseInt(userId) : null,
        ip: ip,
      },
    });

    console.log("View log created:", { unitId, userId, ip });
  } catch (error) {
    console.error("Error recording view:", error);
  }
}

export const getUnitDetail = async (unitId: number) => {
  try {
    const session: any = await getServerSession(authOptions as any);
    const ip = getClientIp();

    console.log("getUnitDetail called:", { unitId, userId: session?.user?.id, ip });

    const unitDetail = await prisma.unit.findUnique({
      where: {
        id: unitId,
      },
      include: {
        admin: true,
      },
    });

    if (!unitDetail) {
      return {
        error: "Unit not found",
        status: 404,
      };
    }

    let isFavorited = false;
    if (session?.user?.id) {
      const favorite = await prisma.favorite.findFirst({
        where: {
          unitId,
          userId: parseInt(session.user.id),
        },
      });
      isFavorited = !!favorite;
    }

    // 조회 로그 기록 (비동기 - 페이지 로드 블로킹 안 함)
    recordUnitViewSimple(unitId, session?.user?.id || null, ip).catch((error) => {
      console.error("View log error (non-blocking):", error);
    });

    const transformedUnitDetail = {
      ...unitDetail,
      price: unitDetail.price?.toNumber() ?? null,
      outstandingPayment: unitDetail.outstandingPayment?.toNumber() ?? null,
      isFavorited,
    };

    return {
      unitDetail: transformedUnitDetail,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching unit detail:", error);
    return {
      error: "Failed to fetch unit details",
      status: 500,
    };
  }
};

interface ScheduleRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
  date?: Date;
  needsDiscussion: boolean;
  unitId: number;
  userId?: number;
}

export async function requestSchedule(formData: ScheduleRequest) {
  try {
    const validatedData = reservationSchema.parse(formData);

    const scheduleData = {
      unitId: validatedData.unitId,
      userId: validatedData.userId,
      username: validatedData.name,
      email: validatedData.email,
      mobile: validatedData.phone,
      requestDate: validatedData.needsDiscussion
        ? undefined
        : validatedData.date,
      message: validatedData.message,
      status: 0,
    };

    await prisma.schedule.create({
      data: scheduleData,
    });

    revalidatePath("/account/unit/my-list");

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return {
        success: false,
        error: "Validation failed",
        validationErrors: errorMessages,
      };
    }

    console.error("Schedule creation error:", error);
    return {
      success: false,
      error: "Failed to create schedule",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const getAreaBanners = async (city?: string, address?: string) => {
  try {
    const whereConditions = [];

    if (address) {
      whereConditions.push({
        matchType: "exact_address",
        matchValue: {
          contains: address,
        },
      });
    }

    if (city) {
      whereConditions.push({
        matchType: "city",
        matchValue: {
          contains: city,
        },
      });
    }

    if (whereConditions.length === 0) {
      return { banners: [], status: 200 };
    }

    const banners = await prisma.areaBanner.findMany({
      where: {
        isActive: true,
        OR: whereConditions,
      },
      orderBy: {
        priority: "asc",
      },
    });

    return {
      banners,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching area banners:", error);
    return {
      error: "Failed to fetch area banners",
      status: 500,
      banners: [],
    };
  }
};
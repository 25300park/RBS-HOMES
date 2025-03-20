'use server'

import prisma from "@/lib/prisma";
import { reservationSchema } from "@/types/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies, headers } from 'next/headers';

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
          // { priceRent: { gte: priceMin, lte: priceMax } },
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
export const getUnitDetail = async (unitId: number) => {
  try {
    const headersList = headers();
    const session: any = await getServerSession(authOptions as any);
    const ip = headersList.get('x-forwarded-for') || 'unknown';

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

    // 조회 로그 기록
    try {
      await prisma.unitViewLog.create({
        data: {
          unitId,
          userId: session?.user?.id ? parseInt(session.user.id) : null,
          ip,
        }
      });
    } catch (error) {
      console.error("Error recording view:", error);
    }
 
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
        field: err.path.join('.'),
        message: err.message
      }));
      
      return { 
        success: false, 
        error: "Validation failed", 
        validationErrors: errorMessages 
      };
    }

    // Prisma 또는 다른 에러
    console.error("Schedule creation error:", error);
    return { 
      success: false, 
      error: "Failed to create schedule",
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export const getAreaBanners = async (city?: string, address?: string) => {
  try {
    const whereConditions = [];
    
    // 정확한 주소 매칭 (우선순위 높음)
    if (address) {
      whereConditions.push({
        matchType: 'exact_address',
        matchValue: {
          contains: address
        }
      });
    }
    
    // 도시 매칭 (우선순위 낮음)
    if (city) {
      whereConditions.push({
        matchType: 'city',
        matchValue: {
          contains: city
        }
      });
    }
    
    // 배너가 없으면 빈 배열 반환
    if (whereConditions.length === 0) {
      return { banners: [], status: 200 };
    }
    
    // 데이터베이스 쿼리
    const banners = await prisma.areaBanner.findMany({
      where: {
        isActive: true,
        OR: whereConditions
      },
      orderBy: {
        priority: 'asc' // 우선순위 높은 순 (값이 낮을수록 높은 우선순위)
      }
    });
    
    return { 
      banners,
      status: 200 
    };
  } catch (error) {
    console.error("Error fetching area banners:", error);
    return {
      error: "Failed to fetch area banners",
      status: 500,
      banners: []
    };
  }
};

// 쿠키사용
// export const getUnitDetail = async (unitId: number) => {
//   try {
//     const headersList = headers();
//     const cookieStore = cookies();
//     const session: any = await getServerSession(authOptions as any);
//     const ip = headersList.get('x-forwarded-for') || 'unknown';
//     // 유닛 정보 조회
//     const unitDetail = await prisma.unit.findUnique({
//       where: {
//         id: unitId,
//       },
//       include: {
//         admin: true,
//       },
//     });
 
//     // 유닛이 없을 경우
//     if (!unitDetail) {
//       return {
//         error: "Unit not found",
//         status: 404,
//       };
//     }
 
//     // 로그인된 경우 즐겨찾기 상태 확인
//     let isFavorited = false;
//     if (session?.user?.id) {
//       const favorite = await prisma.favorite.findFirst({
//         where: {
//           unitId,
//           userId: parseInt(session.user.id),
//         },
//       });
//       isFavorited = !!favorite;
//     }

//     // 조회 로그 기록 (별도 처리)
//     try {
//       const viewKey = `unit_view_${unitId}`;
//       const lastView = cookieStore.get(viewKey);

//       // 마지막 조회로부터 30분이 지났거나, 조회 기록이 없는 경우에만 기록
//       if (!lastView || Date.now() - new Date(lastView.value).getTime() > 30 * 60 * 1000) {
//         // 조회 로그 생성
//         await prisma.unitViewLog.create({
//           data: {
//             unitId,
//             userId: session?.user?.id ? parseInt(session.user.id) : null,
//             ip,
//           }
//         });

//         // 쿠키 설정 (30분 유효)
//         cookieStore.set(viewKey, new Date().toISOString(), {
//           expires: new Date(Date.now() + 30 * 60 * 1000),
//           httpOnly: true
//         });
//       }
//     } catch (error) {
//       console.error("Error recording view:", error);
//       // 조회 로그 기록 실패해도 계속 진행
//     }
 
//     // 데이터 정제
//     const transformedUnitDetail = {
//       ...unitDetail,
//       price: unitDetail.price?.toNumber() ?? null,
//       outstandingPayment: unitDetail.outstandingPayment?.toNumber() ?? null,
//       isFavorited,
//     };
 
//     return { 
//       unitDetail: transformedUnitDetail,
//       status: 200,
//     };
 
//   } catch (error) {
//     console.error("Error fetching unit detail:", error);
//     return {
//       error: "Failed to fetch unit details",
//       status: 500,
//     };
//   }
// };
"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import z from "zod";
import { revalidatePath } from "next/cache";


const scheduleSchema = z.object({
  title: z
    .string()
    .max(100, "Title must be 100 characters or fewer")
    .nonempty("Title is required"),
  desc: z.string().optional(),
  date: z.date().refine((val) => val !== null, {
    message: "Date is required and cannot be null",
  }),
  startedAt: z.date().optional(),
  endedAt: z.date().optional(),
  unitId: z.number().nullable().default(-1),
});

const updateScheduleSchema = z.object({
  id: z.number(),
  title: z.string().max(100).nonempty(),
  desc: z.string().optional(),
  date: z.date(),
  startedAt: z.date().optional(),
  endedAt: z.date().optional(),
  unitId: z.number().nullable().default(-1),
});


export const getUserSchedules = async () => {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user?.id) {
    throw new Error("User not authenticated");
  }

  const userId = Number(session.user.id)

  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        userId: userId,
        date: {
          not: null, // date 값이 존재하는 데이터만
        },
        status: 2, // status가 2인 데이터만
      },
      select: {
        id: true,
        unitId: true, // 유닛 아이디
        date: true, // 미팅 날짜
        message: true, // 메시지
        title: true,
        desc: true,
        startedAt: true,
        endedAt: true,
        regId: true,
      },
      orderBy: {
        date: "desc", // 필요한 정렬 조건
      },
    });
    const datesArray = schedules.map((schedule) => schedule.date);
    return { schedules, datesArray };
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw new Error("Failed to fetch schedules");
  }
};

export const getUnitDetails = async (unitId: number) => {
  try {
    const unit = await prisma.unit.findUnique({
      where: {
        id: unitId,
      },
      select: {
        id: true,
        title: true,
        type: true,
        sellType: true,
        fullAdress: true,
        ownerName: true,
        ownerMobile: true,
        ownerEmail: true,
        images: true,
        price: true,
        status: true,
      },
    });

    if (!unit) {
      throw new Error(`Unit with ID ${unitId} not found`);
    }

    return {
      ...unit,
      price: unit.price?.toString() || "0",
    };
  } catch (error) {
    console.error(`Error fetching unit details for unitId: ${unitId}`, error);
    throw new Error("Failed to fetch unit details");
  }
};

export const getUnitSceduleList = async () => {
  try {
    const session: any = await getServerSession(authOptions as any);

    if (!session || !session.user?.id) {
      throw new Error("User not authenticated");
    }

    const userId = session.user.id;

    const units = await prisma.unit.findMany({
      where: { adminId: userId, status: 0},
      select: {
        id: true,
        title: true,
        fullAdress: true,
        price: true,
        images: true,
      },
    });
    const data = units.map((unit: any) => ({
      ...unit,
      price: unit.price ? parseFloat(unit.price.toString()) : null,
      images: unit.images ? JSON.parse(unit.images) : [],
    }));
    return { data };
  } catch (error) {
    console.error(`Error fetching schedule unit list`);
    throw new Error("Failed to fetch unit details");
  }
};

export const addSchedule = async (scheduleData: any) => {
  try {
    const session: any = await getServerSession(authOptions as any);

    if (!session || !session.user?.id) {
      throw new Error("User not authenticated");
    }

    const user = session.user;
    const userId = session.user.id;

    // 데이터 유효성 검사
    const validationResult = scheduleSchema.safeParse(scheduleData);

    if (!validationResult.success) {
      return {
        status: 400,
        message: validationResult.error.errors
          .map((error) => error.message)
          .join(", "),
      };
    }

    // startedAt과 endedAt이 없는 경우 해당 날짜의 시작과 끝으로 설정
    const date = validationResult.data.date;
    const startedAt =
      validationResult.data.startedAt || new Date(date.setHours(0, 0, 0, 0));
    const endedAt =
      validationResult.data.endedAt || new Date(date.setHours(23, 59, 59, 999));

    // Prisma DB에 새로운 스케줄 추가
    await prisma.schedule.create({
      data: {
        userId,
        email: user.email,
        username: user.username,
        mobile: user.mobile,
        title: validationResult.data.title,
        desc: validationResult.data.desc,
        date,
        startedAt,
        endedAt,
        unitId: validationResult.data.unitId ?? -1,
        status: 2,
      },
    });

    revalidatePath("/account");

    return {
      status: 200,
      message: "Schedule successfully added",
    };
  } catch (error) {
    console.error("Error adding schedule:", error);
    return {
      status: 400,
      message:
        error instanceof Error ? error.message : "Failed to add schedule",
    };
  }
};

export const getFavoriteList = async () => {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user?.id) {
    throw new Error("User not authenticated");
  }

  const userId = Number(session.user.id);

  try {
    // 한 번의 쿼리로 모든 정보를 가져오기
    const units = await prisma.unit.findMany({
      where: {
        favorites: {
          some: {
            userId
          }
        }
      },
      include: {
        favorites: {
          where: {
            userId
          }
        }
      }
    });

    const data = units.map((unit: any) => ({
      ...unit,
      price: unit.price
        ? parseFloat(unit.price.toString())
        : null,
      outstandingPayment: unit.outstandingPayment
        ? parseFloat(unit.outstandingPayment.toString())
        : null,
      images: unit.images ? JSON.parse(unit.images) : [],
      isFavorited: true, // 이미 즐겨찾기된 유닛들만 가져왔으므로 true
      favorites: undefined // favorites 필드 제거
    }));

    revalidatePath('/account/unit/favorites');
    return { data };
  } catch (error) {
    console.error("Error fetching favorite list:", error);
    throw new Error("Error fetching favorite list");
  }
};

export const updateSchedule = async (scheduleId: number, scheduleData: any) => {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session || !session.user?.id) {
      throw new Error("User not authenticated");
    }

    const userId = session.user.id;

    // 기존 스케줄 확인
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    });

    if (!existingSchedule) {
      return { status: 404, message: "Schedule not found" };
    }

    // regId가 있는 경우 수정 불가
    if (existingSchedule.regId) {
      return { status: 403, message: "Cannot modify registered schedule" };
    }

    // 본인의 스케줄인지 확인
    if (existingSchedule.userId !== userId) {
      return { status: 403, message: "Not authorized to update this schedule" };
    }

    const validationResult = updateScheduleSchema.safeParse({
      ...scheduleData,
      id: scheduleId
    });

    if (!validationResult.success) {
      return {
        status: 400,
        message: validationResult.error.errors.map(error => error.message).join(", ")
      };
    }

    const date = validationResult.data.date;
    const startedAt = validationResult.data.startedAt || new Date(date.setHours(0, 0, 0, 0));
    const endedAt = validationResult.data.endedAt || new Date(date.setHours(23, 59, 59, 999));

    await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        title: validationResult.data.title,
        desc: validationResult.data.desc,
        date,
        startedAt,
        endedAt,
        unitId: validationResult.data.unitId || -1
      }
    });

    revalidatePath("/account");
    return { status: 200, message: "Schedule updated successfully" };
  } catch (error) {
    console.error("Error updating schedule:", error);
    return {
      status: 500,
      message: error instanceof Error ? error.message : "Failed to update schedule"
    };
  }
};

// 스케줄 삭제 함수
export const deleteSchedule = async (scheduleId: number) => {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session || !session.user?.id) {
      throw new Error("User not authenticated");
    }

    const userId = session.user.id;

    // 기존 스케줄 확인
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    });

    if (!existingSchedule) {
      return { status: 404, message: "Schedule not found" };
    }

    // regId가 있는 경우 삭제 불가
    if (existingSchedule.regId) {
      return { status: 403, message: "Cannot delete registered schedule" };
    }

    // 본인의 스케줄인지 확인
    if (existingSchedule.userId !== userId) {
      return { status: 403, message: "Not authorized to delete this schedule" };
    }

    await prisma.schedule.delete({
      where: { id: scheduleId }
    });

    revalidatePath("/account");
    return { status: 200, message: "Schedule deleted successfully" };
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return {
      status: 500,
      message: error instanceof Error ? error.message : "Failed to delete schedule"
    };
  }
};
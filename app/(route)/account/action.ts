"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import z from "zod";
import { revalidatePath } from "next/cache"; 
// 스케줄 추가를 위한 Zod 스키마
const scheduleSchema = z.object({
  title: z
    .string()
    .max(100, "Title must be 100 characters or fewer")
    .nonempty("Title is required"),
  date: z.date().refine((val) => val !== null, {
    message: "Date is required and cannot be null",
  }), 
  unitId: z.number().nullable(), 
});
export const getUserSchedules = async () => {
  const session: any = await getServerSession(authOptions as any);

  if (!session || !session.user?.id) {
    throw new Error("User not authenticated");
  }

  const userId = session.user.id;

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
      where: { adminId: userId },
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

export const addSchedule = async (
  title: string,
  date: Date,
  unitId: number
) => {
  try {
    const session: any = await getServerSession(authOptions as any);

    if (!session || !session.user?.id) {
      throw new Error("User not authenticated");
    }
    const user = session.user;
    const userId = session.user.id;

    // Title validation using zod
    const validationResult = scheduleSchema.safeParse({ title, date, unitId });

    if (!validationResult.success) {
      return {
        status: 400,
        message: validationResult.error.errors
          .map((error) => error.message)
          .join(", "),
      };
    }

    // Prisma DB에 새로운 스케줄 추가
    await prisma.schedule.create({
      data: {
        userId: userId,
        email: user.email,
        username: user.username,
        mobile: user.mobile,
        message: validationResult.data.title,
        date: validationResult.data.date,
        unitId: validationResult.data.unitId
          ? validationResult.data.unitId
          : -1,
        status: 2, 
      },
    });
    revalidatePath('/account');
    return {
      status: 200,
      message: "Schedule successfully added",
    };
  } catch (error) {
    console.error("Error adding schedule:", error);
    return {
      status: 400,
      message: "Failed to add schedule",
    };
  }
};

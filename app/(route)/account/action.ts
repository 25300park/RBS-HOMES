"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

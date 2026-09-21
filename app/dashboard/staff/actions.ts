"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function promoteToStaff(targetUserId: number) {
  const session: any = await getServerSession(authOptions as any);

  // 프론트 숨김만으로는 불충분 — 호출자가 총괄매니저인지 서버에서 반드시 재검증
  if (!session?.user?.isSuperAdmin) {
    return { success: false, message: "Forbidden: super admin access required." };
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, email: true, level: true },
  });

  if (!target) {
    return { success: false, message: "User not found." };
  }

  if (![2, 3].includes(target.level)) {
    return { success: false, message: "Only Agent/Broker accounts can be promoted to Staff." };
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { level: 0 },
  });

  revalidatePath("/dashboard/staff");

  return {
    success: true,
    message: `${target.name || target.email} promoted to Staff.`,
  };
}

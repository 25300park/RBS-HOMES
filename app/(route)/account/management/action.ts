"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import z from "zod";
import { revalidatePath } from 'next/cache'; 
const profileSchema = z.object({
  name: z.string().min(1, "Full name is required").max(100),
  phone: z.string().min(10, "Phone number is required"),
  profileImage: z.string().url().nullable(),
});

export const editUserProfile = async ({ name, phone, profileImage, level }: any) => {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user?.id) {
    throw new Error("User not authenticated");
  }

  const validationResult = profileSchema.safeParse({ name, phone, profileImage });
  if (!validationResult.success) {
    return {
      status: 400,
      message: validationResult.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validationResult.data.name,
        phone: validationResult.data.phone,
        image: validationResult.data.profileImage ?? session.user.image, // 이미지 URL 저장
        level: Number(level),
      },
    });
    revalidatePath('/account/management?tabs=EditInformation');
    return {
      status: 200,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      status: 500,
      message: "Failed to update profile",
    };
  }
};

"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import z from "zod";
import { revalidatePath } from "next/cache";
import { FormState } from "@/types/schema";
import { EditPasswordSchema } from "@/types/schema";
import { hash } from "bcrypt";

const profileSchema = z.object({
  name: z.string().min(1, "Full name is required").max(100),
  phone: z.string().nullable(),
  profileImage: z.string().url().nullable(),
});

export const editUserProfile = async ({
  name,
  phone,
  profileImage,
  level,
  license
}: any) => {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user?.id) {
    throw new Error("User not authenticated");
  }
  const validationResult = profileSchema.safeParse({
    name,
    phone,
    profileImage,
  });
  if (!validationResult.success) {
    return {
      status: 400,
      message: validationResult.error.errors.map((e) => e.message).join(", "),
    };
  }

  if ((level === "2" || level === "4") && (!phone || phone.length < 10)) {
    return {
      status: 400,
      message:
        "Agent and Owner must provide a valid phone number with at least 10 digits.",
    };
  }


  if (level === "3" && (!license || license.trim() === "")) {
    return {
      status: 400,
      message: "Broker must provide a valid license number.",
    };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validationResult.data.name,
        phone: validationResult.data.phone,
        image: validationResult.data.profileImage ?? session.user.image, // 이미지 URL 저장
        license: level === "3" ? license : null,
        level: Number(level),
        lastUpdate: new Date(),
      },
    });
    revalidatePath("/account/management?tabs=EditInformation");
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

export const editPassword = async (
  formState: FormState,
  formData: FormData
) => {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user?.id) {
    throw new Error("User not authenticated");
  }
  try {
    const userId = session.user.id;
    const validatedFields = EditPasswordSchema.safeParse({
      prevPassword: formData.get("prevPassword"),
      newPassword: formData.get("newPassword"),
      newPasswordCheck: formData.get("newPasswordCheck"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    const { prevPassword, newPassword } = validatedFields.data;

    const findUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // 이전 비밀번호 체크
    if (findUser?.passwordOrigin !== prevPassword) {
      return { status: 400, message: "Your existing password does not match." };
    }

    // 새 비밀번호로 업데이트
    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: findUser.id,
      },
      data: {
        password: hashedPassword,
        passwordOrigin: newPassword,
      },
    });

    return {
      status: 200,
      message: "Password has been successfully updated",
    };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      status: 500,
      message: "An error occurred while updating the password",
    };
  }
};

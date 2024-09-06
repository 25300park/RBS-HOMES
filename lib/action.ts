// @/actions/auth.ts
"use server";

import prisma from "@/lib/prisma";
import { compare, hash } from "bcrypt";
import { SignupFormSchema, FormState, LoginFormSchema } from "@/types/schema";
import { signIn } from "next-auth/react";

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = SignupFormSchema.safeParse({
    // username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const {  email, password } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return {
      errors: { email: ["Email already exists, please login."] },
    };
  }

  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      // username,
      email,
      passwordOrigin: password,
      password: hashedPassword,
    },
  });

  if (!user) {
    return {
      errors: { form: ["An error occurred while creating your account."] },
    };
  }

  return { status:200, message: "Signup successful", email, password };
}


export async function login(state: FormState, formData: FormData): Promise<FormState> {
  // 폼 유효성 검사
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  // 이메일로 사용자 조회
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    // 사용자가 없거나 비밀번호가 없는 경우 오류 처리
    return {
      errors: { email: ["Invalid login credentials."] },
    };
  }

  // 비밀번호 비교
  const passwordMatch = await compare(password, user.password);

  if (!passwordMatch) {
    return {
      errors: { password: ["Invalid login credentials."] },
    };
  }


  // 성공 시 상태와 함께 이메일 및 비밀번호 반환
  return { status: 200, message: "Login successful", email, password };
}


// @/actions/auth.ts
"use server";

// 공통 액션들
import prisma from "@/lib/prisma";
import { compare, hash } from "bcrypt";
import { SignupFormSchema, FormState, LoginFormSchema } from "@/types/schema";


//로그인 회원가입 관련
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


//유닛 관련


export const getUnitList = async (searchParams: Record<string, string>): Promise<any> => {
  const bed = searchParams.bed ? parseInt(searchParams.bed) : undefined;
  const bath = searchParams.bath ? parseInt(searchParams.bath) : undefined;
  const parking = searchParams.parking === 'true' ? true : undefined;
  const city = searchParams.city || undefined;
  const priceMin = searchParams.priceMin ? parseFloat(searchParams.priceMin) : undefined;
  const priceMax = searchParams.priceMax ? parseFloat(searchParams.priceMax) : undefined;
  const search = searchParams.search || undefined;

  const data = await prisma.unit.findMany({
    where: {
      bed: bed ? { gte: bed } : undefined,
      bath: bath ? { gte: bath } : undefined,
      parking: parking !== undefined ? { gte: parking ? 1 : 0 } : undefined,
      address2: city ? { equals: city } : undefined,
      price:
        priceMin !== undefined || priceMax !== undefined
          ? {
              gte: priceMin,
              lte: priceMax,
            }
          : undefined,
      OR: search
        ? [
            { title: { contains: search } },
            { address3: { contains: search } },
          ]
        : undefined,
    },
  });
  const units = data.map((unit: any) => ({
    ...unit,
    outstandingPayment: unit.outstandingPayment
      ? parseFloat(unit.outstandingPayment.toString())
      : null,
    price: unit.price ? parseFloat(unit.price.toString()) : null,
    priceRent: unit.priceRent ? parseFloat(unit.priceRent.toString()) : null,
  }));
  return { units };
};
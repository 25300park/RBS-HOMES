// @/actions/auth.ts
"use server";

// 공통 액션들
import prisma from "@/lib/prisma";
import { compare, hash } from "bcrypt";
import { SignupFormSchema, FormState, LoginFormSchema } from "@/types/schema";

//로그인 회원가입 관련
export async function signup(
  state: FormState,
  formData: FormData
): Promise<FormState> {
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

  const { email, password } = validatedFields.data;

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

  return { status: 200, message: "Signup successful", email, password };
}

export async function login(
  state: FormState,
  formData: FormData
): Promise<FormState> {
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
export const getUnitList = async (
  searchParams: Record<string, string>,
  sellType?: string
): Promise<any> => {
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
  console.log(sellType);
  // 가격과 가격 임대 필터 처리
  const priceFilter =
    priceMin !== undefined || priceMax !== undefined
      ? [
          {
            price: {
              gte: priceMin,
              lte: priceMax,
            },
          },
        ]
      : [];

  // 검색 필터 처리
  const searchFilter = search
    ? [{ title: { contains: search } }, { address3: { contains: search } }]
    : [];

  // 유닛 검색
  const filters = [...priceFilter, ...searchFilter];
  const data = await prisma.unit.findMany({
    where: {
      sellType: sellType ? sellType : undefined,
      bed: bed ? { gte: bed } : undefined,
      bath: bath ? { gte: bath } : undefined,
      parking: parking ? { gte: parking } : undefined,
      address2: city ? { equals: city } : undefined,
      area:
        areaMin !== undefined || areaMax !== undefined
          ? {
              gte: areaMin,
              lte: areaMax,
            }
          : undefined,
      furniture: furniture ? { equals: furniture } : undefined,
      petPolicy: pet ? { equals: pet } : undefined,
      ...(filters.length > 0 && { OR: filters }), // 필터가 있을 때만 OR 사용
    },
  });

  const units = data.map((unit: any) => ({
    ...unit,
    outstandingPayment: unit.outstandingPayment
      ? parseFloat(unit.outstandingPayment.toString())
      : null,
    price: unit.price ? parseFloat(unit.price.toString()) : null,
    amenity: unit.amenity ? JSON.parse(unit.amenity) : [],
    images: unit.images ? JSON.parse(unit.images) : [],
  }));
  return { units };
};

export const getUnitCount = async (
  searchParams: Record<string, string>,
  sellType?: string
): Promise<number> => {
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
  const priceFilter =
    priceMin !== undefined || priceMax !== undefined
      ? [
          {
            price: {
              gte: priceMin,
              lte: priceMax,
            },
          },
        ]
      : [];

  // Search filter
  const searchFilter = search
    ? [{ title: { contains: search } }, { address3: { contains: search } }]
    : [];

  // 유닛의 개수를 카운트하는 함수
  const count = await prisma.unit.count({
    where: {
      sellType: sellType ? { equals: sellType } : undefined,
      type: type ? { equals: type } : undefined,
      bed: bed ? { gte: bed } : undefined,
      bath: bath ? { gte: bath } : undefined,
      parking: parking ? { gte: parking } : undefined,
      address2: city ? { equals: city } : undefined,
      area:
        areaMin !== undefined || areaMax !== undefined
          ? {
              gte: areaMin,
              lte: areaMax,
            }
          : undefined,
      furniture: furniture ? { equals: furniture } : undefined,
      petPolicy: pet ? { equals: pet } : undefined,
      OR:
        [...priceFilter, ...searchFilter].length > 0
          ? [...priceFilter, ...searchFilter]
          : undefined,
    },
  });

  return count;
};

export const getUnitCountOwner = async (
  searchParams: Record<string, string>
): Promise<number> => {
  const type = searchParams.type !== "none" ? searchParams.type : undefined;
  const sellType =
    searchParams.sellType !== "none" ? searchParams.sellType : undefined;
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
  const priceFilter =
    priceMin !== undefined || priceMax !== undefined
      ? [
          {
            price: {
              gte: priceMin,
              lte: priceMax,
            },
          },
        ]
      : [];

  // Search filter
  const searchFilter = search
    ? [{ title: { contains: search } }, { address3: { contains: search } }]
    : [];

  // 유닛의 개수를 카운트하는 함수
  const count = await prisma.unit.count({
    where: {
      sellType: sellType ? { equals: sellType } : undefined,
      type: type ? { equals: type } : undefined,
      bed: bed ? { gte: bed } : undefined,
      bath: bath ? { gte: bath } : undefined,
      parking: parking ? { gte: parking } : undefined,
      address2: city ? { equals: city } : undefined,
      area:
        areaMin !== undefined || areaMax !== undefined
          ? {
              gte: areaMin,
              lte: areaMax,
            }
          : undefined,
      furniture: furniture ? { equals: furniture } : undefined,
      petPolicy: pet ? { equals: pet } : undefined,
      OR:
        [...priceFilter, ...searchFilter].length > 0
          ? [...priceFilter, ...searchFilter]
          : undefined,
    },
  });

  return count;
};

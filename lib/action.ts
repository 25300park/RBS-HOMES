"use server";

import prisma from "@/lib/prisma";
import { compare, hash } from "bcrypt";
import { SignupFormSchema, FormState, LoginFormSchema, contactSchema } from "@/types/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateTemporaryPassword } from "@/lib/utils";
import { sendEmail, getPasswordResetEmailTemplate } from "@/lib/email";
import { headers } from "next/headers";

//비밀번호 찾기
export async function resetPassword(state: FormState, formData: FormData) {
  const email = formData.get("email") as string;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          status: 404,
          message: "No account found with this email address.",
        };
      }

      const tempPassword = generateTemporaryPassword();
      const hashedPassword = await hash(tempPassword, 10);

      // 비밀번호 업데이트
      await tx.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          passwordOrigin: tempPassword,
        },
      });

      // 비밀번호 재설정 로그 생성
      await tx.passwordResetLog.create({
        data: {
          email,
          prevPassword: user.passwordOrigin || '', // 이전 비밀번호
          newPassword: tempPassword,               // 새로운 임시 비밀번호
          ip: formData.get("ip") as string || "unknown", 
        },
      });

      // 이메일 발송
      await sendEmail({
        to: email,
        subject: "RBS HOME - Temporary Password Notice",
        html: getPasswordResetEmailTemplate(tempPassword),
      });

      return {
        status: 200,
        message: "A temporary password has been sent to your email.",
      };
    });

    return result;

  } catch (error) {
    console.error("Reset password error:", error);
    return {
      status: 500,
      message:
        "An error occurred while resetting your password. Please try again.",
    };
  }
}
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

type SortOption = "latest" | "oldest" | "priceAsc" | "priceDesc";

// 필터 헬퍼 함수들
const getSearchFilter = (search?: string) => {
  if (!search) return [];
  return [{ title: { contains: search } }, { address3: { contains: search } }];
};

const getPriceFilter = (priceMin?: number, priceMax?: number) => {
  if (!priceMin && !priceMax) return [];
  return [
    {
      price: {
        gte: priceMin || undefined,
        lte: priceMax || undefined,
      },
    },
  ];
};

const getAmenityFilter = (amenities: string[]) => {
  if (!amenities.length) return undefined;

  return {
    AND: amenities.map((amenity) => ({
      amenity: { contains: amenity },
    })),
  };
};

const parseNumericValue = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
};

export const getUnitList = async (
  searchParams: Record<string, string>
): Promise<any> => {
  try {
    // Parse filter values
    const type = searchParams.type !== "none" ? searchParams.type : undefined;
    
    // activeTypes 파라미터 처리
    const activeTypesArray = searchParams.activeTypes 
      ? searchParams.activeTypes.split(',') 
      : ["rent", "sale", "preSale"];
    
    const bed = parseNumericValue(searchParams.bed);
    const bath = parseNumericValue(searchParams.bath);
    const parking = parseNumericValue(searchParams.parking);
    const city =
      searchParams.city !== "All Cities" ? searchParams.city : undefined;
    const priceMin = parseNumericValue(searchParams.priceMin);
    const priceMax = parseNumericValue(searchParams.priceMax);
    const areaMin = parseNumericValue(searchParams.areaMin);
    const areaMax = parseNumericValue(searchParams.areaMax);
    const furniture =
      searchParams.furniture !== "none" ? searchParams.furniture : undefined;
    const pet = searchParams.pet !== "none" ? searchParams.pet : undefined;
    const search = searchParams.search || undefined;
    const amenities = searchParams.amenities
      ? decodeURIComponent(searchParams.amenities)
          .split(",")
          .map((a) => a.trim())
      : [];

    // Get filters
    const priceFilter = getPriceFilter(priceMin, priceMax);
    const searchFilter = getSearchFilter(search);
    const amenityFilter = getAmenityFilter(amenities);

    // Combine all filters
    const filters = [...priceFilter, ...searchFilter];

    // Get units with filters
    const data = await prisma.unit.findMany({
      where: {
        status: {
          in: [0, 3] 
        },
        // sellType 대신 activeTypes 사용
        sellType: activeTypesArray.length > 0 ? { in: activeTypesArray } : undefined,
        type: type ? { equals: type } : undefined,
        bed: bed ? { gte: bed } : undefined,
        bath: bath ? { gte: bath } : undefined,
        parking: parking ? { gte: parking } : undefined,
        address2: city ? { equals: city } : undefined,
        area:
          areaMin || areaMax
            ? {
                gte: areaMin || undefined,
                lte: areaMax || undefined,
              }
            : undefined,
        furniture: furniture ? { equals: furniture } : undefined,
        petPolicy: pet ? { equals: pet } : undefined,
        ...(filters.length > 0 && { OR: filters }),
        ...amenityFilter, // Add amenity filter
      },
      include: {
        admin: true,
      },
      orderBy: {
        lastUpdate: "desc", // 기본값으로 최신순 정렬
      },
    });

    // Transform the data
    const units = data.map((unit) => ({
      ...unit,
      outstandingPayment: unit.outstandingPayment
        ? parseFloat(unit.outstandingPayment.toString())
        : null,
      price: unit.price ? parseFloat(unit.price.toString()) : null,
      amenity: unit.amenity ? JSON.parse(unit.amenity as string) : [],
      images: unit.images ? JSON.parse(unit.images as string) : [],
    }));

    return { units };
  } catch (error) {
    console.error("Error fetching units:", error);
    throw error;
  }
};

export const getUnitCount = async (
  searchParams: Record<string, string>
): Promise<number> => {
  const type = searchParams.type !== "none" ? searchParams.type : undefined;
  
  // activeTypes 파라미터 처리
  const activeTypesArray = searchParams.activeTypes 
    ? searchParams.activeTypes.split(',') 
    : ["rent", "sale", "preSale"];
  
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
      status: {
        in: [0, 3] 
      },
      // sellType 대신 activeTypes 사용
      sellType: activeTypesArray.length > 0 ? { in: activeTypesArray } : undefined,
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
  const session: any = await getServerSession(authOptions as any);
  const adminId = session.user.id;

  const type = searchParams.type !== "none" ? searchParams.type : undefined;
  
  // activeTypes 파라미터 처리
  const activeTypesArray = searchParams.activeTypes 
    ? searchParams.activeTypes.split(',') 
    : ["rent", "sale", "preSale"];
  
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
      adminId: adminId,
      // sellType 대신 activeTypes 사용
      sellType: activeTypesArray.length > 0 ? { in: activeTypesArray } : undefined,
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

export const ToggleFavoriteUnit = async (unitId: number) => {
  try {
    const session: any = await getServerSession(authOptions as any);
    const userId = session.user.id as number;
    if (!userId || userId === undefined || typeof userId !== "number") {
      return { status: 400, message: "Invalid user" };
    }

    if (!unitId || unitId === undefined || typeof unitId !== "number") {
      return { status: 400, message: "Invalid unit ID" };
    }

    // 즐겨찾기 존재 여부 확인
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_unitId: {
          userId,
          unitId,
        },
      },
    });

    // 존재하면 삭제, 존재하지 않으면 생성
    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
      revalidatePath("/account/unit/favorites");
      return { status: 200, data: { action: "removed" } };
    } else {
      const newFavorite = await prisma.favorite.create({
        data: {
          userId,
          unitId,
        },
      });
      revalidatePath("/account/unit/favorites");
      return { status: 200, data: { action: "added", id: newFavorite.id } };
    }
  } catch (error) {
    console.error("Error Toggling Favorites:", error);
    throw error;
  }
};

export async function sendContactForm(formData: FormData) {
  try {
    // 폼 유효성 검사
    const validatedFields = contactSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
    });

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      let errorMessage = "";
      
      for (const [field, errors] of Object.entries(fieldErrors)) {
        if (errors && errors.length > 0) {
          errorMessage += `${errors.join(', ')} `;
        }
      }
      
      return {
        success: false,
        message: errorMessage.trim(),
        fieldErrors: fieldErrors, // 필드별 오류도 함께 전송
      };
    }

    const { name, email, phone, message } = validatedFields.data;
    
    const headersList = headers();
    const ip = 
      headersList.get('x-forwarded-for')?.split(',')[0] || 
      headersList.get('x-real-ip') || 
      headersList.get('client-ip') ||
      '127.0.0.1'; 
    
    // Save to database
    const newContact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        message,
        ip,
        status: 0, // Unprocessed status
      },
    });
    
    // Success response
    return {
      success: true,
      message: "Your inquiry has been successfully submitted."
    };
  } catch (error) {
    console.error("Contact form submission error:", error);
    return {
      success: false,
      message: "An error occurred while submitting your inquiry. Please try again."
    };
  }
}
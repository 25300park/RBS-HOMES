"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function registerUnit(data: any) {
  try {
    const session: any = await getServerSession(authOptions as any);
    const transformedData = {
      adminId: session.user.id,
      title: data.title,
      type: data.unitType, // 'unitType' -> 'type' (schema에 맞게 수정)
      sellType: data.saleType,
      fullAdress: data.fullAddress, // fullAdress -> fullAddress (타이핑 실수 수정)
      address1: parseInt(data.address1), // 문자열을 정수로 변환
      address2: data.address2,
      address3: data.address3,
      address4: null, // 필요한 경우 추가
      addressSelf: data.addressSelf,
      ownerName: data.ownerName,
      area: parseInt(data.area), // 문자열을 정수로 변환
      floor: parseInt(data.floor), // 문자열을 정수로 변환
      bed: parseInt(data.bed), // 문자열을 정수로 변환
      bath: parseInt(data.bath), // 문자열을 정수로 변환
      parking: parseInt(data.parking), // 문자열을 정수로 변환
      furniture: data.furniture,
      interiored: data.interiored,
      petPolicy: data.petPolicy,
      amenity: JSON.stringify(data.amenity), // 배열을 문자열로 변환 (예: 'Housekeeping, Gym, Spa')
      yearCompletion: data.yearCompletion,
      outstandingPayment: parseFloat(data.outstandingPayment.replace(/,/g, "")), // 쉼표 제거 후 float로 변환
      price: parseFloat(data.price.replace(/,/g, "")), // 쉼표 제거 후 float로 변환
      note: data.note,
      images: JSON.stringify(data.images), // 이미지 배열을 JSON으로 변환하여 저장
      mapinfo: null, // 필요 시 데이터 추가
      latitude: data.latitude,
      longitude: data.longitude,
    };

    const newUnit = await prisma.unit.create({
      data: transformedData, // 클라이언트로부터 받은 데이터를 Prisma에 저장
    });

    // 필요하면 특정 경로를 리빌드하기 위해 캐시를 재검증할 수 있습니다.
    revalidatePath("/account/unit/registration/review");

    return { success: true, message: "uoload successful" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "upload failed" };
  }
}

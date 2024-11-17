"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Decimal } from "@prisma/client/runtime/library";

const formatDecimal = (value: Decimal | null | undefined) => {
  if (!value) return "";
  return value instanceof Decimal
    ? Math.floor(Number(value.toString())).toLocaleString()
    : Math.floor(Number(value)).toLocaleString();
};
export async function getUnitById(unitId: string) {
  try {
    const unit = await prisma.unit.findUnique({
      where: {
        id: parseInt(unitId),
      },
    });

    if (!unit) {
      return null;
    }

    // 데이터 구조 변환
    const formattedUnit = {
      title: unit.title,
      unitType: unit.type,
      saleType: unit.sellType,
      fullAddress: unit.fullAdress,
      address1: unit.address1,
      address2: unit.address2,
      address3: unit.address3,
      address4: unit.address4,
      addressSelf: unit.addressSelf,
      ownerName: unit.ownerName,
      ownerMobile: unit.ownerMobile,
      ownerEmail: unit.ownerEmail,
      area: unit.area,
      floor: unit.floor,
      bed: unit.bed,
      bath: unit.bath,
      parking: unit.parking,
      furniture: unit.furniture,
      interiored: unit.interiored,
      petPolicy: unit.petPolicy,
      amenity: JSON.parse(unit.amenity || "[]"),
      yearCompletion: unit.yearCompletion,
      outstandingPayment: formatDecimal(unit.outstandingPayment),
      price: formatDecimal(unit.price),
      note: unit.note,
      images:
        typeof unit.images === "string"
          ? JSON.parse(unit.images)
          : unit.images || [],
      latitude: unit.latitude,
      longitude: unit.longitude,
      status: unit.status ?? 0, // 기본값 0 (Ongoing)
    };

    return JSON.parse(JSON.stringify(formattedUnit));
  } catch (error) {
    console.error("Error fetching unit:", error);
    return null;
  }
}

export async function updateUnit(unitId: string, data: any) {
  try {
    const session: any = await getServerSession(authOptions as any);

    const transformedData = {
      adminId: session.user.id,
      title: data.title,
      type: data.unitType,
      sellType: data.saleType,
      fullAdress: data.fullAddress,
      address1: parseInt(data.address1),
      address2: data.address2,
      address3: data.address3,
      address4: data.address4,
      addressSelf: data.addressSelf,
      ownerName: data.ownerName,
      ownerMobile: data.ownerMobile,
      ownerEmail: data.ownerEmail,
      area: parseInt(data.area),
      floor: parseInt(data.floor),
      bed: parseInt(data.bed),
      bath: parseInt(data.bath),
      parking: parseInt(data.parking),
      furniture: data.furniture,
      interiored: data.interiored,
      petPolicy: data.petPolicy,
      amenity: JSON.stringify(data.amenity),
      yearCompletion: data.yearCompletion,
      outstandingPayment: data.outstandingPayment
        ? new Decimal(data.outstandingPayment.replace(/,/g, ""))
        : null,
      price: data.price ? new Decimal(data.price.replace(/,/g, "")) : null,
      note: data.note,
      images: JSON.stringify(data.images),
      latitude: data.latitude,
      longitude: data.longitude,
      status: parseInt(data.status), // status를 정수로 변환
      lastUpdate: new Date(),
    };

    const updatedUnit = await prisma.unit.update({
      where: {
        id: parseInt(unitId),
      },
      data: transformedData,
    });

    revalidatePath("/account/unit/my-list");

    return {
      success: true,
      message: "Update successful",
      unit: JSON.parse(JSON.stringify(updatedUnit)),
    };
  } catch (error) {
    console.error("Error updating unit:", error);
    return { success: false, message: "Update failed", error: String(error) };
  }
}

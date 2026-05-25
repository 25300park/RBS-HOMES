"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function registerUnit(data: any) {
  try {
    const session: any = await getServerSession(authOptions as any);
    
    // 유저가 로그인되어 있지 않은 경우
    if (!session || !session.user) {
      return { 
        success: false, 
        message: "Authentication required. Please login to continue." 
      };
    }
    
    if (data.saleType === "presale") {
      const userLevel = session.user.level as number;
      const hasPreSalePermission = [0, 20, 30, 40].includes(userLevel);
      
      if (!hasPreSalePermission) {
        return {
          success: false,
          message: "You don't have permission to register a pre-sale property. Please contact the administrator.",
          permissionDenied: true
        };
      }
    }
    
    const transformedData = {
      adminId: session.user.id,
      title: data.title,
      type: data.unitType, 
      sellType: data.saleType,
      fullAddress: data.fullAddress,          // ← fullAdress 오타 수정
      address1: data.address1 ? String(data.address1) : null,  // ← parseInt 제거
      address2: data.address2,
      address3: data.address3,
      address4: null,
      addressSelf: data.addressSelf,
      ownerName: data.ownerName,
      area: parseInt(data.area),
      floor: parseInt(data.floor),
      bed: parseInt(data.bed),
      bath: parseInt(data.bath),
      parking: parseInt(data.parking),
      furniture: data.furniture,
      interiored: data.interiored,
      petPolicy: data.petPolicy,
      amenity: data.amenity,                  // ← join(",") 제거
      yearCompletion: data.yearCompletion,
      outstandingPayment: parseFloat(data.outstandingPayment?.replace(/,/g, "") || "0"), 
      price: parseFloat(data.price.replace(/,/g, "")), 
      note: data.note,
      images: JSON.stringify(data.images), 
      mapinfo: null,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    await prisma.unit.create({
      data: transformedData, 
    });

    revalidatePath("/account/unit/registration/review");

    return { success: true, message: "Property registration successful" };
  } catch (error) {
    console.error("Error registering unit:", error);
    return { 
      success: false, 
      message: "Registration failed. Please try again or contact support." 
    };
  }
}
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
      type: data.unitType, 
      sellType: data.saleType,
      fullAdress: data.fullAddress, 
      address1: parseInt(data.address1), 
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
      amenity: JSON.stringify(data.amenity),
      yearCompletion: data.yearCompletion,
      outstandingPayment: parseFloat(data.outstandingPayment.replace(/,/g, "")), 
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

    return { success: true, message: "uoload successful" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "upload failed" };
  }
}

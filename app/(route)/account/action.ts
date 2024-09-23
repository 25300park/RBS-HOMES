'use server'

import prisma  from "@/lib/prisma"


export async function submitUnit(data: any) {
  return { messages : "dd"}
  // await prisma.unit.create({
  //   data,
  // });
}
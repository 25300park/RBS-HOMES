'use server'

import prisma from "@/lib/prisma";
import { Unit } from "@prisma/client";

export const getMainUnitList = async (): Promise<any> => {
  const units = await prisma.unit.findMany({
    take : 8,
  });
  // const formattedUnits: Unit[] = units.map((unit:any) => ({
  //   ...unit,
  //   outstanding_payment: unit.outstanding_payment ? parseFloat(unit.outstanding_payment.toString()) : null,
  //   price: unit.price ? parseFloat(unit.price.toString()) : null,
  // }));

  return {  units  };
};

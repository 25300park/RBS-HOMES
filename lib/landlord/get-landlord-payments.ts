import prisma from "@/lib/prisma";

export async function getLandlordPayments(landlordId: number) {
  return prisma.paymentSchedule.findMany({
    where: { contract: { landlordId } },
    include: {
      contract: {
        select: {
          unit: { select: { id: true, title: true, fullAddress: true } },
          tenant: { select: { id: true, name: true, phone: true } },
        },
      },
    },
    orderBy: { dueDate: "desc" },
  });
}

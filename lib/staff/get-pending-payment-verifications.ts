import prisma from "@/lib/prisma";

export async function getPendingPaymentVerifications(unitWhere: Record<string, unknown>) {
  return prisma.paymentSchedule.findMany({
    where: {
      status: "AWAITING_APPROVAL",
      contract: { unit: unitWhere },
    },
    include: {
      contract: {
        select: {
          unit: { select: { id: true, title: true } },
          tenant: { select: { id: true, name: true, phone: true } },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
}

import prisma from "@/lib/prisma";

export async function getTenantPaymentHistory(tenantId: number) {
  return prisma.paymentSchedule.findMany({
    where: { contract: { tenantId } },
    orderBy: { dueDate: "desc" },
  });
}

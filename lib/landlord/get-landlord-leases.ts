import prisma from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";

export async function getLandlordLeaseData(landlordId: number) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const sixtyDaysLater = new Date(now);
  sixtyDaysLater.setDate(now.getDate() + 60);

  const leases = await prisma.leaseContract.findMany({
    where: {
      landlordId,
      status: { in: [ContractStatus.ACTIVE, ContractStatus.EXPIRING_SOON] },
    },
    include: {
      unit: { select: { id: true, title: true, fullAddress: true } },
      tenant: { select: { id: true, name: true, phone: true } },
      paymentSchedules: {
        where: { dueDate: { gte: startOfMonth, lte: endOfMonth } },
        orderBy: { dueDate: "asc" },
        take: 1,
      },
      careRequests: {
        where: {
          status: {
            in: [
              "PENDING",
              "PENDING_OWNER_APPROVAL",
              "SCHEDULED",
              "IN_PROGRESS",
              "AWAITING_TENANT_CONFIRMATION",
            ],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
    orderBy: { endDate: "asc" },
  });

  const expiringLeases = leases.filter((l) => new Date(l.endDate) <= sixtyDaysLater);

  const allCareRequests = leases.flatMap((l) =>
    l.careRequests.map((c) => ({ ...c, unit: l.unit }))
  );

  const paymentSummary = leases.reduce(
    (acc, l) => {
      const p = l.paymentSchedules[0];
      if (p) acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return { leases, expiringLeases, allCareRequests, paymentSummary };
}

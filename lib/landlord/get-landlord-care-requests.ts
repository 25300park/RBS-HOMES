import prisma from "@/lib/prisma";

export async function getLandlordCareRequests(landlordId: number) {
  return prisma.careServiceRequest.findMany({
    where: { contract: { landlordId } },
    include: {
      contract: {
        select: { unit: { select: { id: true, title: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

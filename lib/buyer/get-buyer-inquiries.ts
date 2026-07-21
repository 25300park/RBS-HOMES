import prisma from "@/lib/prisma";

export async function getBuyerInquiries(userId: number) {
  return prisma.contact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

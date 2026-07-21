import prisma from "@/lib/prisma";

export async function getCondoPosts(condoId: number) {
  return prisma.communityPost.findMany({
    where: { condoId },
    include: { author: { select: { name: true } } },
    orderBy: [{ isNotice: "desc" }, { createdAt: "desc" }],
  });
}

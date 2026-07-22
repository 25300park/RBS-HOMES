import prisma from "@/lib/prisma";

const LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

export async function checkRateLimit(
  sessionId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - WINDOW_MS);

  const count = await prisma.chatMessage.count({
    where: {
      role: "user",
      conversation: { sessionId },
      createdAt: { gte: windowStart },
    },
  });

  return { allowed: count < LIMIT, remaining: Math.max(0, LIMIT - count) };
}

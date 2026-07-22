import prisma from "@/lib/prisma";

export async function findOrCreateConversation(sessionId: string, userId: number | null) {
  const existing = await prisma.conversation.findFirst({ where: { sessionId } });

  if (existing) {
    if (userId && existing.userId === null) {
      return prisma.conversation.update({
        where: { id: existing.id },
        data: { userId },
      });
    }
    return existing;
  }

  return prisma.conversation.create({
    data: { sessionId, userId },
  });
}

export async function getConversationHistory(conversationId: number) {
  const messages = await prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });
  return messages;
}

export async function saveMessages(
  conversationId: number,
  userMessage: string,
  assistantMessage: string
) {
  await prisma.chatMessage.createMany({
    data: [
      { conversationId, role: "user", content: userMessage },
      { conversationId, role: "assistant", content: assistantMessage },
    ],
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
}

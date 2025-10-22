'use server'

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * 수신 메시지 목록 조회
 */
export async function getReceivedMessages(page: number = 1, limit: number = 20) {
  try {
    const session: any = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = parseInt(session.user.id);

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            { recipientId: userId },
            {
              group: {
                members: {
                  some: { userId },
                },
              },
            },
          ],
          status: { not: 2 }, // 삭제되지 않은 메시지
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.message.count({
        where: {
          OR: [
            { recipientId: userId },
            {
              group: {
                members: {
                  some: { userId },
                },
              },
            },
          ],
          status: { not: 2 },
        },
      }),
    ]);

    return { success: true, messages, total };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * 발송 메시지 목록 조회
 */
export async function getSentMessages(page: number = 1, limit: number = 20) {
  try {
    const session: any = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = parseInt(session.user.id);

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          senderId: userId,
          status: { not: 2 },
        },
        include: {
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.message.count({
        where: {
          senderId: userId,
          status: { not: 2 },
        },
      }),
    ]);

    return { success: true, messages, total };
  } catch (error) {
    console.error("Error fetching sent messages:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * 메시지 읽음 처리
 */
export async function markMessageAsRead(messageId: number) {
  try {
    const session: any = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = parseInt(session.user.id);

    // 메시지 읽음 처리
    const message = await prisma.message.update({
      where: { id: messageId },
      data: {
        status: 1, // 읽음
        readAt: new Date(),
      },
    });

    // 알림 읽음 처리
    await prisma.notification.update({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/messages");

    return { success: true, message };
  } catch (error) {
    console.error("Error marking message as read:", error);
    return { success: false, error: String(error) };
  }
}

// ==================== 알림 관련 ====================

/**
 * 미읽음 알림 개수 조회
 */
export async function getUnreadNotificationCount() {
  try {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user?.id) {
      return { success: false, count: 0, error: "Unauthorized" };
    }

    const userId = parseInt(session.user.id);

    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return { success: false, count: 0, error: String(error) };
  }
}

/**
 * 사용자 알림 조회
 */
export async function getNotifications(page: number = 1, limit: number = 10) {
  try {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user?.id) {
      return { 
        success: false, 
        notifications: [], 
        total: 0,
        error: "Unauthorized" 
      };
    }

    const userId = parseInt(session.user.id);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId, isRead: false },
        include: {
          message: {
            select: {
              id: true,
              title: true,
              content: true,
              type: true,
              priority: true,
              sentAt: true,
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return { 
      success: true, 
      notifications: notifications || [], 
      total 
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { 
      success: false, 
      notifications: [], 
      total: 0,
      error: String(error) 
    };
  }
}

/**
 * 알림 읽음 처리
 */
export async function markNotificationAsRead(notificationId: number) {
  try {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * 모든 알림 읽음 처리
 */
export async function markAllNotificationsAsRead() {
  try {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = parseInt(session.user.id);

    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true, updated: result.count };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: String(error) };
  }
}
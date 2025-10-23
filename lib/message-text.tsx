'use server'

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ==================== 메시지 템플릿 관련 ====================

/**
 * 메시지 템플릿 생성
 */
export async function createMessageTemplate(data: {
  name: string;
  title: string;
  content: string;
  description?: string;
  type?: number;
}) {
  try {
    const session: any = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const template = await prisma.messageTemplate.create({
      data: {
        name: data.name,
        title: data.title,
        content: data.content,
        description: data.description,
        type: data.type || 0,
        createdBy: parseInt(session.user.id),
      },
    });

    return { success: true, template };
  } catch (error) {
    console.error("Error creating template:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * 메시지 템플릿 목록 조회
 */
export async function getMessageTemplates() {
  try {
    const templates = await prisma.messageTemplate.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        type: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, templates };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return { success: false, error: String(error) };
  }
}

// ==================== 메시지 그룹 관련 ====================

/**
 * 메시지 그룹 생성
 */
export async function createMessageGroup(data: {
  name: string;
  description?: string;
  memberIds: number[];
}) {
  try {
    const session: any = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = parseInt(session.user.id);

    const group = await prisma.messageGroup.create({
      data: {
        name: data.name,
        description: data.description,
        createdBy: userId,
        members: {
          createMany: {
            data: [
              // 생성자 자동 추가
              { userId },
              // 선택된 멤버들 추가
              ...data.memberIds.map(id => ({ userId: id })),
            ],
            skipDuplicates: true,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return { success: true, group };
  } catch (error) {
    console.error("Error creating group:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * 사용자의 메시지 그룹 목록 조회
 */
export async function getUserMessageGroups() {
  try {
    const session: any = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = parseInt(session.user.id);

    const groups = await prisma.messageGroup.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, groups };
  } catch (error) {
    console.error("Error fetching groups:", error);
    return { success: false, error: String(error) };
  }
}

// ==================== 메시지 관련 ====================

/**
 * 1:1 메시지 발송
 */
export async function sendDirectMessage(data: {
  recipientId: number;
  title: string;
  content: string;
  type?: number;
  unitId?: number;
  priority?: number;
  templateId?: number;
}) {
  try {
    const session: any = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const senderId = parseInt(session.user.id);

    // 메시지 생성
    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId: data.recipientId,
        title: data.title,
        content: data.content,
        type: data.type || 0,
        unitId: data.unitId,
        priority: data.priority || 0,
        templateId: data.templateId,
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
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 수신자에게 알림 생성
    await prisma.notification.create({
      data: {
        messageId: message.id,
        userId: data.recipientId,
        type: data.type || 0,
      },
    });

    revalidatePath("/messages");

    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * 그룹 메시지 발송
 */
export async function sendGroupMessage(data: {
  groupId: number;
  title: string;
  content: string;
  type?: number;
  priority?: number;
  templateId?: number;
}) {
  try {
    const session: any = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const senderId = parseInt(session.user.id);

    // 메시지 생성
    const message = await prisma.message.create({
      data: {
        senderId,
        groupId: data.groupId,
        title: data.title,
        content: data.content,
        type: data.type || 0,
        priority: data.priority || 0,
        templateId: data.templateId,
      },
    });

    // 그룹 멤버 조회
    const members = await prisma.messageGroupMember.findMany({
      where: { groupId: data.groupId },
      select: { userId: true },
    });

    // 각 멤버에게 알림 생성 (발신자 제외)
    await prisma.notification.createMany({
      data: members
        .filter(m => m.userId !== senderId)
        .map(m => ({
          messageId: message.id,
          userId: m.userId,
          type: data.type || 0,
        })),
      skipDuplicates: true,
    });

    revalidatePath("/messages");

    return { success: true, message };
  } catch (error) {
    console.error("Error sending group message:", error);
    return { success: false, error: String(error) };
  }
}

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
 * 사용자 알림 조회
 */
export async function getNotifications(page: number = 1, limit: number = 20) {
  try {
    const session: any = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = parseInt(session.user.id);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { success: true, notifications, total, unreadCount };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: String(error) };
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

    revalidatePath("/messages");

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

    revalidatePath("/messages");

    return { success: true, updated: result.count };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * 미읽음 알림 개수
 */
export async function getUnreadNotificationCount() {
  try {
    const session: any = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = parseInt(session.user.id);

    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return { success: false, error: String(error) };
  }
}
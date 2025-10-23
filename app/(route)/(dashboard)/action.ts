
"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
export async function getFeaturedUnits() {
  try {
    const featuredData = await prisma.featuredUnit.findMany({
      where: {
        OR: [
          { endDate: null },
          { endDate: { gt: new Date() } }
        ]
      },
      orderBy: {
        order: 'asc'
      },
      select: {
        unitId: true,
        label: true,
        description: true
      }
    });

    const featuredUnits = featuredData.length > 0 ? await prisma.unit.findMany({
      where: {
        id: {
          in: featuredData.map(f => f.unitId)
        }
      },
      include: {
        admin: true
      }
    }) : [];

    return featuredUnits.map(unit => ({
      ...unit,
      price: unit.price?.toNumber(),
      outstandingPayment: unit.outstandingPayment?.toNumber(),
      featured: featuredData.find(f => f.unitId === unit.id)
    }));

  } catch (error) {
    console.error('Failed to fetch featured units:', error);
    return [];
  }
}

export async function getActivePopups() {
  try {
    const now = new Date();
    
    const popups = await prisma.popup.findMany({
      where: {
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: now } },
              { endDate: { gte: now } }
            ]
          },
          {
            AND: [
              { startDate: null },
              { endDate: null }
            ]
          },
          {
            AND: [
              { startDate: { lte: now } },
              { endDate: null }
            ]
          },
          {
            AND: [
              { startDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      orderBy: {
        priority: 'asc'
      },
      select: {
        id: true,
        title: true,
        content: true,
        popupType: true,
        triggerType: true,
        triggerValue: true,
        targetAudience: true,
        showFrequency: true,
        useOverlay: true,
        buttonText: true,
        buttonAction: true,
        images: true,
        priority: true,
      }
    });

    return {
      success: true,
      popups,
    };
  } catch (error) {
    console.error('Failed to fetch active popups:', error);
    return {
      success: false,
      popups: [],
      error: 'Failed to fetch popups',
    };
  }
}
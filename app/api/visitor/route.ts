import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const body = await request.json();

    // 최근 방문 기록이 있는지 확인 (1분 이내)
    const recentVisit = await prisma.siteVisitorLog.findFirst({
      where: {
        sessionId: body.sessionId,
        visitStart: {
          gte: new Date(Date.now() - 60 * 1000) // 1분 이내
        }
      }
    });

    if (recentVisit) {
      return NextResponse.json({ success: true, existing: true });
    }

    await prisma.siteVisitorLog.create({
      data: {
        sessionId: body.sessionId,
        ip,
        userAgent: body.userAgent,
        path: body.path,
        isLoggedIn: body.isLoggedIn,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording visitor:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
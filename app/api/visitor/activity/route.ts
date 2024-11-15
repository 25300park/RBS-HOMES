import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma  from '@/lib/prisma';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await prisma.siteVisitorLog.updateMany({
      where: {
        sessionId: body.sessionId,
        visitEnd: null,
      },
      data: {
        lastActive: new Date(),
        path: body.path,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}
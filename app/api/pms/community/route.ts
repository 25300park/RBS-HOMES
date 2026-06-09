export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const condoId = searchParams.get("condoId");

    if (!condoId) {
      return NextResponse.json({ error: "condoId is required" }, { status: 400 });
    }

    const posts = await prisma.communityPost.findMany({
      where: { condoId: Number(condoId) },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
      orderBy: [
        { isNotice: "desc" }, // 공지 먼저
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[GET /api/pms/community]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorId = Number(session.user.id);
    const level = Number(session.user.level ?? 1);

    // level 0~5 모두 작성 가능
    if (level > 5) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { condoId, title, body: postBody, isNotice } = body;

    if (!condoId || !title || !postBody) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // isNotice는 level 0(admin)만 true로 설정 가능
    const resolvedIsNotice = level === 0 ? Boolean(isNotice) : false;

    const post = await prisma.communityPost.create({
      data: {
        condoId: Number(condoId),
        authorId,
        title,
        body: postBody,
        isNotice: resolvedIsNotice,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/pms/community]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

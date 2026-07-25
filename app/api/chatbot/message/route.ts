import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { handleMessage } from "@/lib/chatbot/handle-message";

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions as any);
  const userId = session?.user?.id ? Number(session.user.id) : null;

  const { sessionId, message } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  try {
    const { replyText, units, rateLimited } = await handleMessage({
      sessionId,
      message,
      userId,
    });

    if (rateLimited) {
      return NextResponse.json({ reply: replyText, units: [], rateLimited: true });
    }

    return NextResponse.json({ reply: replyText, units });
  } catch (err) {
    console.error("Chatbot error:", err);
    return NextResponse.json(
      {
        error: "Failed to process message",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

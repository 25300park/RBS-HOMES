import { NextRequest, NextResponse } from "next/server";
import { handleMessage } from "@/lib/chatbot/handle-message";

export async function POST(
  req: NextRequest,
  { params }: { params: { secret: string } }
) {
  // 웹훅 보호: secret이 일치하지 않으면 카카오 포맷 그대로 401 반환
  if (params.secret !== process.env.KAKAO_SKILL_SECRET) {
    return NextResponse.json(
      {
        version: "2.0",
        template: { outputs: [{ simpleText: { text: "인증에 실패했습니다." } }] },
      },
      { status: 401 }
    );
  }

  const body = await req.json();

  const utterance: string = body?.userRequest?.utterance ?? "";
  const kakaoUserId: string = body?.userRequest?.user?.id ?? "";

  if (!utterance || !kakaoUserId) {
    return NextResponse.json(
      { error: "Invalid Kakao skill request" },
      { status: 400 }
    );
  }

  // 웹 세션과 구분되는 카카오 세션 키
  const sessionId = `kakao:${kakaoUserId}`;

  try {
    const { replyText } = await handleMessage({ sessionId, message: utterance });

    // 카카오 스킬 응답 포맷 (v2)
    return NextResponse.json({
      version: "2.0",
      template: {
        outputs: [
          { simpleText: { text: replyText || "죄송합니다, 응답을 생성하지 못했습니다." } },
        ],
      },
    });
  } catch (err) {
    console.error("Kakao chatbot error:", err);
    // 카카오는 오류 시에도 스킬 응답 포맷으로 반환해야 함
    return NextResponse.json({
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            },
          },
        ],
      },
    });
  }
}
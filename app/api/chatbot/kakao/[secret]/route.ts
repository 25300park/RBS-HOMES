import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
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
  const callbackUrl: string | undefined = body?.userRequest?.callbackUrl;

  if (!utterance || !kakaoUserId) {
    return NextResponse.json(
      { error: "Invalid Kakao skill request" },
      { status: 400 }
    );
  }

  // 웹 세션과 구분되는 카카오 세션 키
  const sessionId = `kakao:${kakaoUserId}`;

  // 콜백 URL이 있는 경우: 즉시 임시 응답 + 백그라운드 처리 후 콜백 전송
  if (callbackUrl) {
    waitUntil(processInBackground(sessionId, utterance, callbackUrl));

    return NextResponse.json({
      version: "2.0",
      useCallback: true,
      data: {
        text: "매물을 찾고 있어요, 잠시만 기다려주세요 🔍",
      },
    });
  }

  // 콜백이 없는 경우: 기존 동기 방식 (로컬/EC2 테스트 등 하위 호환)
  try {
    const { replyText } = await handleMessage({ sessionId, message: utterance });

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

async function processInBackground(
  sessionId: string,
  utterance: string,
  callbackUrl: string
) {
  let replyText: string;

  try {
    const result = await handleMessage({ sessionId, message: utterance });
    replyText = result.replyText || "죄송합니다, 응답을 생성하지 못했습니다.";
  } catch (err) {
    console.error("Kakao chatbot background error:", err);
    replyText = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }

  try {
    await fetch(callbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version: "2.0",
        template: {
          outputs: [{ simpleText: { text: replyText } }],
        },
      }),
    });
  } catch (err) {
    console.error("Kakao callback send failed:", err);
  }
}
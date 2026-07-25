import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { handleMessage } from "@/lib/chatbot/handle-message";

export const maxDuration = 60;

// 카카오 listCard / simpleText outputs 생성 (동기·비동기 두 경로 공용)
function buildKakaoOutputs(replyText: string, units: any[]): any[] {
  const makeItems = (list: any[]) =>
    list.map((u) => {
      const parts = [
        u.price ? `₱ ${Number(u.price).toLocaleString()}` : null,
        u.bed != null ? `${u.bed}BR` : null,
        u.area ? `${u.area}㎡` : null,
      ].filter(Boolean);

      return {
        title: u.title,
        description: parts.join(" · ") || u.type,
        link: { web: `https://rbs-homes.com${u.url}` },
      };
    });

  const moreButton = [
    {
      label: "웹사이트에서 더 보기",
      action: "webLink",
      webLinkUrl: "https://rbs-homes.com/list",
    },
  ];

  if (units.length >= 1 && units.length <= 5) {
    return [
      {
        listCard: {
          header: { title: "검색된 매물" },
          items: makeItems(units),
          buttons: moreButton,
        },
      },
    ];
  }

  // units 0개(일반 답변) 또는 6개 이상(AI 되묻기) 모두 replyText 그대로
  return [
    { simpleText: { text: replyText || "죄송합니다, 응답을 생성하지 못했습니다." } },
  ];
}

export async function POST(
  req: NextRequest,
  { params }: { params: { secret: string } }
) {
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

  // 콜백 없는 동기 경로
  try {
    const { replyText, units } = await handleMessage({ sessionId, message: utterance });

    return NextResponse.json({
      version: "2.0",
      template: { outputs: buildKakaoOutputs(replyText, units) },
    });
  } catch (err) {
    console.error("Kakao chatbot error:", err);
    return NextResponse.json({
      version: "2.0",
      template: {
        outputs: [
          { simpleText: { text: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요." } },
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
  let outputs: any[];

  try {
    const { replyText, units } = await handleMessage({ sessionId, message: utterance });
    outputs = buildKakaoOutputs(replyText, units);
  } catch (err) {
    console.error("Kakao chatbot background error:", err);
    outputs = [
      { simpleText: { text: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요." } },
    ];
  }

  try {
    await fetch(callbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version: "2.0",
        template: { outputs },
      }),
    });
  } catch (err) {
    console.error("Kakao callback send failed:", err);
  }
}

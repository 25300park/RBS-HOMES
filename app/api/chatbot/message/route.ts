import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  findOrCreateConversation,
  getConversationHistory,
  saveMessages,
} from "@/lib/chatbot/conversation";
import { searchUnitsForChat } from "@/lib/chatbot/search-units-tool";

const SYSTEM_PROMPT =
  "당신은 RBS HOMES 부동산 플랫폼의 친절한 AI 상담사입니다. " +
  "RBS HOMES는 필리핀 마닐라 메트로 지역(BGC, Makati, Ortigas 등)의 콘도, 빌라, 아파트, 토지 등 " +
  "다양한 매물을 임대(rent) 및 매매(sale)로 중개하는 플랫폼입니다. " +
  "고객이 매물 검색, 임대/매매 절차, 투어 예약 등에 대해 물어보면 친절하게 안내하세요. " +
  "임대 절차: 매물 선택 → 투어 예약 → 계약서 작성 → 입주. " +
  "매매 절차: 매물 선택 → 투어 예약 → 가격 협의 → 계약 및 소유권 이전. " +
  "투어 예약은 매물 상세 페이지에서 신청할 수 있습니다. " +
  "고객이 특정 매물을 찾고 싶다고 하면 search_units 도구를 사용해 실제 매물을 검색하세요. " +
  "모르는 내용은 모른다고 솔직하게 답하고, 자세한 상담은 담당자에게 문의하도록 안내하세요. " +
  "항상 한국어로 응답하되, 고객이 영어로 물어보면 영어로 답하세요.";

const SEARCH_UNITS_TOOL = {
  name: "search_units",
  description:
    "RBS HOMES 플랫폼에서 조건에 맞는 매물을 검색합니다. 고객이 특정 지역, 유형, 가격대의 매물을 원할 때 사용하세요.",
  input_schema: {
    type: "object",
    properties: {
      area: {
        type: "string",
        description: "검색할 지역명 또는 키워드 (예: BGC, Makati, Ortigas)",
      },
      type: {
        type: "string",
        enum: ["condo", "village", "apartment", "land", "etc"],
        description: "매물 유형",
      },
      sellType: {
        type: "string",
        enum: ["rent", "sale"],
        description: "거래 유형: rent(임대) 또는 sale(매매)",
      },
      priceMax: {
        type: "string",
        description: "최대 가격 (숫자만, 예: 50000)",
      },
      bed: {
        type: "string",
        description: "최소 침실 개수 (숫자만, 예: 2)",
      },
    },
  },
};

async function callAnthropic(messages: any[]) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [SEARCH_UNITS_TOOL],
      tool_choice: { type: "auto" },
      messages,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Anthropic API error: ${errBody}`);
  }

  return res.json();
}

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions as any);
  const userId = session?.user?.id ? Number(session.user.id) : null;

  const { sessionId, message } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  try {
    const conversation = await findOrCreateConversation(sessionId, userId);
    const history = await getConversationHistory(conversation.id);

    const messages: any[] = [
      ...history,
      { role: "user", content: message },
    ];

    // 1차 Anthropic 호출
    const firstData = await callAnthropic(messages);

    let replyText = "";
    let units: any[] = [];

    const toolUseBlock = firstData.content?.find(
      (block: any) => block.type === "tool_use" && block.name === "search_units"
    );

    if (toolUseBlock) {
      // 매물 검색 실행
      units = await searchUnitsForChat(toolUseBlock.input);

      // 2차 Anthropic 호출 (tool_result 포함)
      const messagesWithResult: any[] = [
        ...messages,
        { role: "assistant", content: firstData.content },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUseBlock.id,
              content: JSON.stringify(units),
            },
          ],
        },
      ];

      const secondData = await callAnthropic(messagesWithResult);
      const textBlock = secondData.content?.find(
        (block: any) => block.type === "text"
      );
      replyText = textBlock?.text ?? "";
    } else {
      const textBlock = firstData.content?.find(
        (block: any) => block.type === "text"
      );
      replyText = textBlock?.text ?? "";
    }

    // 대화 저장 (best-effort — 실패해도 응답은 반환)
    await saveMessages(conversation.id, message, replyText).catch((err) => {
      console.error("Failed to save chat messages:", err);
    });

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

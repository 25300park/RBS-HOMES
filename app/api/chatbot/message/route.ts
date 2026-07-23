import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  findOrCreateConversation,
  getConversationHistory,
  saveMessages,
} from "@/lib/chatbot/conversation";
import { searchUnitsForChat } from "@/lib/chatbot/search-units-tool";
import { checkRateLimit } from "@/lib/chatbot/rate-limit";

const SYSTEM_PROMPT =
  "You are a friendly AI assistant for RBS HOMES, a real estate platform in Metro Manila, Philippines. " +
  "RBS HOMES is currently condo-focused, with other property types (village, apartment, land, etc.) coming later. " +
  "Users can:\n" +
  "- Rent: browse listings, request a property tour, sign a lease once approved.\n" +
  "- Buy: browse listings for sale, contact agents for inquiries.\n" +
  "- List a property: landlords, sellers, and agents can register listings on the platform.\n\n" +
  "Tour requests: Users click 'Schedule a Tour' on any listing page. No account is required to request a tour. " +
  "The listing's agent will confirm or decline; the user will be notified by email " +
  "(or in their account's Schedule tab if logged in).\n\n" +
  "Property management (for landlords/tenants): logged-in landlords and tenants have a dashboard to track " +
  "leases, payments, and maintenance/care requests (e.g. AC cleaning, repairs).\n\n" +
  "If you don't know the answer to something, say so honestly and suggest the user contact RBS Homes at " +
  "maymrhomes082023@gmail.com, rather than guessing.\n\n" +
  "When a customer wants to find specific listings, use the search_units tool to search real listings. " +
  "Always respond in English by default. If the customer writes in Korean, you may respond in Korean instead.";

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

    const { allowed } = await checkRateLimit(sessionId);
    if (!allowed) {
      return NextResponse.json({
        reply: "죄송합니다, 메시지를 너무 많이 보내셨어요. 잠시 후 다시 시도해주세요.",
        units: [],
        rateLimited: true,
      });
    }

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

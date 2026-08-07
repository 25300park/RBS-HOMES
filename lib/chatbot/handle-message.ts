import {
  findOrCreateConversation,
  getConversationHistory,
  saveMessages,
} from "@/lib/chatbot/conversation";
import { searchUnitsForChat } from "@/lib/chatbot/search-units-tool";
import { checkRateLimit } from "@/lib/chatbot/rate-limit";
import { SEARCH_UNITS_TOOL } from "@/lib/ai-search/search-units-schema";

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
  "Always respond in English by default. If the customer writes in Korean, you may respond in Korean instead.\n\n" +
  "CRITICAL RULE — follow these steps every time after calling search_units, before writing any reply:\n" +
  "1. Count the number of items in the tool result array.\n" +
  "2. If the count is 6 or more: your ENTIRE reply must be ONLY 1–2 short clarifying questions. " +
  "Choose from: budget (maximum rent or price), preferred building or development name, floor preference or view, preferred move-in date. " +
  "Do NOT mention, summarize, or list any specific property in this case — not even one example.\n" +
  "3. If the count is 5 or fewer: present them as a short list.\n" +
  "4. Exception: if the user's message explicitly says '다 보여줘', 'show all', or 'just show me anything', skip step 2 and list the top 5.\n\n" +
  "RULE — always include property links:\n" +
  "Whenever you mention a specific property by name, price, or details " +
  "(in any language, any format — bullet list, table, or prose), you MUST " +
  "include its link in markdown format: [View listing](/properties/xxx) " +
  "or [매물 보기](/properties/xxx). Never mention a specific property " +
  "without its link. Do NOT use markdown tables to present listings — " +
  "use a bulleted list instead, one property per bullet, each with its link.\n\n" +
  "RULE — always re-fetch for follow-up questions:\n" +
  "When the user asks a follow-up or refinement question about specific listings (e.g. narrowing by bedroom count, budget, or a specific building), " +
  "you MUST call search_units again with the updated criteria — even if you already mentioned a similar property earlier in this conversation. " +
  "Never answer specific listing details (price, size, availability) from memory of earlier turns; always fetch fresh data via the tool.\n\n" +
  "RULE — 0-result retry before giving up:\n" +
  "When search_units returns 0 results and you used the 'keyword' parameter, do NOT immediately tell the user nothing was found. " +
  "Instead, retry with a broader keyword before giving up:\n" +
  "1. First retry: drop trailing numbers or unit-type words from keyword (e.g. 'Verve 1' → 'Verve').\n" +
  "2. If still 0 results, retry with just the most distinctive word (the proper noun / brand name), " +
  "dropping generic words like 'tower', 'residences', 'building', numbers.\n" +
  "3. If a retry succeeds, mention to the user that you searched more broadly " +
  "(e.g. '정확히 일치하는 이름은 없었지만, Verve 관련 매물을 찾아봤어요') so they know it is not an exact name match.\n" +
  "4. Only after all retries fail, tell the user no listings were found and suggest they contact maymrhomes082023@gmail.com.";


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

export interface HandleMessageResult {
  replyText: string;
  units: any[];
  rateLimited: boolean;
}

const MAX_TOOL_ROUNDS = 5;

export async function handleMessage({
  sessionId,
  message,
  userId = null,
}: {
  sessionId: string;
  message: string;
  userId?: number | null;
}): Promise<HandleMessageResult> {
  const conversation = await findOrCreateConversation(sessionId, userId);

  const { allowed } = await checkRateLimit(sessionId);
  if (!allowed) {
    return {
      replyText:
        "죄송합니다, 메시지를 너무 많이 보내셨어요. 잠시 후 다시 시도해주세요.",
      units: [],
      rateLimited: true,
    };
  }

  const history = await getConversationHistory(conversation.id);
  const messages: any[] = [...history, { role: "user", content: message }];

  let replyText = "";
  let units: any[] = [];
  let round = 0;

  // 최대 MAX_TOOL_ROUNDS 회 tool_use 왕복 허용 (0건 재시도 등)
  while (round < MAX_TOOL_ROUNDS) {
    const data = await callAnthropic(messages);
    round++;

    const toolUseBlock = data.content?.find(
      (block: any) => block.type === "tool_use" && block.name === "search_units"
    );

    if (!toolUseBlock) {
      // tool_use 없음 — 최종 텍스트 응답
      const textBlock = data.content?.find((block: any) => block.type === "text");
      replyText = textBlock?.text ?? "";
      break;
    }

    // tool_use 실행 후 결과를 메시지 체인에 추가하고 루프 계속
    const searchResult = await searchUnitsForChat(toolUseBlock.input);
    // 마지막 검색 결과를 units로 유지 (listCard 렌더 기준)
    units = searchResult;

    messages.push({ role: "assistant", content: data.content });
    messages.push({
      role: "user",
      content: [
        {
          type: "tool_result",
          tool_use_id: toolUseBlock.id,
          content: JSON.stringify(searchResult),
        },
      ],
    });
  }

  // replyText에서 AI가 실제로 언급한 /properties/... URL만 추출해 카드와 일치시킴
  const mentionedUrls: string[] = replyText.match(/\/properties\/[^)\s"]+/g) ?? [];
  const finalUnits = mentionedUrls.length > 0
    ? units.filter((u) => mentionedUrls.includes(u.url))
    : (units.length >= 1 && units.length <= 5 ? units : []);

  await saveMessages(conversation.id, message, replyText).catch((err) => {
    console.error("Failed to save chat messages:", err);
  });

  return { replyText, units: finalUnits, rateLimited: false };
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const TOOL_NAME = "extract_listing_info";

const TOOL_DEFINITION = {
  name: TOOL_NAME,
  description: "부동산 매물 텍스트에서 구조화된 정보를 추출한다.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: ["string", "null"], description: "매물 제목 또는 이름" },
      ownerName: { type: ["string", "null"], description: "집주인/소유자 이름" },
      price: { type: ["string", "null"], description: "가격 (숫자만, 확신 없으면 null)" },
      saleType: {
        type: ["string", "null"],
        enum: ["rent", "sale", null],
        description: "거래 유형: rent(임대) 또는 sale(매매). 불분명하면 null.",
      },
      unitType: {
        type: ["string", "null"],
        enum: ["condo", "village", "apartment", "land", "etc", null],
        description: "매물 유형: condo/village/apartment/land/etc 중 하나. 불분명하면 null.",
      },
      ownerEmail: { type: ["string", "null"], description: "소유자 이메일" },
      ownerMobile: { type: ["string", "null"], description: "소유자 휴대폰 번호" },
      area: { type: ["string", "null"], description: "전용면적, 숫자만 (예: 50)" },
      floor: { type: ["string", "null"], description: "층수 (예: 43)" },
      bed: { type: ["string", "null"], description: "침실 개수, 숫자 (예: 2)" },
      bath: { type: ["string", "null"], description: "화장실 개수, 숫자 (예: 1)" },
      parking: { type: ["string", "null"], description: "주차 대수, 숫자 (예: 1)" },
      furniture: {
        type: ["string", "null"],
        enum: ["none", "fully", "semi", "unfurnished", null],
        description: "가구 상태. 이 4개 값 중 하나만, 애매하면 null.",
      },
      interiored: {
        type: ["string", "null"],
        enum: ["Interiored", "Non Interiored", null],
        description: "인테리어 여부. 이 2개 값 중 하나만, 애매하면 null.",
      },
      petPolicy: {
        type: ["string", "null"],
        enum: ["none", "Allow", "Small Only", "Not allowed", null],
        description: "반려동물 정책. 이 4개 값 중 하나만, 애매하면 null.",
      },
      yearCompletion: { type: ["string", "null"], description: "완공연도 (예: 2020)" },
      outstandingPayment: { type: ["string", "null"], description: "미납금, 숫자만" },
      amenity: {
        type: ["array", "null"],
        items: { type: "string" },
        description:
          "언급된 편의시설만. 반드시 다음 목록의 정확한 문자열만 사용: Gym, Pool, Pet, 24/7 Security, Garden, High Ceiling, Playroom, Jogging, Ocean View, Mountain View, Large Windows, Soundproof, Sauna, Concierge, Library, Retail. 목록에 없는 건 절대 넣지 말 것. 언급 없으면 빈 배열이나 null.",
      },
    },
    required: [
      "title", "ownerName", "price", "saleType", "unitType", "ownerEmail", "ownerMobile",
      "area", "floor", "bed", "bath", "parking", "furniture", "interiored",
      "petPolicy", "yearCompletion", "outstandingPayment", "amenity",
    ],
  },
};

const SYSTEM_PROMPT =
  "당신은 부동산 매물 정보 추출 전문가입니다. " +
  "확신이 없는 필드는 반드시 null로 반환하세요. " +
  "saleType은 반드시 'rent' 또는 'sale' 중 하나만 사용하고, 애매하면 null로 반환하세요. " +
  "unitType은 반드시 'condo', 'village', 'apartment', 'land', 'etc' 중 하나만 사용하고, 애매하면 null로 반환하세요. " +
  "주소, 위치 좌표, 상세 주소는 절대 추출하지 마세요 (별도 방식으로 입력됩니다). " +
  "amenity는 반드시 주어진 목록의 값만 사용하고, 목록에 없는 편의시설은 절대 만들어내지 마세요.";

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
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
        tools: [TOOL_DEFINITION],
        tool_choice: { type: "tool", name: TOOL_NAME },
        messages: [
          {
            role: "user",
            content: `다음 텍스트에서 매물 정보를 추출해주세요:\n\n${text}`,
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      return NextResponse.json(
        { error: "Anthropic API error", detail: errBody },
        { status: 500 }
      );
    }

    const data = await anthropicRes.json();
    const toolBlock = data.content?.find(
      (block: any) => block.type === "tool_use" && block.name === TOOL_NAME
    );

    if (!toolBlock) {
      return NextResponse.json({ error: "No tool_use block in response" }, { status: 500 });
    }

    return NextResponse.json(toolBlock.input);
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

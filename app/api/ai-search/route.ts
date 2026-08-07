import { NextRequest, NextResponse } from "next/server";
import { SEARCH_UNITS_TOOL } from "@/lib/ai-search/search-units-schema";

const AI_SEARCH_SYSTEM =
  "사용자의 자연어 부동산 검색 요청에서 검색 파라미터를 추출하라. " +
  "반드시 search_units 도구를 호출하라. 대화하지 말고 파라미터 추출만 하라.";

interface SearchInput {
  area?: string;
  type?: string;
  sellType?: string;
  priceMax?: string;
  bed?: string;
  keyword?: string;
}

// TODO(backlog): rate limit — 현재 미적용. 트래픽 증가 시 IP 기준(x-forwarded-for)으로 추가 검토.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query: string = typeof body?.query === "string" ? body.query.trim() : "";

    if (!query) {
      return NextResponse.json({ redirectUrl: "/list" });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        system: AI_SEARCH_SYSTEM,
        tools: [SEARCH_UNITS_TOOL],
        // 대화 없이 반드시 search_units 파라미터 추출만 하도록 강제
        tool_choice: { type: "tool", name: "search_units" },
        messages: [{ role: "user", content: query }],
      }),
    });

    if (!res.ok) {
      console.error("[ai-search] Anthropic error:", await res.text());
      return NextResponse.json({ redirectUrl: "/list" });
    }

    const data = await res.json();
    const toolUse = data.content?.find(
      (b: any) => b.type === "tool_use" && b.name === "search_units"
    );

    if (!toolUse?.input) {
      return NextResponse.json({ redirectUrl: "/list" });
    }

    const input = toolUse.input as SearchInput;
    const params = new URLSearchParams();

    // keyword(건물명 정밀 매칭)와 area(지역명 폭넓은 매칭) 별도 파라미터로 분리
    if (input.keyword) {
      params.set("keyword", input.keyword);
    } else if (input.area) {
      params.set("search", input.area);
    }

    // type (condo/village/…), "etc"는 의미 없으므로 제외
    if (input.type && input.type !== "etc") params.set("type", input.type);

    // sellType → activeTypes (get-filtered-units는 activeTypes를 읽음)
    if (input.sellType) params.set("activeTypes", input.sellType);

    // priceMax, bed
    if (input.priceMax) params.set("priceMax", input.priceMax);
    if (input.bed) params.set("bed", input.bed);

    const redirectUrl = params.toString() ? `/list?${params.toString()}` : "/list";
    return NextResponse.json({ redirectUrl });
  } catch (err) {
    console.error("[ai-search] route error:", err);
    return NextResponse.json({ redirectUrl: "/list" });
  }
}

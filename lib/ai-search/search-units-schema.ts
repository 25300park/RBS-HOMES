/**
 * SEARCH_UNITS_TOOL — Anthropic tool 스키마 공용 모듈
 *
 * 카카오 챗봇(lib/chatbot/handle-message.ts)과
 * AI 검색 API(app/api/ai-search/route.ts)에서 공통으로 재사용.
 */
export const SEARCH_UNITS_TOOL = {
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
        description:
          '침실 개수 (숫자만). 스튜디오/원룸은 0으로 지정 (예: 스튜디오 → "0", 침실 2개 → "2")',
      },
      keyword: {
        type: "string",
        description:
          "특정 단지명/건물명 검색 키워드 (예: Fort Palm Spring, Serendra). 사용자가 구체적인 건물 이름을 언급했을 때만 사용.",
      },
    },
  },
};

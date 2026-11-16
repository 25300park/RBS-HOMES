import { describe, it, expect, vi, beforeEach } from "vitest";

// 설치된 react(18.3.1)의 공개 CJS 진입점에는 cache가 없다 — Next.js 빌드가
// "react-server" export 조건으로 번들링할 때만 제공되는 조건부 export라서,
// 실제로는 `npx next build`로 이미 확인했다(아래 완료 보고 참고). vitest는
// 그 조건을 타지 않으므로, 여기서는 app/(route)/properties/[slug]/page.tsx가
// 쓰는 것과 같은 "같은 인자로 두 번 부르면 한 번만 실행" 메모이즈 동작만
// 최소 구현으로 재현해서 그 메모이즈 래퍼가 중복 조회를 막는지 확인한다.
function cache<Args extends unknown[], R>(fn: (...args: Args) => R) {
  let called = false;
  let result: R;
  return (...args: Args): R => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

const unitFindUnique = vi.fn();
const favoriteFindFirst = vi.fn();
const unitViewLogFindFirst = vi.fn();
const unitViewLogCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  default: {
    unit: { findUnique: unitFindUnique },
    favorite: { findFirst: favoriteFindFirst },
    unitViewLog: { findFirst: unitViewLogFindFirst, create: unitViewLogCreate },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("next/headers", () => ({
  headers: () => ({ get: () => null }),
}));

// action.ts의 getUnitDetail은 price/outstandingPayment가 Prisma Decimal
// (toNumber()를 가진 객체)이라고 가정하므로, 평범한 숫자가 아니라 그 형태를
// 흉내낸 값을 줘야 실제 코드 경로와 맞는다.
const SAMPLE_UNIT = {
  id: 1,
  title: "Sample Unit",
  price: { toNumber: () => 25000 },
  outstandingPayment: { toNumber: () => 0 },
  admin: { id: 1, email: "admin@example.invalid" },
};

describe("getUnitDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    unitFindUnique.mockResolvedValue(SAMPLE_UNIT);
    favoriteFindFirst.mockResolvedValue(null);
    unitViewLogFindFirst.mockResolvedValue(null);
    unitViewLogCreate.mockResolvedValue({});
  });

  it("AC-3: 열람 기록 쓰기(findFirst)가 실패해도 매물 상세 응답은 정상이다", async () => {
    unitViewLogFindFirst.mockRejectedValue(new Error("db write unavailable"));
    const { getUnitDetail } = await import("./action");

    const result = await getUnitDetail(1);

    expect(result.status).toBe(200);
    expect(result.unitDetail).toBeTruthy();
  });

  it("AC-3: 열람 기록 쓰기(create)가 실패해도 매물 상세 응답은 정상이다", async () => {
    unitViewLogCreate.mockRejectedValue(new Error("db write unavailable"));
    const { getUnitDetail } = await import("./action");

    const result = await getUnitDetail(1);

    expect(result.status).toBe(200);
    expect(result.unitDetail).toBeTruthy();
  });

  it("AC-2: React.cache로 감싸면 같은 unitId를 두 번 호출해도 실제 조회는 한 번만 나간다", async () => {
    const { getUnitDetail } = await import("./action");
    const getCachedUnitDetail = cache(getUnitDetail);

    await getCachedUnitDetail(1);
    await getCachedUnitDetail(1);

    expect(unitFindUnique).toHaveBeenCalledTimes(1);
    expect(favoriteFindFirst).not.toHaveBeenCalled();
    expect(unitViewLogFindFirst).toHaveBeenCalledTimes(1);
  });
});

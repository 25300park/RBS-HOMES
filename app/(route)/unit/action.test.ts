import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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
const getServerSessionMock = vi.fn();
const waitUntilMock = vi.fn();
const scheduleCreate = vi.fn();
const revalidatePathMock = vi.fn();

// 요청 헤더. 테스트마다 바꿔 끼운다(next-action 유무, IP 헤더).
let requestHeaders = new Map<string, string>();

vi.mock("@/lib/prisma", () => ({
  default: {
    unit: { findUnique: unitFindUnique },
    favorite: { findFirst: favoriteFindFirst },
    unitViewLog: { findFirst: unitViewLogFindFirst, create: unitViewLogCreate },
    schedule: { create: scheduleCreate },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("next/headers", () => ({
  headers: () => ({
    get: (name: string) => requestHeaders.get(name.toLowerCase()) ?? null,
    has: (name: string) => requestHeaders.has(name.toLowerCase()),
  }),
}));

vi.mock("@vercel/functions", () => ({
  waitUntil: waitUntilMock,
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

// 로그에 절대 나오면 안 되는 가짜 개인정보.
const FAKE_IP = "203.0.113.77";
const FAKE_FORWARDED = `${FAKE_IP}, 10.9.8.7`;
const FAKE_USER_ID = "987654";
const FAKE_EMAIL = "fake.viewer@example.invalid";

// Prisma 검증 오류는 메시지에 호출 인자(IP, userId)를 그대로 담는다(로컬 DB에서 확인함).
function prismaValidationLikeError() {
  const err = new Error(
    `Invalid \`prisma.unitViewLog.create()\` invocation: { data: { unitId: 1, userId: ${FAKE_USER_ID}, ip: "${FAKE_IP}" } }`
  );
  err.name = "PrismaClientValidationError";
  return err;
}

function loggedText(...spies: Array<ReturnType<typeof vi.spyOn>>) {
  return spies
    .flatMap((spy) => spy.mock.calls.flat())
    .map((arg) => {
      if (arg instanceof Error) return `${arg.name} ${arg.message} ${arg.stack ?? ""}`;
      try {
        return typeof arg === "string" ? arg : JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join("\n");
}

// waitUntil에 넘겨진 쓰기 작업이 끝날 때까지 기다린다.
async function settleBackgroundWrites() {
  await Promise.all(waitUntilMock.mock.calls.map(([p]) => p));
}

describe("getUnitDetail", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    requestHeaders = new Map([["x-forwarded-for", FAKE_FORWARDED]]);
    getServerSessionMock.mockResolvedValue(null);
    unitFindUnique.mockResolvedValue(SAMPLE_UNIT);
    favoriteFindFirst.mockResolvedValue(null);
    unitViewLogFindFirst.mockResolvedValue(null);
    unitViewLogCreate.mockResolvedValue({});
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("AC-3: 열람 기록 쓰기(findFirst)가 실패해도 매물 상세 응답은 정상이다", async () => {
    unitViewLogFindFirst.mockRejectedValue(new Error("db write unavailable"));
    const { getUnitDetail } = await import("./action");

    const result = await getUnitDetail(1);
    await settleBackgroundWrites();

    expect(result.status).toBe(200);
    expect(result.unitDetail).toBeTruthy();
  });

  it("AC-3: 열람 기록 쓰기(create)가 실패해도 매물 상세 응답은 정상이다", async () => {
    unitViewLogCreate.mockRejectedValue(new Error("db write unavailable"));
    const { getUnitDetail } = await import("./action");

    const result = await getUnitDetail(1);
    await settleBackgroundWrites();

    expect(result.status).toBe(200);
    expect(result.unitDetail).toBeTruthy();
  });

  it("AC-3: 쓰기가 Prisma 검증 오류로 실패해도 오류 로그에 IP, 헤더, userId, 이메일이 없고 이름만 남는다", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: FAKE_USER_ID, email: FAKE_EMAIL } });
    unitViewLogCreate.mockRejectedValue(prismaValidationLikeError());
    const { getUnitDetail } = await import("./action");

    const result = await getUnitDetail(1);
    await settleBackgroundWrites();

    expect(result.status).toBe(200);
    expect(errorSpy).toHaveBeenCalledWith("Error recording view:", {
      name: "PrismaClientValidationError",
      code: undefined,
    });
    const logs = loggedText(logSpy, errorSpy, warnSpy);
    expect(logs).not.toContain(FAKE_IP);
    expect(logs).not.toContain("10.9.8.7");
    expect(logs).not.toContain(FAKE_USER_ID);
    expect(logs).not.toContain(FAKE_EMAIL);
  });

  it("AC-3: 상세 조회 자체가 실패해도 오류 로그에 userId가 없고 이름과 코드만 남는다", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: FAKE_USER_ID, email: FAKE_EMAIL } });
    const err = Object.assign(
      new Error(`Invalid prisma.favorite.findFirst() invocation: { where: { unitId: 1, userId: ${FAKE_USER_ID} } }`),
      { name: "PrismaClientKnownRequestError", code: "P2024" }
    );
    favoriteFindFirst.mockRejectedValue(err);
    const { getUnitDetail } = await import("./action");

    const result = await getUnitDetail(1);

    expect(result.status).toBe(500);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching unit detail:", {
      name: "PrismaClientKnownRequestError",
      code: "P2024",
    });
    const logs = loggedText(logSpy, errorSpy, warnSpy);
    expect(logs).not.toContain(FAKE_USER_ID);
    expect(logs).not.toContain(FAKE_EMAIL);
  });

  it("AC-5: 정상 방문 경로에서 IP, 헤더, userId를 출력하는 로그가 하나도 없다", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: FAKE_USER_ID, email: FAKE_EMAIL } });
    const { getUnitDetail } = await import("./action");

    await getUnitDetail(1);
    await settleBackgroundWrites();

    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("AC-2: 일반 방문(GET)은 waitUntil로 쓰기를 한 번 등록하고, 저장 항목은 그대로 1행 쓴다", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: FAKE_USER_ID, email: FAKE_EMAIL } });
    const { getUnitDetail } = await import("./action");

    const result = await getUnitDetail(1);
    expect(waitUntilMock).toHaveBeenCalledTimes(1);
    expect(waitUntilMock.mock.calls[0][0]).toBeInstanceOf(Promise);
    await settleBackgroundWrites();

    expect(result.status).toBe(200);
    expect(unitViewLogCreate).toHaveBeenCalledTimes(1);
    // AC-6: 저장 항목(unitId, userId, ip)은 변경 전과 같다.
    expect(unitViewLogCreate).toHaveBeenCalledWith({
      data: { unitId: 1, userId: Number(FAKE_USER_ID), ip: FAKE_IP },
    });
  });

  it("AC-8: 서버 액션 뒤의 재렌더링(Next-Action 헤더)에서는 열람 기록을 쓰지 않는다", async () => {
    requestHeaders.set("next-action", "57ba22be7a1907019fdd6f1fbbde24c9796fe302");
    const { getUnitDetail } = await import("./action");

    const result = await getUnitDetail(1);
    await settleBackgroundWrites();

    expect(result.status).toBe(200);
    expect(result.unitDetail).toBeTruthy();
    expect(waitUntilMock).not.toHaveBeenCalled();
    expect(unitViewLogFindFirst).not.toHaveBeenCalled();
    expect(unitViewLogCreate).not.toHaveBeenCalled();
  });

  it("React.cache로 감싸면 같은 unitId를 두 번 호출해도 실제 조회는 한 번만 나간다", async () => {
    const { getUnitDetail } = await import("./action");
    const getCachedUnitDetail = cache(getUnitDetail);

    await getCachedUnitDetail(1);
    await getCachedUnitDetail(1);
    await settleBackgroundWrites();

    expect(unitFindUnique).toHaveBeenCalledTimes(1);
    expect(favoriteFindFirst).not.toHaveBeenCalled();
    expect(unitViewLogFindFirst).toHaveBeenCalledTimes(1);
    expect(unitViewLogCreate).toHaveBeenCalledTimes(1);
  });
});

// B-20261116-04: 투어 신청 오류 로그에 신청자 개인정보가 남지 않는지 확인한다.
describe("requestSchedule", () => {
  const APPLICANT_EMAIL = "fake.applicant@example.invalid";
  const APPLICANT_PHONE = "09000000005";
  const APPLICANT_NAME = "Fake Applicant";

  const formData = () => ({
    name: APPLICANT_NAME,
    email: APPLICANT_EMAIL,
    phone: APPLICANT_PHONE,
    message: "Fake tour message",
    date: new Date("2026-12-02T09:00:00Z"),
    needsDiscussion: false,
    unitId: 1,
    userId: Number(FAKE_USER_ID),
  });

  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    scheduleCreate.mockResolvedValue({});
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("AC-3: 정상 신청은 같은 값으로 1건 저장하고 성공을 돌려준다", async () => {
    const { requestSchedule } = await import("./action");

    const result = await requestSchedule(formData());

    expect(result).toEqual({ success: true });
    expect(scheduleCreate).toHaveBeenCalledWith({
      data: {
        unitId: 1,
        userId: Number(FAKE_USER_ID),
        username: APPLICANT_NAME,
        email: APPLICANT_EMAIL,
        mobile: APPLICANT_PHONE,
        requestDate: new Date("2026-12-02T09:00:00Z"),
        message: "Fake tour message",
        status: 0,
      },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/account/unit/my-list");
  });

  it("AC-4, AC-6: 저장 오류 로그는 남되 이름과 코드만 있고 이메일, 전화번호, 이름, userId가 없다", async () => {
    const err = Object.assign(
      new Error(
        `Invalid \`prisma.schedule.create()\` invocation: { data: { userId: ${FAKE_USER_ID}, username: "${APPLICANT_NAME}", email: "${APPLICANT_EMAIL}", mobile: "${APPLICANT_PHONE}" } }`
      ),
      { name: "PrismaClientKnownRequestError", code: "P2003" }
    );
    scheduleCreate.mockRejectedValue(err);
    const { requestSchedule } = await import("./action");

    const result = await requestSchedule(formData());

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to create schedule");
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith("Schedule creation error:", {
      name: "PrismaClientKnownRequestError",
      code: "P2003",
    });
    const logs = loggedText(logSpy, errorSpy, warnSpy);
    expect(logs).not.toContain(APPLICANT_EMAIL);
    expect(logs).not.toContain(APPLICANT_PHONE);
    expect(logs).not.toContain(APPLICANT_NAME);
    expect(logs).not.toContain(FAKE_USER_ID);
  });
});

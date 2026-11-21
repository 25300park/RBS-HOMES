import { describe, it, expect } from "vitest";
import { errorSummary } from "./api-response";

// 로그에 절대 나오면 안 되는 가짜 개인정보.
const FAKE_EMAIL = "fake.applicant@example.invalid";
const FAKE_PHONE = "09000000001";

describe("errorSummary", () => {
  it("AC-6: 오류의 이름과 코드만 돌려주고 메시지, 스택, 기타 필드는 버린다", () => {
    const err = Object.assign(
      new Error(`Invalid prisma.schedule.create() invocation: { email: "${FAKE_EMAIL}", mobile: "${FAKE_PHONE}" }`),
      { name: "PrismaClientKnownRequestError", code: "P2002", meta: { target: FAKE_EMAIL } }
    );

    const summary = errorSummary(err);

    expect(summary).toEqual({ name: "PrismaClientKnownRequestError", code: "P2002" });
    const text = JSON.stringify(summary);
    expect(text).not.toContain(FAKE_EMAIL);
    expect(text).not.toContain(FAKE_PHONE);
  });

  it("AC-6: 코드가 없거나 문자열이 아니면 code는 undefined다", () => {
    expect(errorSummary(new TypeError("fetch failed"))).toEqual({ name: "TypeError", code: undefined });
    expect(errorSummary(Object.assign(new Error("x"), { code: 500 }))).toEqual({ name: "Error", code: undefined });
  });

  it("AC-6: 오류 객체가 아닌 값이 던져져도 값 자체를 내보내지 않는다", () => {
    expect(errorSummary(FAKE_EMAIL)).toEqual({ name: "UnknownError", code: undefined });
    expect(errorSummary(null)).toEqual({ name: "UnknownError", code: undefined });
    expect(errorSummary(undefined)).toEqual({ name: "UnknownError", code: undefined });
  });
});

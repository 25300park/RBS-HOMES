import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// vi.mock 팩토리와 정적 import는 파일 맨 위로 끌어올려지므로, 팩토리가 참조하는
// mock 함수도 vi.hoisted로 같이 끌어올린다.
const {
  txUserFindUnique,
  txUserUpdate,
  txPasswordResetLogCreate,
  userUpdateMany,
  sendEmailMock,
  hashMock,
} = vi.hoisted(() => ({
  txUserFindUnique: vi.fn(),
  txUserUpdate: vi.fn(),
  txPasswordResetLogCreate: vi.fn(),
  userUpdateMany: vi.fn(),
  sendEmailMock: vi.fn(),
  hashMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => {
  const tx = {
    user: { findUnique: txUserFindUnique, update: txUserUpdate },
    passwordResetLog: { create: txPasswordResetLogCreate },
  };
  return {
    default: {
      $transaction: vi.fn((callback: (tx: unknown) => unknown) => callback(tx)),
      user: { updateMany: userUpdateMany },
    },
  };
});

// 실제 bcrypt 해시(cost 10)는 테스트마다 수십 ms를 쓰고 값이 매번 달라진다.
// 고정 값을 바로 돌려주도록 바꿔 시간 의존을 없애고 복원 조건을 정확히 검증한다.
vi.mock("bcrypt", () => {
  const compare = vi.fn();
  return { hash: hashMock, compare, default: { hash: hashMock, compare } };
});

vi.mock("@/lib/email", () => ({
  sendEmail: sendEmailMock,
  getPasswordResetEmailTemplate: (tempPassword: string) => `<p>${tempPassword}</p>`,
  maskEmail: (email: string) => {
    const atIndex = email.indexOf("@");
    if (atIndex <= 0) return "***";
    return `${email[0]}***${email.slice(atIndex)}`;
  },
}));

// 모듈 로딩(next-auth 등)은 테스트 시간 제한 밖에서 한 번만 한다.
// 테스트 안에서 처음 import하면 느린 환경에서 시간 초과가 나고, 취소되지 않은
// 호출이 다음 테스트의 mock 호출 횟수를 오염시킨다.
import { resetPassword } from "./action";

const OLD_HASH = "old-hashed-password";
const NEW_HASH = "new-hashed-password";

function buildFormData(email: string) {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("ip", "127.0.0.1");
  return formData;
}

describe("resetPassword", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    txUserFindUnique.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      password: OLD_HASH,
    });
    txUserUpdate.mockResolvedValue({});
    txPasswordResetLogCreate.mockResolvedValue({});
    userUpdateMany.mockResolvedValue({ count: 1 });
    hashMock.mockResolvedValue(NEW_HASH);
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("계정이 없으면 404를 반환하고 쓰기가 없다", async () => {
    txUserFindUnique.mockResolvedValue(null);

    const result = await resetPassword(undefined, buildFormData("missing@example.com"));

    expect(result).toEqual({
      status: 404,
      message: "No account found with this email address.",
    });
    expect(txUserUpdate).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("AC-1/AC-2: 트랜잭션 콜백 안에서 sendEmail을 호출하지 않고, 커밋 후 한 번만 호출한다", async () => {
    sendEmailMock.mockResolvedValue({ success: true });

    const result = await resetPassword(undefined, buildFormData("user@example.com"));

    expect(txUserUpdate).toHaveBeenCalledTimes(1);
    // sendEmail은 user.update가 끝난(트랜잭션 콜백이 반환된) 뒤에 호출된다.
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock.mock.invocationCallOrder[0]).toBeGreaterThan(
      txUserUpdate.mock.invocationCallOrder[0]
    );
    expect(userUpdateMany).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 200,
      message: "A temporary password has been sent to your email.",
    });
  });

  it("AC-3: 메일 발송이 예외를 던지면 해시를 복원하고 고정 오류 문구를 반환한다", async () => {
    sendEmailMock.mockRejectedValue(new Error("resend api down"));

    const result = await resetPassword(undefined, buildFormData("user@example.com"));

    expect(userUpdateMany).toHaveBeenCalledTimes(1);
    const call = userUpdateMany.mock.calls[0][0];
    expect(call.where.id).toBe(1);
    expect(call.data.password).toBe(OLD_HASH);
    expect(result).toEqual({
      status: 500,
      message: "An error occurred while resetting your password. Please try again.",
    });
  });

  it("AC-4: sendEmail이 skipped를 돌려줘도 AC-3과 같이 복원하고 고정 오류 문구를 반환한다", async () => {
    sendEmailMock.mockResolvedValue({ success: true, skipped: true });

    const result = await resetPassword(undefined, buildFormData("user@example.com"));

    expect(userUpdateMany).toHaveBeenCalledTimes(1);
    expect(result?.status).toBe(500);
  });

  it("복원 조건이 맞으면(해시가 그대로면) 이전 해시로 되돌린다", async () => {
    sendEmailMock.mockResolvedValue({ success: true, skipped: true });
    userUpdateMany.mockResolvedValue({ count: 1 });

    await resetPassword(undefined, buildFormData("user@example.com"));

    const call = userUpdateMany.mock.calls[0][0];
    expect(call.where).toEqual({ id: 1, password: NEW_HASH });
    expect(call.data.password).toBe(OLD_HASH);
  });

  it("그 사이 해시가 바뀌었으면(복원 대상 0건) 덮어쓰지 않고 마스킹 로그만 남긴다", async () => {
    sendEmailMock.mockResolvedValue({ success: true, skipped: true });
    userUpdateMany.mockResolvedValue({ count: 0 });

    const result = await resetPassword(undefined, buildFormData("user@example.com"));

    expect(userUpdateMany).toHaveBeenCalledTimes(1);
    expect(result?.status).toBe(500);

    const loggedStrings = consoleErrorSpy.mock.calls
      .flat()
      .filter((arg: unknown): arg is string => typeof arg === "string");
    expect(loggedStrings.some((s: string) => s.includes("u***@example.com"))).toBe(true);
    expect(loggedStrings.some((s: string) => s.includes("user@example.com"))).toBe(false);
  });

  it("AC-5: 모든 경로의 console 호출에 평문 비밀번호/해시/전체 이메일이 없다", async () => {
    sendEmailMock.mockRejectedValue(new Error("resend api down"));

    await resetPassword(undefined, buildFormData("user@example.com"));

    const loggedStrings = consoleErrorSpy.mock.calls
      .flat()
      .filter((arg: unknown): arg is string => typeof arg === "string");

    for (const s of loggedStrings) {
      expect(s).not.toContain(OLD_HASH);
      expect(s).not.toContain("user@example.com");
    }
  });
});

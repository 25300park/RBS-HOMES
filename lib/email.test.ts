import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const sendMock = vi.fn().mockResolvedValue({ data: { id: "mock" }, error: null });

vi.mock("resend", () => {
  class Resend {
    emails = { send: sendMock };
  }
  return { Resend };
});

const ORIGINAL_ENV = { ...process.env };

describe("sendEmail (EMAIL_MODE)", () => {
  beforeEach(() => {
    sendMock.mockClear();
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.EMAIL_MODE;
    delete process.env.EMAIL_REDIRECT_TO;
    delete process.env.VERCEL_ENV;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("off 모드: 발송 호출이 0회다", async () => {
    process.env.EMAIL_MODE = "off";
    const { sendEmail } = await import("./email");
    await sendEmail({ to: "user@example.com", subject: "제목", html: "<p>내용</p>" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("EMAIL_MODE가 없을 때: 발송 호출이 0회다", async () => {
    const { sendEmail } = await import("./email");
    await sendEmail({ to: "user@example.com", subject: "제목", html: "<p>내용</p>" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("알 수 없는 값일 때: 발송 호출이 0회다", async () => {
    process.env.EMAIL_MODE = "something-else";
    const { sendEmail } = await import("./email");
    await sendEmail({ to: "user@example.com", subject: "제목", html: "<p>내용</p>" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("redirect 모드: 수신자가 EMAIL_REDIRECT_TO로 바뀌고 제목에 원래 수신자가 표시된다", async () => {
    process.env.EMAIL_MODE = "redirect";
    process.env.EMAIL_REDIRECT_TO = "dev@example.com";
    const { sendEmail } = await import("./email");
    await sendEmail({ to: "user@example.com", subject: "원래 제목", html: "<p>내용</p>" });

    expect(sendMock).toHaveBeenCalledTimes(1);
    const call = sendMock.mock.calls[0][0];
    expect(call.to).toBe("dev@example.com");
    expect(call.subject).toContain("user@example.com");
    expect(call.subject).toContain("원래 제목");
  });

  it("redirect 모드인데 EMAIL_REDIRECT_TO가 없으면 off로 동작한다", async () => {
    process.env.EMAIL_MODE = "redirect";
    const { sendEmail } = await import("./email");
    await sendEmail({ to: "user@example.com", subject: "제목", html: "<p>내용</p>" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("live 모드 + VERCEL_ENV=production: 실제로 호출하고 제목/본문이 그대로다", async () => {
    process.env.EMAIL_MODE = "live";
    process.env.VERCEL_ENV = "production";
    const { sendEmail } = await import("./email");
    await sendEmail({ to: "user@example.com", subject: "투어가 확정되었습니다", html: "<p>원본 내용</p>" });

    expect(sendMock).toHaveBeenCalledTimes(1);
    const call = sendMock.mock.calls[0][0];
    expect(call.to).toBe("user@example.com");
    expect(call.subject).toBe("투어가 확정되었습니다");
    expect(call.html).toBe("<p>원본 내용</p>");
  });

  it("live 모드 + production이 아닌 환경: 발송 호출이 0회다", async () => {
    process.env.EMAIL_MODE = "live";
    process.env.VERCEL_ENV = "preview";
    const { sendEmail } = await import("./email");
    await sendEmail({ to: "user@example.com", subject: "제목", html: "<p>내용</p>" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("live 모드 + VERCEL_ENV 없음: 발송 호출이 0회다", async () => {
    process.env.EMAIL_MODE = "live";
    const { sendEmail } = await import("./email");
    await sendEmail({ to: "user@example.com", subject: "제목", html: "<p>내용</p>" });
    expect(sendMock).not.toHaveBeenCalled();
  });
});

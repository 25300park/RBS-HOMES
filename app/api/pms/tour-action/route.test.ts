import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// B-20261116-04: 투어 승인/거절 시 수신자 이메일이 로그에 남지 않고,
// 발송 대상과 발송 조건은 그대로인지 확인한다. 아래 값은 전부 가짜다.
const {
  getServerSessionMock,
  scheduleFindUnique,
  scheduleUpdate,
  unitFindFirst,
  agentScheduleCreate,
  transactionMock,
  sendEmailMock,
} = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  scheduleFindUnique: vi.fn(),
  scheduleUpdate: vi.fn(),
  unitFindFirst: vi.fn(),
  agentScheduleCreate: vi.fn(),
  transactionMock: vi.fn(),
  sendEmailMock: vi.fn(),
}));

vi.mock("next-auth/next", () => ({ getServerSession: getServerSessionMock }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/email", () => ({ sendEmail: sendEmailMock }));
vi.mock("@/lib/prisma", () => ({
  default: {
    schedule: { findUnique: scheduleFindUnique, update: scheduleUpdate },
    unit: { findFirst: unitFindFirst },
    agentSchedule: { create: agentScheduleCreate },
    $transaction: transactionMock,
  },
}));

import { POST } from "./route";

const APPLICANT_EMAIL = "fake.applicant@example.invalid";
const APPLICANT_NAME = "Fake Applicant";
const APPLICANT_PHONE = "09000000003";
const AGENT_PHONE = "09000000004";

function pendingSchedule() {
  return {
    id: 501,
    unitId: 77,
    userId: null,
    email: APPLICANT_EMAIL,
    username: APPLICANT_NAME,
    mobile: APPLICANT_PHONE,
    status: 0,
    requestDate: new Date("2026-12-01T10:00:00Z"),
    date: null,
  };
}

function request(body: unknown) {
  return new Request("http://localhost/api/pms/tour-action", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function consoleText(...spies: Array<ReturnType<typeof vi.spyOn>>) {
  return spies
    .flatMap((spy) => spy.mock.calls.flat())
    .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
    .join("\n");
}

describe("POST /api/pms/tour-action logging", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { id: 31, level: 2, name: "Fake Agent", phone: AGENT_PHONE },
    });
    scheduleFindUnique.mockResolvedValue(pendingSchedule());
    unitFindFirst.mockResolvedValue({ id: 77, title: "Fake Listing" });
    scheduleUpdate.mockResolvedValue({});
    agentScheduleCreate.mockResolvedValue({});
    transactionMock.mockResolvedValue([]);
    sendEmailMock.mockResolvedValue(undefined);
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    infoSpy.mockRestore();
  });

  it("AC-4: 거절 시 수신자 이메일을 로그에 남기지 않고, 메일은 그대로 신청자에게 한 번 보낸다", async () => {
    const res = await POST(request({ scheduleId: 501, action: "reject" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, action: "rejected" });
    expect(scheduleUpdate).toHaveBeenCalledWith({
      where: { id: 501 },
      data: { status: 3, lastUpdate: expect.any(Date) },
    });
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock.mock.calls[0][0]).toMatchObject({
      to: APPLICANT_EMAIL,
      subject: "Your tour request has been declined - RBS HOMES",
    });
    const logs = consoleText(logSpy, errorSpy, warnSpy, infoSpy);
    expect(logs).not.toContain(APPLICANT_EMAIL);
    expect(logs).not.toContain(APPLICANT_PHONE);
  });

  it("AC-4: 승인 시 수신자 이메일을 로그에 남기지 않고, 메일은 그대로 신청자에게 한 번 보낸다", async () => {
    const res = await POST(request({ scheduleId: 501, action: "approve" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, action: "approved" });
    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(agentScheduleCreate).toHaveBeenCalledWith({
      data: {
        agentId: 31,
        unitId: 77,
        title: `Tour: Fake Listing · ${APPLICANT_NAME}`,
        date: new Date("2026-12-01T10:00:00Z"),
        sourceScheduleId: 501,
      },
    });
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const mail = sendEmailMock.mock.calls[0][0];
    expect(mail).toMatchObject({
      to: APPLICANT_EMAIL,
      subject: "Your tour request is confirmed - RBS HOMES",
    });
    expect(mail.html).toContain(AGENT_PHONE);
    const logs = consoleText(logSpy, errorSpy, warnSpy, infoSpy);
    expect(logs).not.toContain(APPLICANT_EMAIL);
    expect(logs).not.toContain(APPLICANT_PHONE);
    expect(logs).not.toContain(AGENT_PHONE);
  });

  it("회원(userId 있음)의 투어 요청에는 지금처럼 메일을 보내지 않는다", async () => {
    scheduleFindUnique.mockResolvedValue({ ...pendingSchedule(), userId: 12 });

    const res = await POST(request({ scheduleId: 501, action: "reject" }));

    expect(res.status).toBe(200);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from "vitest";
import bcrypt from "bcryptjs";

const userFindUnique = vi.fn();
const userCreate = vi.fn();
const userUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  default: {
    user: { findUnique: userFindUnique, create: userCreate, update: userUpdate },
  },
}));

const REAL_PASSWORD = "Correct#Pass1";
let realHash = "";

function existingUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 4242,
    email: "staff@example.invalid",
    name: "Fake Staff",
    level: 0,
    phone: null,
    image: null,
    status: -1,
    license: null,
    isSuperAdmin: true,
    password: realHash,
    ...overrides,
  };
}

// next-auth 4.x의 CredentialsProvider는 사용자가 넘긴 authorize를 provider.options에 둔다.
async function getAuthorize() {
  const { authOptions } = await import("./auth");
  const provider = authOptions.providers.find((p) => p.id === "credentials") as any;
  return provider.options.authorize as (
    credentials: Record<string, string> | undefined,
    req: unknown
  ) => Promise<unknown>;
}

describe("credentials authorize", () => {
  beforeAll(async () => {
    realHash = await bcrypt.hash(REAL_PASSWORD, 4);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("비밀번호 demo로는 기존 계정(관리자 포함)에 로그인할 수 없고, 계정도 바뀌지 않는다", async () => {
    userFindUnique.mockResolvedValue(existingUser());
    const authorize = await getAuthorize();

    await expect(
      authorize({ email: "staff@example.invalid", password: "demo" }, {})
    ).rejects.toThrow("Incorrect password");
    expect(userCreate).not.toHaveBeenCalled();
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it("@demo.com 이메일로는 계정이 만들어지지 않는다 (prisma.user.create 0회)", async () => {
    userFindUnique.mockResolvedValue(null);
    const authorize = await getAuthorize();

    await expect(
      authorize({ email: "agent@demo.com", password: "demo" }, {})
    ).rejects.toThrow("No user found with the given email");
    await expect(
      authorize({ email: "anyone@demo.com", password: "anything" }, {})
    ).rejects.toThrow("No user found with the given email");
    expect(userCreate).toHaveBeenCalledTimes(0);
    expect(userUpdate).toHaveBeenCalledTimes(0);
  });

  it("@demo.com 이메일이라도 기존 계정이면 실제 비밀번호로만 로그인된다", async () => {
    userFindUnique.mockResolvedValue(existingUser({ email: "tenant@demo.com", level: 5, isSuperAdmin: false }));
    const authorize = await getAuthorize();

    await expect(
      authorize({ email: "tenant@demo.com", password: "demo" }, {})
    ).rejects.toThrow("Incorrect password");
    await expect(
      authorize({ email: "tenant@demo.com", password: REAL_PASSWORD }, {})
    ).resolves.toMatchObject({ id: 4242, email: "tenant@demo.com", level: 5 });
    expect(userCreate).not.toHaveBeenCalled();
  });

  it("정상 비밀번호 로그인은 그대로 동작하고 같은 필드를 돌려준다", async () => {
    userFindUnique.mockResolvedValue(existingUser({ phone: "09000000000", license: "LIC-FAKE" }));
    const authorize = await getAuthorize();

    const user = await authorize({ email: "staff@example.invalid", password: REAL_PASSWORD }, {});

    expect(user).toEqual({
      id: 4242,
      email: "staff@example.invalid",
      name: "Fake Staff",
      level: 0,
      phone: "09000000000",
      image: null,
      status: -1,
      license: "LIC-FAKE",
      isSuperAdmin: true,
    });
    expect(userFindUnique).toHaveBeenCalledWith({ where: { email: "staff@example.invalid" } });
    expect(userCreate).not.toHaveBeenCalled();
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it("틀린 비밀번호는 그대로 거부된다", async () => {
    userFindUnique.mockResolvedValue(existingUser());
    const authorize = await getAuthorize();

    await expect(
      authorize({ email: "staff@example.invalid", password: "Wrong#Pass1" }, {})
    ).rejects.toThrow("Incorrect password");
  });

  it("입력이 비어 있으면 그대로 거부된다", async () => {
    const authorize = await getAuthorize();

    await expect(authorize({ email: "", password: "" }, {})).rejects.toThrow("Missing credentials");
    expect(userFindUnique).not.toHaveBeenCalled();
  });
});

// B-20261116-04: 로그인 콜백이 사용자 정보와 계정 번호를 로그에 남기지 않는지 확인한다.
// 아래 값은 전부 가짜이며, 로그 어디에도 나오면 안 된다.
const PII_USER_ID = 987123;
const PII_EMAIL = "fake.login@example.invalid";
const PII_PHONE = "09000000002";
const PII_LICENSE = "LIC-FAKE-777";
const PII_NAME = "Fake Login Person";

function consoleText(...spies: Array<ReturnType<typeof vi.spyOn>>) {
  return spies
    .flatMap((spy) => spy.mock.calls.flat())
    .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
    .join("\n");
}

function expectNoPii(text: string) {
  expect(text).not.toContain(String(PII_USER_ID));
  expect(text).not.toContain(PII_EMAIL);
  expect(text).not.toContain(PII_PHONE);
  expect(text).not.toContain(PII_LICENSE);
  expect(text).not.toContain(PII_NAME);
}

describe("login callbacks logging (B-20261116-04)", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
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

  it("AC-4: jwt 콜백은 사용자 객체와 userId를 로그에 남기지 않고, 토큰 구성은 그대로다", async () => {
    const { authOptions } = await import("./auth");
    const user = {
      id: PII_USER_ID,
      email: PII_EMAIL,
      name: PII_NAME,
      level: 4,
      phone: PII_PHONE,
      image: null,
      status: 1,
      license: PII_LICENSE,
      isSuperAdmin: false,
    };

    const token = await (authOptions.callbacks!.jwt as any)({ token: {}, user });

    expect(token).toEqual({
      id: PII_USER_ID,
      email: PII_EMAIL,
      level: 4,
      phone: PII_PHONE,
      image: null,
      status: 1,
      license: PII_LICENSE,
      isSuperAdmin: false,
    });
    expectNoPii(consoleText(logSpy, errorSpy, warnSpy, infoSpy));
  });

  it("AC-4: Google 로그인 signIn 콜백은 userId를 로그에 남기지 않고, DB 사용자 정보로 교체하는 동작은 그대로다", async () => {
    userFindUnique.mockResolvedValue({
      id: PII_USER_ID,
      email: PII_EMAIL,
      name: PII_NAME,
      level: 4,
      phone: PII_PHONE,
      image: null,
      status: 1,
      license: PII_LICENSE,
      isSuperAdmin: false,
    });
    const { authOptions } = await import("./auth");
    const user: Record<string, unknown> = { id: "google-sub-fake", email: PII_EMAIL, name: PII_NAME };

    const allowed = await (authOptions.callbacks!.signIn as any)({ user, account: { provider: "google" } });

    expect(allowed).toBe(true);
    expect(user).toMatchObject({
      id: PII_USER_ID,
      level: 4,
      phone: PII_PHONE,
      status: 1,
      license: PII_LICENSE,
      isSuperAdmin: false,
    });
    expect(userCreate).not.toHaveBeenCalled();
    expectNoPii(consoleText(logSpy, errorSpy, warnSpy, infoSpy));
  });
});

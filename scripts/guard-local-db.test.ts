import { describe, it, expect } from "vitest";
import { isAllowedLocalHost } from "./guard-local-db";

describe("isAllowedLocalHost", () => {
  it.each([
    "mysql://root:pass@localhost:3307/rbs_local",
    "mysql://root:pass@127.0.0.1:3307/rbs_local",
    "mysql://root:pass@host.docker.internal:3307/rbs_local",
  ])("허용: %s", (url) => {
    expect(isAllowedLocalHost(url)).toBe(true);
  });

  it.each([
    ["운영처럼 보이는 원격 호스트", "mysql://u:p@db.example.com:3306/x"],
    ["localhost로 시작하지만 실제 호스트는 다른 도메인", "mysql://root:pass@localhost.evil.com:3306/db"],
    ["127.0.0.1로 시작하지만 실제 호스트는 다른 도메인", "mysql://root:pass@127.0.0.1.evil.com:3306/db"],
    ["userinfo에 localhost를 넣어 실제 호스트를 가린 경우", "mysql://localhost@evil.com:3306/db"],
    ["빈 값", ""],
    ["URL 형식이 아님", "not a url"],
  ])("거부: %s", (_label, url) => {
    expect(isAllowedLocalHost(url)).toBe(false);
  });

  it("undefined도 거부한다", () => {
    expect(isAllowedLocalHost(undefined as unknown as string)).toBe(false);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";

// B-20261116-04: 리뷰 조회 오류 로그는 남되 이름과 코드만 남는지 확인한다.
// 오류 메시지에 요청 URL(장소 ID, API 키)이 섞여도 로그에 나오면 안 된다. 값은 전부 가짜다.
const FAKE_PLACE_ID = "fake-place-id-0001";
const FAKE_API_KEY = "fake-google-key-0001";

describe("GET /api/google-reviews error logging", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv("GOOGLE_PLACE_ID", FAKE_PLACE_ID);
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_KEY", FAKE_API_KEY);
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    errorSpy.mockRestore();
    logSpy.mockRestore();
  });

  it("AC-6: 조회 실패 시 오류 로그는 남되 이름과 코드만 있고, 응답 상태는 그대로 500이다", async () => {
    const fetchMock = vi.fn().mockRejectedValue(
      Object.assign(
        new TypeError(
          `fetch failed: https://maps.googleapis.com/maps/api/place/details/json?place_id=${FAKE_PLACE_ID}&key=${FAKE_API_KEY}`
        ),
        { code: "ECONNRESET" }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await GET(new Request("http://localhost/api/google-reviews"));

    expect(res.status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith("리뷰 조회 에러:", { name: "TypeError", code: "ECONNRESET" });
    const logs = [...errorSpy.mock.calls, ...logSpy.mock.calls]
      .flat()
      .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
      .join("\n");
    expect(logs).not.toContain(FAKE_API_KEY);
    expect(logs).not.toContain(FAKE_PLACE_ID);
  });
});

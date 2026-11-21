import { NextResponse } from "next/server";

// Prisma 검증 오류 메시지에는 호출 인자(이메일, 전화번호, IP, userId 등)가 그대로
// 들어가므로, 오류 로그에는 원본 오류 대신 이름과 코드만 남긴다.
export const errorSummary = (error: unknown) => {
  const e = (error ?? {}) as { name?: unknown; code?: unknown };
  return {
    name: typeof e.name === "string" ? e.name : "UnknownError",
    code: typeof e.code === "string" ? e.code : undefined,
  };
};

// 클라이언트로는 고정 문구만 내려보내 raw Prisma/DB 에러 텍스트 노출을 막고,
// 서버 콘솔에는 원본 에러를 그대로 남겨 디버깅 정보는 보존한다.
export function apiError(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
  status = 500
) {
  console.error(error);
  return NextResponse.json({ error: fallbackMessage }, { status });
}

import { NextResponse } from "next/server";

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

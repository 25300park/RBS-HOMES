import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

// 권한이 필요한 경로만 포함
const RESTRICTED_PATHS = [
  "/account/unit/registration",
  "/account/unit/my-list",
];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  // 현재 요청 경로가 제한된 경로인지 확인
  const isRestrictedPath = RESTRICTED_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isRestrictedPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (token.level === 1 || !token.phone) {
      const redirectUrl = new URL("/account/management", request.url);
      redirectUrl.searchParams.set("tabs", "EditInformation");
      redirectUrl.searchParams.set(
        "message",
        "Please complete your profile first"
      );

      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/unit/:path*"],
};

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const RESTRICTED_PATHS = [
  "/account/unit/registration",
  "/account/unit/my-list",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /account/dashboard -> /dashboard 리다이렉트
  if (pathname === "/account/dashboard") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isRestrictedPath = RESTRICTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (isRestrictedPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (token.level === 1 || !token.phone) {
      const redirectUrl = new URL("/account/management", request.url);
      redirectUrl.searchParams.set("tabs", "EditInformation");
      redirectUrl.searchParams.set("message", "Please complete your profile first");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/unit/:path*", "/account/dashboard"],
};

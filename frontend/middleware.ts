import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = pathname.startsWith("/login");
  const token = req.cookies.get("payout_token")?.value;

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

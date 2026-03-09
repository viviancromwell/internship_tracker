import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  const { pathname } = request.nextUrl;
  const publicPaths = ["/login", "/register", "/"];
  const isPublic =
    pathname === "/" || publicPaths.some((p) => p !== "/" && pathname.startsWith(p));

  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/internships", request.url));
  }

  if (isPublic) {
    if (token) {
      return NextResponse.redirect(new URL("/internships", request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

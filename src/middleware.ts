import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PAGE_PREFIXES = ["/dashboard", "/create", "/course/", "/settings"];
const PROTECTED_API_PREFIXES = ["/api/courses", "/api/user", "/api/credits", "/api/usage-logs", "/api/sections", "/api/upload"];
const PUBLIC_PATHS = ["/login", "/register", "/"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/api/share")) return true;
  if (pathname.startsWith("/api/textbook-templates")) return true;
  if (pathname.startsWith("/api/cos/")) return true;
  if (pathname.startsWith("/api/uploads/")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/images") || pathname.startsWith("/static")) return true;
  return false;
}

function isProtected(pathname: string): boolean {
  if (isPublicPath(pathname)) return false;
  const isApi = pathname.startsWith("/api");
  if (isApi) {
    return PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));
  }
  return PROTECTED_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always set x-pathname header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (isProtected(pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const isApi = pathname.startsWith("/api");
      if (isApi) {
        return NextResponse.json({ error: "未登录，请先登录" }, { status: 401 });
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create/:path*",
    "/course/:path*",
    "/settings/:path*",
    "/api/courses/:path*",
    "/api/user/:path*",
    "/api/credits/:path*",
    "/api/usage-logs/:path*",
    "/api/sections/:path*",
    "/api/upload/:path*",
  ],
};

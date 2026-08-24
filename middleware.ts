import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith("/products");
  const isAuthRoute = pathname === "/auth";

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      const response = NextResponse.redirect(new URL("/auth", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  if (token && isAuthRoute) {
    const payload = await verifyToken(token);
    if (payload) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/products/:path*", "/auth"],
};

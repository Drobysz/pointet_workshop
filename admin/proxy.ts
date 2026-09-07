import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/verify"];
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hasSession = request.cookies.has("access_token") || request.cookies.has("refresh_token");
  const isPublic = publicRoutes.some((route) => path.startsWith(route));
  if (!hasSession && !isPublic) return NextResponse.redirect(new URL("/login", request.url));
  if (hasSession && path === "/login") return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}
export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };

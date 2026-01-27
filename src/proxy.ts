import { getCurrentSession } from "@/lib/auth/utils/get-current-session";
import { NextResponse, NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  console.log("PROXY HIT:", request.nextUrl.pathname);
  const session = await getCurrentSession();

  if (request.url === "/profile") {
  }
  //   request.
  return NextResponse.next();
  //   return NextResponse.redirect(new URL("/home", request.url));
}

export const config = {
  matcher: [
    "/profile",
    "/profile/:path*",
    "/roster",
    "/teams",
    "/manage",

    // Exclude API routes, static files, image optimizations, and .png files
    // "/((?!api|_next/static|_next/image|.*\\.png$).*)",
  ],
};

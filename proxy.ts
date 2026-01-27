import { getCurrentSession } from "@/lib/auth/utils/get-current-session";
import { NextResponse, NextRequest } from "next/server";

const protectedRoutes = ["/profile", "/roster", "/teams", "/manage"];

export async function proxy(request: NextRequest) {
  const session = await getCurrentSession();

  const pathName = request.nextUrl.pathname;

  console.log("PROXY HIT:", pathName);

  if (protectedRoutes.includes(pathName) && !session?.user.id) {
    return NextResponse.redirect("/");
  }

  return NextResponse.next();
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

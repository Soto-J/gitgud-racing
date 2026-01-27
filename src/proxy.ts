import { NextResponse, NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/utils/get-current-session";

const protectedRoutes = ["/profile", "/roster", "/teams", "/manage"];

export async function proxy(request: NextRequest) {
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isProtectedRoute) {
    const session = await getCurrentSession();

    if (!session?.user.id) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/profile/:path*", "/roster", "/teams", "/manage"],
};

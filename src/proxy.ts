import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const protectedPrefixes = ["/dashboard", "/book", "/vendor/dashboard", "/vendor/trips", "/vendor/bookings"];

export default auth((req) => {
  const isProtected = protectedPrefixes.some((p) => req.nextUrl.pathname.startsWith(p));
  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/book/:path*",
    "/vendor/dashboard/:path*",
    "/vendor/trips/:path*",
    "/vendor/bookings/:path*",
  ],
};

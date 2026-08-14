import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const vendorPrefixes = ["/vendor/dashboard", "/vendor/trips", "/vendor/bookings"];
const customerPrefixes = ["/dashboard", "/book"];
const adminPrefixes = ["/admin"];
const protectedPrefixes = [...customerPrefixes, ...vendorPrefixes, ...adminPrefixes];

export default auth((req) => {
  const isVendorRoute = vendorPrefixes.some((p) => req.nextUrl.pathname.startsWith(p));
  const isProtected = protectedPrefixes.some((p) => req.nextUrl.pathname.startsWith(p));
  if (isProtected && !req.auth) {
    // Admin has no separate login experience (spec §38) — falls back to customer login.
    const loginUrl = new URL(isVendorRoute ? "/vendor/login" : "/customer/login", req.nextUrl.origin);
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
    "/admin/:path*",
  ],
};

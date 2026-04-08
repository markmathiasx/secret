import { NextResponse } from "next/server";
import { verifyEmailWithToken } from "@/lib/marketplace-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";

  if (!token) {
    return NextResponse.redirect(new URL("/login?verified=missing", request.url));
  }

  const user = await verifyEmailWithToken(token);

  if (!user) {
    return NextResponse.redirect(new URL("/login?verified=invalid", request.url));
  }

  return NextResponse.redirect(new URL("/login?verified=ok", request.url));
}

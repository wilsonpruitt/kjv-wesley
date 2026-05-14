import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  MAX_AGE_SEC,
  encodeSession,
  sessionCookieOptions,
} from "@/lib/session";
import { MIN_PLEDGE_CENTS } from "@/lib/patreon";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const admin = process.env.ADMIN_TOKEN ?? "";
  if (!admin || token !== admin) {
    return new NextResponse("Invalid token", { status: 403 });
  }
  const session = await encodeSession({
    name: "Admin",
    pledge_cents: MIN_PLEDGE_CENTS,
    admin: true,
    expires_at: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  });
  const resp = NextResponse.redirect(new URL("/", req.url));
  resp.cookies.set(COOKIE_NAME, session, sessionCookieOptions(url.protocol === "https:"));
  return resp;
}

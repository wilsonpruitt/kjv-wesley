import { NextRequest, NextResponse } from "next/server";
import { buildRedirectUri, exchangeCodeForIdentity } from "@/lib/patreon";
import {
  COOKIE_NAME,
  MAX_AGE_SEC,
  encodeSession,
  sessionCookieOptions,
} from "@/lib/session";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const nextUrl = req.cookies.get("kw_next")?.value || "/";

  if (error || !code) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error || "Authorization denied")}`,
        req.url,
      ),
    );
  }

  const redirectUri = buildRedirectUri(url, req.headers.get("x-forwarded-proto"));
  const identity = await exchangeCodeForIdentity(code, redirectUri);
  if (!identity) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Patreon authentication failed")}`, req.url),
    );
  }

  const token = await encodeSession({
    name: identity.name,
    pledge_cents: identity.pledge_cents,
    expires_at: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  });

  const resp = NextResponse.redirect(new URL(nextUrl, req.url));
  const opts = sessionCookieOptions(url.protocol === "https:");
  resp.cookies.set(COOKIE_NAME, token, opts);
  resp.cookies.delete("kw_next");
  return resp;
}

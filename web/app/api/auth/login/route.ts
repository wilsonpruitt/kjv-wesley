import { NextRequest, NextResponse } from "next/server";
import { authorizeUrl, buildRedirectUri } from "@/lib/patreon";

export const runtime = "edge";

export function GET(req: NextRequest) {
  const url = new URL(req.url);
  const redirectUri = buildRedirectUri(url, req.headers.get("x-forwarded-proto"));
  return NextResponse.redirect(authorizeUrl(redirectUri));
}

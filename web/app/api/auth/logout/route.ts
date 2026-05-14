import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/session";

export const runtime = "edge";

export function GET(req: NextRequest) {
  const resp = NextResponse.redirect(new URL("/", req.url));
  resp.cookies.delete(COOKIE_NAME);
  return resp;
}

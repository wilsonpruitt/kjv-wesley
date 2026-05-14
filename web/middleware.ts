import { NextRequest, NextResponse } from "next/server";
import { decodeSession, COOKIE_NAME } from "@/lib/session";
import { MIN_PLEDGE_CENTS } from "@/lib/patreon";

const FREE_BOOKS = new Set(["matthew", "mark", "luke", "john"]);

// All known book slugs (NT + OT). Used to distinguish gated routes from other
// app paths. Kept inline rather than imported because middleware runs on the
// edge and we want minimal cold-start cost.
const ALL_BOOKS = new Set([
  "matthew","mark","luke","john","acts","romans","1corinthians","2corinthians",
  "galatians","ephesians","philippians","colossians","1thessalonians",
  "2thessalonians","1timothy","2timothy","titus","philemon","hebrews","james",
  "1peter","2peter","1john","2john","3john","jude","revelation",
  "genesis","exodus","leviticus","numbers","deuteronomy","joshua","judges",
  "ruth","1samuel","2samuel","1kings","2kings","1chronicles","2chronicles",
  "ezra","nehemiah","esther","job","psalms","proverbs","ecclesiastes",
  "songofsolomon","isaiah","jeremiah","lamentations","ezekiel","daniel",
  "hosea","joel","amos","obadiah","jonah","micah","nahum","habakkuk",
  "zephaniah","haggai","zechariah","malachi",
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // pathname starts with "/" — first segment is the book slug
  const firstSeg = pathname.split("/")[1] ?? "";
  if (!ALL_BOOKS.has(firstSeg)) return NextResponse.next();
  if (FREE_BOOKS.has(firstSeg)) return NextResponse.next();

  const session = await decodeSession(req.cookies.get(COOKIE_NAME)?.value);
  if (session?.admin) return NextResponse.next();
  if (session && session.pledge_cents >= MIN_PLEDGE_CENTS) return NextResponse.next();

  // Stash intended destination so callback can return the user here.
  const next = pathname + (req.nextUrl.search || "");
  const redirectTo = session ? "/upgrade" : "/login";
  const resp = NextResponse.redirect(new URL(redirectTo, req.url));
  resp.cookies.set("kw_next", next, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: req.nextUrl.protocol === "https:",
  });
  return resp;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};

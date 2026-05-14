/**
 * Signed-cookie session, edge-compatible.
 *
 * Encoding: base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload))
 * Cookie name: kw_session
 */

const COOKIE_NAME = "kw_session";
const MAX_AGE_SEC = 7 * 24 * 60 * 60;

export type SessionPayload = {
  name: string;
  pledge_cents: number;
  admin?: boolean;
  expires_at: number; // unix seconds
};

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET not set");
  return s;
}

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// Encode bytes to an ArrayBuffer-backed view that satisfies Web Crypto's
// strict BufferSource type (TextEncoder/atob produce Uint8Array<ArrayBufferLike>
// which TS rejects when SharedArrayBuffer is in scope).
function bytes(s: string): ArrayBuffer {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i);
  return buf;
}

function utf8(s: string): ArrayBuffer {
  const u = new TextEncoder().encode(s);
  const buf = new ArrayBuffer(u.byteLength);
  new Uint8Array(buf).set(u);
  return buf;
}

function b64urlDecode(str: string): ArrayBuffer {
  const pad = str.length % 4 ? "=".repeat(4 - (str.length % 4)) : "";
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return bytes(atob(b64));
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    utf8(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function encodeSession(p: SessionPayload): Promise<string> {
  const payload = b64url(new Uint8Array(utf8(JSON.stringify(p))));
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", await hmacKey(), utf8(payload)),
  );
  return `${payload}.${b64url(sig)}`;
}

export async function decodeSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payload, sigStr] = token.split(".");
  if (!payload || !sigStr) return null;
  let valid = false;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      b64urlDecode(sigStr),
      utf8(payload),
    );
  } catch {
    return null;
  }
  if (!valid) return null;
  try {
    const data = JSON.parse(
      new TextDecoder().decode(b64urlDecode(payload)),
    ) as SessionPayload;
    if (data.expires_at && data.expires_at < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(secure: boolean) {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}

export { COOKIE_NAME, MAX_AGE_SEC };

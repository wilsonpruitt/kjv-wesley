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

function b64urlDecode(str: string): Uint8Array {
  const pad = str.length % 4 ? "=".repeat(4 - (str.length % 4)) : "";
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function encodeSession(p: SessionPayload): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(p));
  const payload = b64url(json);
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", await hmacKey(), new TextEncoder().encode(payload)),
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
      new TextEncoder().encode(payload),
    );
  } catch {
    return null;
  }
  if (!valid) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))) as SessionPayload;
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

export const PATREON_AUTH_URL = "https://www.patreon.com/oauth2/authorize";
export const PATREON_TOKEN_URL = "https://www.patreon.com/api/oauth2/token";
export const PATREON_IDENTITY_URL = "https://www.patreon.com/api/oauth2/v2/identity";

export const MIN_PLEDGE_CENTS = parseInt(
  process.env.MIN_PLEDGE_CENTS ?? "500",
  10,
);

export function clientId(): string {
  return process.env.PATREON_CLIENT_ID ?? "";
}

export function clientSecret(): string {
  return process.env.PATREON_CLIENT_SECRET ?? "";
}

/**
 * Build the OAuth redirect URI. Forces https when the request looks like it's
 * coming through a TLS-terminating proxy (Vercel sets x-forwarded-proto).
 */
export function buildRedirectUri(reqUrl: URL, forwardedProto: string | null): string {
  const proto = forwardedProto ?? reqUrl.protocol.replace(":", "");
  const host = reqUrl.host;
  return `${proto}://${host}/api/auth/callback`;
}

export function authorizeUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId(),
    redirect_uri: redirectUri,
    scope: "identity identity.memberships",
  });
  return `${PATREON_AUTH_URL}?${params.toString()}`;
}

export type PatreonIdentity = {
  name: string;
  pledge_cents: number;
};

export async function exchangeCodeForIdentity(
  code: string,
  redirectUri: string,
): Promise<PatreonIdentity | null> {
  const tokenResp = await fetch(PATREON_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenResp.ok) return null;
  const token = (await tokenResp.json()) as { access_token?: string };
  if (!token.access_token) return null;

  const idUrl = new URL(PATREON_IDENTITY_URL);
  idUrl.searchParams.set("include", "memberships");
  idUrl.searchParams.set("fields[user]", "full_name");
  idUrl.searchParams.set(
    "fields[member]",
    "currently_entitled_amount_cents,patron_status",
  );

  const idResp = await fetch(idUrl, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!idResp.ok) return null;
  const idData = (await idResp.json()) as {
    data?: { attributes?: { full_name?: string } };
    included?: Array<{
      type?: string;
      attributes?: {
        currently_entitled_amount_cents?: number;
        patron_status?: string;
      };
    }>;
  };

  const name = idData.data?.attributes?.full_name ?? "Patron";
  let pledge_cents = 0;
  for (const item of idData.included ?? []) {
    if (item.type === "member" && item.attributes?.patron_status === "active_patron") {
      pledge_cents = Math.max(pledge_cents, item.attributes.currently_entitled_amount_cents ?? 0);
    }
  }
  return { name, pledge_cents };
}

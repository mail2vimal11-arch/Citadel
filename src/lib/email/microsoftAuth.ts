import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

// ============================================================================
// Microsoft identity platform (Entra ID) OAuth 2.0 + token storage for the
// Microsoft 365 / Outlook connector.
//
// Mirrors googleAuth.ts: a read-only "Sign in with Microsoft" flow that lets
// Citadel fetch a user's mail via Microsoft Graph (least-privilege scope:
// Mail.Read). It uses the `/common` authority so BOTH work/school (Microsoft
// 365) and personal Outlook.com accounts can connect. Spoken directly over fetch
// — no SDK — to keep the codebase minimal.
//
// SECURITY: we never log tokens or email content. The refresh token (granted via
// the offline_access scope) is the only long-lived secret here.
//
// TODO(production): per-user tokens belong in a Canadian-controlled secrets
// manager (never a file, never the repo, never the app DB), encrypted at rest,
// with rotation + revocation. The prototype uses a local gitignored file because
// it is single-machine.
// ============================================================================

const AUTHORITY = "https://login.microsoftonline.com/common/oauth2/v2.0";
const AUTH_URL = `${AUTHORITY}/authorize`;
const TOKEN_URL = `${AUTHORITY}/token`;
const GRAPH_ME = "https://graph.microsoft.com/v1.0/me";
// Least privilege: read-only mail. offline_access => refresh token; User.Read =>
// read the signed-in user's profile (to show which account is connected).
const SCOPE = "offline_access Mail.Read User.Read";

export function microsoftOAuthConfigured(): boolean {
  return Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
}

const clientId = () => process.env.MICROSOFT_CLIENT_ID ?? "";
const clientSecret = () => process.env.MICROSOFT_CLIENT_SECRET ?? "";
const redirectUri = () =>
  process.env.MICROSOFT_OAUTH_REDIRECT ?? "http://localhost:3000/api/auth/microsoft/callback";

// ---- token storage ----------------------------------------------------------
type StoredToken = {
  refreshToken: string;
  accessToken?: string;
  expiresAt?: number; // epoch ms
  email?: string;
};

const TOKEN_DIR = path.join(process.cwd(), ".citadel-secrets");
// Tokens are stored PER USER so tenants never share a Microsoft connection.
const tokenFile = (userId: string) =>
  path.join(TOKEN_DIR, `microsoft-${userId.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`);

async function readToken(userId: string): Promise<StoredToken | null> {
  try {
    return JSON.parse(await fs.readFile(tokenFile(userId), "utf8")) as StoredToken;
  } catch {
    return null;
  }
}

async function writeToken(userId: string, tok: StoredToken): Promise<void> {
  await fs.mkdir(TOKEN_DIR, { recursive: true });
  await fs.writeFile(tokenFile(userId), JSON.stringify(tok, null, 2), { mode: 0o600 });
}

export async function clearMicrosoftToken(userId: string): Promise<void> {
  try {
    await fs.unlink(tokenFile(userId));
  } catch {
    /* already gone */
  }
}

export async function microsoftConnection(
  userId: string
): Promise<{ connected: boolean; email?: string }> {
  const tok = await readToken(userId);
  if (!tok?.refreshToken) return { connected: false };
  return { connected: true, email: tok.email };
}

// ---- consent + CSRF state ---------------------------------------------------
export function newState(): string {
  return randomBytes(16).toString("hex");
}

export function buildConsentUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPE,
    response_mode: "query",
    prompt: "select_account",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

// ---- code exchange + refresh ------------------------------------------------
export async function exchangeCodeForToken(userId: string, code: string): Promise<void> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
      scope: SCOPE,
    }),
  });
  if (!res.ok) throw new Error(`Microsoft token exchange failed (${res.status})`);
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  // The refresh token is granted because we request the offline_access scope.
  if (!data.refresh_token) throw new Error("No refresh token returned from Microsoft.");

  const tok: StoredToken = {
    refreshToken: data.refresh_token,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    email: await fetchEmail(data.access_token).catch(() => undefined),
  };
  await writeToken(userId, tok);
}

async function refreshAccessToken(userId: string, tok: StoredToken): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: tok.refreshToken,
      client_id: clientId(),
      client_secret: clientSecret(),
      grant_type: "refresh_token",
      scope: SCOPE,
    }),
  });
  if (!res.ok) throw new Error(`Microsoft token refresh failed (${res.status})`);
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  await writeToken(userId, {
    ...tok,
    // Microsoft may rotate the refresh token on use — keep the newest.
    refreshToken: data.refresh_token ?? tok.refreshToken,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
  return data.access_token;
}

// Returns a valid access token, refreshing if needed. Throws if not connected.
export async function getAccessToken(userId: string): Promise<string> {
  const tok = await readToken(userId);
  if (!tok?.refreshToken) throw new Error("Microsoft 365 is not connected.");
  if (tok.accessToken && tok.expiresAt && tok.expiresAt - Date.now() > 60_000) {
    return tok.accessToken;
  }
  return refreshAccessToken(userId, tok);
}

async function fetchEmail(accessToken: string): Promise<string | undefined> {
  const res = await fetch(GRAPH_ME, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return undefined;
  const data = (await res.json()) as { mail?: string; userPrincipalName?: string };
  return data.mail ?? data.userPrincipalName;
}

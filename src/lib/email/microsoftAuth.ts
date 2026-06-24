import { randomBytes } from "crypto";
import {
  readAccounts,
  upsertAccount,
  removeAccount,
  getAccount,
  listConnections,
  type StoredAccount,
} from "./accountStore";

// ============================================================================
// Microsoft identity platform OAuth 2.0 + token storage (multi-account).
//
// Read-only "Sign in with Microsoft" via Microsoft Graph (least-privilege
// Mail.Read) on the /common authority (work/school + personal Outlook). A user
// can connect SEVERAL accounts; tokens are kept per-account via accountStore.
//
// SECURITY: we never log tokens or email content. The refresh token (offline_access)
// is the only long-lived secret here.
//
// TODO(production): per-user tokens in a Canadian-controlled secrets manager —
// never a file, the repo, or the app DB. Encrypted at rest, with rotation.
// ============================================================================

const PREFIX = "microsoft";
const AUTHORITY = "https://login.microsoftonline.com/common/oauth2/v2.0";
const AUTH_URL = `${AUTHORITY}/authorize`;
const TOKEN_URL = `${AUTHORITY}/token`;
const GRAPH_ME = "https://graph.microsoft.com/v1.0/me";
const SCOPE = "offline_access Mail.Read User.Read";

export function microsoftOAuthConfigured(): boolean {
  return Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
}

const clientId = () => process.env.MICROSOFT_CLIENT_ID ?? "";
const clientSecret = () => process.env.MICROSOFT_CLIENT_SECRET ?? "";
const redirectUri = () =>
  process.env.MICROSOFT_OAUTH_REDIRECT ?? "http://localhost:3000/api/auth/microsoft/callback";

// ---- connection state -------------------------------------------------------
export async function microsoftAccounts(
  userId: string
): Promise<{ accountId: string; email?: string }[]> {
  return listConnections(PREFIX, userId);
}

export async function microsoftConnection(
  userId: string
): Promise<{ connected: boolean; accounts: number }> {
  const accts = await readAccounts(PREFIX, userId);
  return { connected: accts.length > 0, accounts: accts.length };
}

export async function clearMicrosoftToken(userId: string, accountId?: string): Promise<number> {
  return removeAccount(PREFIX, userId, accountId);
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
    prompt: "select_account", // lets a different account be added
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
  if (!data.refresh_token) throw new Error("No refresh token returned from Microsoft.");

  const email = await fetchEmail(data.access_token).catch(() => undefined);
  await upsertAccount(PREFIX, userId, {
    accountId: (email ?? `acct-${Date.now()}`).toLowerCase(),
    email,
    refreshToken: data.refresh_token,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
}

async function refreshAccessToken(userId: string, acct: StoredAccount): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: acct.refreshToken,
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
  await upsertAccount(PREFIX, userId, {
    ...acct,
    // Microsoft may rotate the refresh token on use — keep the newest.
    refreshToken: data.refresh_token ?? acct.refreshToken,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
  return data.access_token;
}

export async function getAccessToken(userId: string, accountId: string): Promise<string> {
  const acct = await getAccount(PREFIX, userId, accountId);
  if (!acct?.refreshToken) throw new Error("Microsoft 365 account is not connected.");
  if (acct.accessToken && acct.expiresAt && acct.expiresAt - Date.now() > 60_000) {
    return acct.accessToken;
  }
  return refreshAccessToken(userId, acct);
}

async function fetchEmail(accessToken: string): Promise<string | undefined> {
  const res = await fetch(GRAPH_ME, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return undefined;
  const data = (await res.json()) as { mail?: string; userPrincipalName?: string };
  return data.mail ?? data.userPrincipalName;
}

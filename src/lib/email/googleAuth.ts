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
// Google OAuth 2.0 + token storage for the Gmail connector (multi-account).
//
// Read-only "Sign in with Google" (least-privilege scope gmail.readonly). A user
// can connect SEVERAL Gmail accounts; tokens are kept per-account via
// accountStore. Spoken directly over fetch — no SDK — to stay minimal.
//
// SECURITY: we never log tokens or email content. The refresh token is the only
// long-lived secret here.
//
// TODO(production): per-user tokens in a Canadian-controlled secrets manager —
// never a file, the repo, or the app DB. Encrypted at rest, with rotation.
// ============================================================================

const PREFIX = "google";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export function googleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

const clientId = () => process.env.GOOGLE_CLIENT_ID ?? "";
const clientSecret = () => process.env.GOOGLE_CLIENT_SECRET ?? "";
const redirectUri = () =>
  process.env.GOOGLE_OAUTH_REDIRECT ?? "http://localhost:3000/api/auth/google/callback";

// ---- connection state -------------------------------------------------------
export async function googleAccounts(userId: string): Promise<{ accountId: string; email?: string }[]> {
  return listConnections(PREFIX, userId);
}

// Back-compat helper used by the source selector: is at least one account on?
export async function googleConnection(userId: string): Promise<{ connected: boolean; accounts: number }> {
  const accts = await readAccounts(PREFIX, userId);
  return { connected: accts.length > 0, accounts: accts.length };
}

export async function clearGoogleToken(userId: string, accountId?: string): Promise<number> {
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
    access_type: "offline", // ask for a refresh token
    // Force BOTH the account chooser (so a 2nd account can be added) and a fresh
    // refresh token on every connect.
    prompt: "consent select_account",
    include_granted_scopes: "true",
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
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status})`);
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  if (!data.refresh_token) throw new Error("No refresh token returned from Google.");

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
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh failed (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  await upsertAccount(PREFIX, userId, {
    ...acct,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
  return data.access_token;
}

// Valid access token for one account, refreshing if needed.
export async function getAccessToken(userId: string, accountId: string): Promise<string> {
  const acct = await getAccount(PREFIX, userId, accountId);
  if (!acct?.refreshToken) throw new Error("Gmail account is not connected.");
  if (acct.accessToken && acct.expiresAt && acct.expiresAt - Date.now() > 60_000) {
    return acct.accessToken;
  }
  return refreshAccessToken(userId, acct);
}

async function fetchEmail(accessToken: string): Promise<string | undefined> {
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return undefined;
  const data = (await res.json()) as { emailAddress?: string };
  return data.emailAddress;
}

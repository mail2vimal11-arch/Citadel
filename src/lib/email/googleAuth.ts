import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

// ============================================================================
// Google OAuth 2.0 + token storage for the Gmail connector.
//
// Handles the read-only "Sign in with Google" flow that lets Citadel fetch a
// user's Gmail (least-privilege scope: gmail.readonly). It speaks the OAuth
// endpoints directly over fetch — no heavy SDK — to keep this codebase minimal.
//
// SECURITY: we never log tokens or email content. The refresh token is the only
// long-lived secret here.
//
// TODO(production): this stores the refresh token in a local, gitignored JSON
// file because the prototype is single-user and runs on one machine. In
// production, tokens are PER-USER secrets and MUST live in a real
// Canadian-controlled secrets manager (never a file, never the repo, never the
// app database), encrypted at rest, with rotation + revocation.
// ============================================================================

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
// Least privilege: read-only Gmail. Citadel can never send, delete, or modify.
const SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export function googleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

const clientId = () => process.env.GOOGLE_CLIENT_ID ?? "";
const clientSecret = () => process.env.GOOGLE_CLIENT_SECRET ?? "";
const redirectUri = () =>
  process.env.GOOGLE_OAUTH_REDIRECT ?? "http://localhost:3000/api/auth/google/callback";

// ---- token storage ----------------------------------------------------------
type StoredToken = {
  refreshToken: string;
  accessToken?: string;
  expiresAt?: number; // epoch ms
  email?: string;
};

const TOKEN_DIR = path.join(process.cwd(), ".citadel-secrets");
const TOKEN_FILE = path.join(TOKEN_DIR, "google-token.json");

async function readToken(): Promise<StoredToken | null> {
  try {
    return JSON.parse(await fs.readFile(TOKEN_FILE, "utf8")) as StoredToken;
  } catch {
    return null;
  }
}

async function writeToken(tok: StoredToken): Promise<void> {
  await fs.mkdir(TOKEN_DIR, { recursive: true });
  // Owner read/write only.
  await fs.writeFile(TOKEN_FILE, JSON.stringify(tok, null, 2), { mode: 0o600 });
}

export async function clearGoogleToken(): Promise<void> {
  try {
    await fs.unlink(TOKEN_FILE);
  } catch {
    /* already gone */
  }
}

export async function googleConnection(): Promise<{ connected: boolean; email?: string }> {
  const tok = await readToken();
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
    access_type: "offline", // ask for a refresh token
    prompt: "consent", // force a refresh token on every (re)connect
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

// ---- code exchange + refresh ------------------------------------------------
export async function exchangeCodeForToken(code: string): Promise<void> {
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
  // Google returns a refresh token only with access_type=offline + prompt=consent.
  if (!data.refresh_token) throw new Error("No refresh token returned from Google.");

  const tok: StoredToken = {
    refreshToken: data.refresh_token,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    email: await fetchEmail(data.access_token).catch(() => undefined),
  };
  await writeToken(tok);
}

async function refreshAccessToken(tok: StoredToken): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: tok.refreshToken,
      client_id: clientId(),
      client_secret: clientSecret(),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh failed (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  await writeToken({
    ...tok,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
  return data.access_token;
}

// Returns a valid access token, refreshing if needed. Throws if not connected.
export async function getAccessToken(): Promise<string> {
  const tok = await readToken();
  if (!tok?.refreshToken) throw new Error("Gmail is not connected.");
  // Reuse the cached access token if it has >60s of life left.
  if (tok.accessToken && tok.expiresAt && tok.expiresAt - Date.now() > 60_000) {
    return tok.accessToken;
  }
  return refreshAccessToken(tok);
}

async function fetchEmail(accessToken: string): Promise<string | undefined> {
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return undefined;
  const data = (await res.json()) as { emailAddress?: string };
  return data.emailAddress;
}

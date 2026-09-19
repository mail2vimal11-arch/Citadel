import { promises as fs } from "fs";
import path from "path";

// ============================================================================
// Per-account OAuth token store (P5.5 — multi-account mailbox).
//
// A user can connect SEVERAL accounts per provider (work + personal Gmail,
// multiple Outlook tenants). Tokens live in one gitignored JSON file per user
// per provider — now holding a LIST of accounts instead of a single token.
// Shared by googleAuth + microsoftAuth; each keeps its own OAuth specifics.
//
// Legacy migration: the old single-token shape ({ refreshToken, ... }) is folded
// into a one-element list on read, so already-connected users never re-auth.
//
// TODO(production): per-user tokens belong in a Canadian-controlled secrets
// manager (never a file or the app DB), encrypted at rest, with rotation +
// revocation. This file exists only because the prototype is single-machine.
// ============================================================================

export type StoredAccount = {
  accountId: string; // stable per provider (we use the lowercased email)
  email?: string;
  refreshToken: string;
  accessToken?: string;
  expiresAt?: number; // epoch ms
};

type LegacyToken = { refreshToken?: string; accessToken?: string; expiresAt?: number; email?: string };
type FileShape = { accounts: StoredAccount[] };

const TOKEN_DIR = path.join(process.cwd(), ".citadel-secrets");
const tokenFile = (prefix: string, userId: string) =>
  path.join(TOKEN_DIR, `${prefix}-${userId.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`);

export async function readAccounts(prefix: string, userId: string): Promise<StoredAccount[]> {
  let raw: unknown;
  try {
    raw = JSON.parse(await fs.readFile(tokenFile(prefix, userId), "utf8"));
  } catch {
    return [];
  }
  const obj = raw as Partial<FileShape> & LegacyToken;
  if (Array.isArray(obj.accounts)) return obj.accounts.filter((a) => a?.refreshToken);
  // Legacy single-token file → one account.
  if (obj.refreshToken) {
    return [
      {
        accountId: (obj.email ?? "default").toLowerCase(),
        email: obj.email,
        refreshToken: obj.refreshToken,
        accessToken: obj.accessToken,
        expiresAt: obj.expiresAt,
      },
    ];
  }
  return [];
}

async function writeAccounts(prefix: string, userId: string, accounts: StoredAccount[]): Promise<void> {
  await fs.mkdir(TOKEN_DIR, { recursive: true });
  if (accounts.length === 0) {
    // No accounts left → remove the file entirely.
    await fs.unlink(tokenFile(prefix, userId)).catch(() => {});
    return;
  }
  const body: FileShape = { accounts };
  await fs.writeFile(tokenFile(prefix, userId), JSON.stringify(body, null, 2), { mode: 0o600 });
}

// Insert or replace an account (keyed by accountId).
export async function upsertAccount(prefix: string, userId: string, acct: StoredAccount): Promise<void> {
  const accounts = await readAccounts(prefix, userId);
  const i = accounts.findIndex((a) => a.accountId === acct.accountId);
  if (i >= 0) accounts[i] = acct;
  else accounts.push(acct);
  await writeAccounts(prefix, userId, accounts);
}

// Remove one account (or, when accountId is omitted, all of them). Returns the
// number of accounts that remain connected.
export async function removeAccount(
  prefix: string,
  userId: string,
  accountId?: string
): Promise<number> {
  if (!accountId) {
    await writeAccounts(prefix, userId, []);
    return 0;
  }
  const remaining = (await readAccounts(prefix, userId)).filter((a) => a.accountId !== accountId);
  await writeAccounts(prefix, userId, remaining);
  return remaining.length;
}

export async function getAccount(
  prefix: string,
  userId: string,
  accountId: string
): Promise<StoredAccount | null> {
  return (await readAccounts(prefix, userId)).find((a) => a.accountId === accountId) ?? null;
}

// Non-sensitive summary for the UI / status routes.
export async function listConnections(
  prefix: string,
  userId: string
): Promise<{ accountId: string; email?: string }[]> {
  return (await readAccounts(prefix, userId)).map((a) => ({ accountId: a.accountId, email: a.email }));
}

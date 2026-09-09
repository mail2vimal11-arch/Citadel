import type { RawEmail } from "@/lib/types";
import { SAMPLE_EMAILS } from "./sampleEmails";
import { googleAccounts, getAccessToken as googleToken } from "./googleAuth";
import { microsoftAccounts, getAccessToken as microsoftToken } from "./microsoftAuth";
import { toRawEmail as gmailToRaw, type GmailMessage } from "./gmailParse";
import { toRawEmail as graphToRaw, type GraphMessage } from "./graphParse";

// ============================================================================
// getOriginalEmail — fetch ONE message's original body live, ON DEMAND.
//
// This backs the reading-pane "View original" action. It keeps Citadel's core
// promise intact: the raw body is fetched from the provider IN MEMORY when the
// user asks, handed straight back to that user's browser, and is NEVER written
// to the database, an audit event, or a log. It is the same read-only,
// nothing-stored path the pipeline uses — just for a single message on request.
//
// TODO(production): the returned value is plaintext email content. It must never
// be persisted or logged anywhere; treat it like the in-flight pipeline body.
// ============================================================================
const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";
const GRAPH = "https://graph.microsoft.com/v1.0/me/messages";

export async function getOriginalEmail(userId: string, sourceId: string): Promise<RawEmail | null> {
  if (sourceId.startsWith("gmail:")) return fetchGmail(userId, sourceId.slice("gmail:".length));
  if (sourceId.startsWith("m365:")) return fetchGraph(userId, sourceId.slice("m365:".length));
  // Synthetic sample data: the "original" is the seed message itself.
  const sample = SAMPLE_EMAILS.find((e) => e.id === sourceId);
  return sample ? { ...sample } : null;
}

// A namespaced ref is "<accountId>:<messageId>" (multi-account) or just
// "<messageId>" (legacy single account). Provider message ids never contain a
// colon, so the accountId is everything before the LAST colon.
function splitRef(rest: string): { accountId?: string; msgId: string } {
  const i = rest.lastIndexOf(":");
  return i === -1 ? { msgId: rest } : { accountId: rest.slice(0, i), msgId: rest.slice(i + 1) };
}

async function fetchGmail(userId: string, rest: string): Promise<RawEmail | null> {
  const { accountId, msgId } = splitRef(rest);
  // Legacy ids carry no account — fall back to the user's first Gmail account.
  const acct = accountId ?? (await googleAccounts(userId))[0]?.accountId;
  if (!acct) return null;
  const token = await googleToken(userId, acct);
  const res = await fetch(`${GMAIL}/messages/${encodeURIComponent(msgId)}?format=full`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null; // revoked/deleted/unreadable → nothing to show
  return gmailToRaw((await res.json()) as GmailMessage, accountId);
}

async function fetchGraph(userId: string, rest: string): Promise<RawEmail | null> {
  const { accountId, msgId } = splitRef(rest);
  const acct = accountId ?? (await microsoftAccounts(userId))[0]?.accountId;
  if (!acct) return null;
  const token = await microsoftToken(userId, acct);
  const url =
    `${GRAPH}/${encodeURIComponent(msgId)}` +
    `?$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,body`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  return graphToRaw((await res.json()) as GraphMessage, accountId);
}

import type { EmailSource } from "./EmailSource";
import type { RawEmail } from "@/lib/types";
import { getAccessToken } from "./googleAuth";

// ============================================================================
// GmailSource — read-only Gmail connector (Gmail API + OAuth 2.0).
//
// Implements the EmailSource contract by fetching the most recent inbox
// messages from the connected account using the least-privilege
// `gmail.readonly` scope. Raw bodies are returned to the pipeline IN MEMORY
// ONLY and are never written to the database — the pipeline persists only the
// encrypted AI-derived data.
//
// TODO(production): per-user tokens from a secrets manager; pagination + sync
// tokens for incremental fetch; run only on Canadian-controlled infrastructure.
// ============================================================================

const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";

// How many recent messages to pull. The free tier ultimately caps this at 2
// (see ROADMAP Phase 6 — billing/gating); configurable here for testing.
const MAX_MESSAGES = Number(process.env.GMAIL_MAX_MESSAGES ?? "10");
// Defensive cap on body length passed onward (keeps prompts sane; the free tier
// also limits text). TODO(production): make this a per-plan setting.
const MAX_BODY_CHARS = Number(process.env.GMAIL_MAX_BODY_CHARS ?? "8000");

export class GmailSource implements EmailSource {
  readonly name = "Gmail (read-only, via Gmail API)";

  async listEmails(): Promise<RawEmail[]> {
    const token = await getAccessToken();
    const auth = { Authorization: `Bearer ${token}` };

    // 1) List recent message ids in the inbox.
    const listRes = await fetch(
      `${GMAIL}/messages?maxResults=${MAX_MESSAGES}&q=${encodeURIComponent("in:inbox")}`,
      { headers: auth }
    );
    if (!listRes.ok) throw new Error(`Gmail list failed (${listRes.status})`);
    const list = (await listRes.json()) as { messages?: { id: string }[] };
    const ids = (list.messages ?? []).map((m) => m.id);

    // 2) Fetch each full message and map it into the RawEmail shape.
    const emails: RawEmail[] = [];
    for (const id of ids) {
      const msgRes = await fetch(`${GMAIL}/messages/${id}?format=full`, { headers: auth });
      if (!msgRes.ok) continue; // skip an unreadable message rather than fail the batch
      emails.push(toRawEmail((await msgRes.json()) as GmailMessage));
    }
    return emails;
  }
}

// ---- Gmail payload parsing --------------------------------------------------
type GmailHeader = { name: string; value: string };
type GmailPart = {
  mimeType?: string;
  headers?: GmailHeader[];
  body?: { data?: string };
  parts?: GmailPart[];
};
type GmailMessage = {
  id: string;
  internalDate?: string; // epoch ms, as a string
  payload?: GmailPart;
};

function header(headers: GmailHeader[] | undefined, name: string): string {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function decodeB64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

// Walk the MIME tree, preferring text/plain; fall back to stripped text/html;
// finally a single-part body.
function extractBody(part: GmailPart | undefined): string {
  if (!part) return "";
  const plain = findPart(part, "text/plain");
  if (plain?.body?.data) return decodeB64Url(plain.body.data);
  const html = findPart(part, "text/html");
  if (html?.body?.data) return stripHtml(decodeB64Url(html.body.data));
  if (part.body?.data) return decodeB64Url(part.body.data);
  return "";
}

function findPart(part: GmailPart, mime: string): GmailPart | undefined {
  if (part.mimeType === mime && part.body?.data) return part;
  for (const child of part.parts ?? []) {
    const found = findPart(child, mime);
    if (found) return found;
  }
  return undefined;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function toRawEmail(msg: GmailMessage): RawEmail {
  const headers = msg.payload?.headers;
  const receivedAt = msg.internalDate
    ? new Date(Number(msg.internalDate)).toISOString()
    : new Date().toISOString();
  let body = extractBody(msg.payload).trim();
  if (body.length > MAX_BODY_CHARS) body = body.slice(0, MAX_BODY_CHARS) + "…";
  return {
    id: `gmail:${msg.id}`, // namespaced so it never collides with sample ids
    from: header(headers, "From"),
    to: header(headers, "To"),
    subject: header(headers, "Subject"),
    receivedAt,
    body,
  };
}

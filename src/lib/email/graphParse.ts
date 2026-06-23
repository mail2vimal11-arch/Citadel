import type { RawEmail } from "@/lib/types";
import { stripHtml } from "./gmailParse";

// ============================================================================
// Pure Microsoft Graph payload parsing — split out of MicrosoftGraphSource so it
// can be unit tested without any network or OAuth. No side effects, no fetch.
//
// Maps a Graph `message` resource (from /me/.../messages) into the app's neutral
// RawEmail shape, exactly as gmailParse does for Gmail. The rest of the app never
// learns which provider a message came from.
// ============================================================================

// Defensive cap on body length (keeps prompts sane; the free tier also limits
// text). TODO(production): make this a per-plan setting.
const MAX_BODY_CHARS = Number(process.env.MICROSOFT_MAX_BODY_CHARS ?? "8000");

export type GraphAddress = { name?: string; address?: string };
export type GraphRecipient = { emailAddress?: GraphAddress };
export type GraphMessage = {
  id: string;
  subject?: string | null;
  bodyPreview?: string;
  receivedDateTime?: string; // ISO 8601
  from?: GraphRecipient | null;
  toRecipients?: GraphRecipient[];
  body?: { contentType?: "text" | "html" | string; content?: string };
};

// "Name <addr>" when a display name exists, else just the address.
export function formatAddress(r: GraphRecipient | null | undefined): string {
  const a = r?.emailAddress;
  if (!a) return "";
  if (a.name && a.address) return `${a.name} <${a.address}>`;
  return a.address ?? a.name ?? "";
}

export function joinRecipients(rs: GraphRecipient[] | undefined): string {
  return (rs ?? []).map(formatAddress).filter(Boolean).join(", ");
}

// Prefer the structured body; HTML is stripped to text. Fall back to the
// Graph-provided bodyPreview when no full body is present.
export function extractBody(msg: GraphMessage): string {
  const body = msg.body;
  if (body?.content) {
    return body.contentType === "html" ? stripHtml(body.content) : body.content.trim();
  }
  return (msg.bodyPreview ?? "").trim();
}

export function toRawEmail(msg: GraphMessage): RawEmail {
  const receivedAt = msg.receivedDateTime
    ? new Date(msg.receivedDateTime).toISOString()
    : new Date().toISOString();
  let body = extractBody(msg).trim();
  if (body.length > MAX_BODY_CHARS) body = body.slice(0, MAX_BODY_CHARS) + "…";
  return {
    id: `m365:${msg.id}`, // namespaced so it never collides with gmail/sample ids
    from: formatAddress(msg.from),
    to: joinRecipients(msg.toRecipients),
    subject: msg.subject ?? "",
    receivedAt,
    body,
  };
}

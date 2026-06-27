import type { RawEmail } from "@/lib/types";

// ============================================================================
// Pure Gmail payload parsing — split out of GmailSource so it can be unit
// tested without any network or OAuth. No side effects, no fetch, no fs.
// ============================================================================

// Defensive cap on body length passed onward (keeps prompts sane; the free tier
// also limits text). TODO(production): make this a per-plan setting.
const MAX_BODY_CHARS = Number(process.env.GMAIL_MAX_BODY_CHARS ?? "8000");

export type GmailHeader = { name: string; value: string };
export type GmailPart = {
  mimeType?: string;
  headers?: GmailHeader[];
  body?: { data?: string };
  parts?: GmailPart[];
};
export type GmailMessage = {
  id: string;
  internalDate?: string; // epoch ms, as a string
  payload?: GmailPart;
};

export function header(headers: GmailHeader[] | undefined, name: string): string {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export function decodeB64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

export function findPart(part: GmailPart, mime: string): GmailPart | undefined {
  if (part.mimeType === mime && part.body?.data) return part;
  for (const child of part.parts ?? []) {
    const found = findPart(child, mime);
    if (found) return found;
  }
  return undefined;
}

export function stripHtml(html: string): string {
  return (
    html
      // Drop <script>/<style> blocks. The end-tag pattern tolerates attributes
      // and whitespace ("</script >", "</style\n>") so content can't slip past
      // the filter — CodeQL js/bad-tag-filter flags the naive `</script>` form.
      .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      // Decode the few entities we care about. `&amp;` MUST be decoded LAST, or
      // an input like "&amp;lt;" would double-unescape to "<" instead of "&lt;"
      // (CodeQL js/double-escaping).
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim()
  );
}

// Walk the MIME tree, preferring text/plain; fall back to stripped text/html;
// finally a single-part body.
export function extractBody(part: GmailPart | undefined): string {
  if (!part) return "";
  const plain = findPart(part, "text/plain");
  if (plain?.body?.data) return decodeB64Url(plain.body.data);
  const html = findPart(part, "text/html");
  if (html?.body?.data) return stripHtml(decodeB64Url(html.body.data));
  if (part.body?.data) return decodeB64Url(part.body.data);
  return "";
}

export function toRawEmail(msg: GmailMessage, accountId?: string): RawEmail {
  const headers = msg.payload?.headers;
  const receivedAt = msg.internalDate
    ? new Date(Number(msg.internalDate)).toISOString()
    : new Date().toISOString();
  let body = extractBody(msg.payload).trim();
  if (body.length > MAX_BODY_CHARS) body = body.slice(0, MAX_BODY_CHARS) + "…";
  return {
    // Namespaced so it never collides with sample ids; the optional accountId
    // keeps two connected Gmail accounts from colliding (P5.5 multi-account).
    id: accountId ? `gmail:${accountId}:${msg.id}` : `gmail:${msg.id}`,
    from: header(headers, "From"),
    to: header(headers, "To"),
    subject: header(headers, "Subject"),
    receivedAt,
    body,
  };
}

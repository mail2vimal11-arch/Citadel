// ============================================================================
// Outgoing-message construction (send feature) — PURE, no network.
//
// Builds an RFC 5322 message for the Gmail send API (which wants a base64url
// MIME string). Microsoft Graph takes JSON instead (see send.ts), so this is
// Gmail-shaped; both share the OutgoingMessage type. Unit-tested with no I/O.
// ============================================================================

export type OutgoingMessage = {
  to: string;
  subject: string;
  body: string;
  // Optional threading headers (for a proper reply). We fetch/keep these only
  // when replying; a plain compose omits them.
  inReplyTo?: string;
  references?: string;
};

// Fold a header value safely onto one line (strip CR/LF to avoid injection).
function headerValue(v: string): string {
  return v.replace(/[\r\n]+/g, " ").trim();
}

// RFC 5322 plain-text message. `From` is omitted — Gmail/Graph stamp the
// authenticated account as the sender, which is exactly what we want.
export function buildMimeMessage(msg: OutgoingMessage): string {
  const lines = [
    `To: ${headerValue(msg.to)}`,
    `Subject: ${headerValue(msg.subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
  ];
  if (msg.inReplyTo) lines.push(`In-Reply-To: ${headerValue(msg.inReplyTo)}`);
  if (msg.references) lines.push(`References: ${headerValue(msg.references)}`);
  lines.push("", msg.body.replace(/\r?\n/g, "\r\n"));
  return lines.join("\r\n");
}

// URL-safe base64 (Gmail's `raw` field), no padding.
export function base64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// "Re: x" without doubling an existing "Re:".
export function replySubject(subject: string): string {
  return /^re:/i.test(subject.trim()) ? subject.trim() : `Re: ${subject.trim()}`;
}

// Pull the bare address out of `Name <email>` (or return the trimmed input).
export function extractEmail(addr: string): string {
  const m = addr.match(/<([^>]+)>/);
  return (m ? m[1] : addr).trim();
}

// Split a To field ("a@x.com, Name <b@y.com>") into bare addresses.
export function parseRecipients(to: string): string[] {
  return to
    .split(",")
    .map((p) => extractEmail(p))
    .filter(Boolean);
}

// Build the reply's References header: the original thread's References plus the
// message we're replying to, space-joined and de-duplicated (RFC 5322 §3.6.4).
export function mergeReferences(existing: string | undefined, messageId: string | undefined): string {
  const ids = `${existing ?? ""} ${messageId ?? ""}`.trim().split(/\s+/).filter(Boolean);
  return [...new Set(ids)].join(" ");
}

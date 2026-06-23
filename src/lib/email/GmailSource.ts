import type { EmailSource } from "./EmailSource";
import type { RawEmail } from "@/lib/types";
import { getAccessToken } from "./googleAuth";
import { toRawEmail, type GmailMessage } from "./gmailParse";

// ============================================================================
// GmailSource — read-only Gmail connector (Gmail API + OAuth 2.0).
//
// Implements the EmailSource contract by fetching the most recent inbox
// messages from the connected account using the least-privilege
// `gmail.readonly` scope. Raw bodies are returned to the pipeline IN MEMORY
// ONLY and are never written to the database — the pipeline persists only the
// encrypted AI-derived data. Payload parsing lives in ./gmailParse (testable).
//
// TODO(production): per-user tokens from a secrets manager; pagination + sync
// tokens for incremental fetch; run only on Canadian-controlled infrastructure.
// ============================================================================

const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";

// How many recent messages to pull. The free tier ultimately caps this at 2
// (see BUILD_PLAN P12 — billing/gating); configurable here for testing.
const MAX_MESSAGES = Number(process.env.GMAIL_MAX_MESSAGES ?? "10");

export class GmailSource implements EmailSource {
  readonly name = "Gmail (read-only, via Gmail API)";

  constructor(private readonly userId: string) {}

  async listEmails(): Promise<RawEmail[]> {
    const token = await getAccessToken(this.userId);
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

import type { EmailSource } from "./EmailSource";
import type { RawEmail } from "@/lib/types";
import { getAccessToken, microsoftAccounts } from "./microsoftAuth";
import { toRawEmail, type GraphMessage } from "./graphParse";

// ============================================================================
// MicrosoftGraphSource — read-only Microsoft 365 / Outlook connector.
//
// Implements the EmailSource contract by fetching the most recent inbox messages
// via Microsoft Graph using the least-privilege `Mail.Read` scope. Raw bodies
// are returned to the pipeline IN MEMORY ONLY and are never written to the
// database — the pipeline persists only the encrypted AI-derived data. Payload
// parsing lives in ./graphParse (testable, no network).
//
// TODO(production): per-user tokens from a secrets manager; delta queries for
// incremental sync; run only on Canadian-controlled infrastructure.
// ============================================================================

const GRAPH = "https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages";

// How many recent messages to pull. The free tier ultimately caps this at 2
// (see BUILD_PLAN P12 — billing/gating); configurable here for testing.
const MAX_MESSAGES = Number(process.env.MICROSOFT_MAX_MESSAGES ?? "10");

export class MicrosoftGraphSource implements EmailSource {
  readonly name = "Microsoft 365 (read-only, via Microsoft Graph)";

  constructor(private readonly userId: string) {}

  async listEmails(): Promise<RawEmail[]> {
    // Merge the newest inbox messages from EVERY connected Microsoft account.
    const accounts = await microsoftAccounts(this.userId);
    const emails: RawEmail[] = [];
    for (const acct of accounts) {
      try {
        emails.push(...(await this.listForAccount(acct.accountId)));
      } catch {
        continue; // skip a failing account rather than sink the inbox
      }
    }
    return emails;
  }

  private async listForAccount(accountId: string): Promise<RawEmail[]> {
    const token = await getAccessToken(this.userId, accountId);
    // One call: newest inbox messages with just the fields we map. Graph returns
    // the full body inline, so unlike Gmail we don't need a second fetch per id.
    const url =
      `${GRAPH}?$top=${MAX_MESSAGES}` +
      `&$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,body` +
      `&$orderby=${encodeURIComponent("receivedDateTime desc")}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Microsoft Graph list failed (${res.status})`);
    const data = (await res.json()) as { value?: GraphMessage[] };
    return (data.value ?? []).map((m) => toRawEmail(m, accountId));
  }
}

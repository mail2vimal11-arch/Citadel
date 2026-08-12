import type { EmailSource } from "./EmailSource";
import type { RawEmail } from "@/lib/types";

// ============================================================================
// STUB — not implemented in this prototype.
//
// TODO(production): Implement a read-only Gmail connector using the Gmail API
// with OAuth 2.0 (incremental authorization, least-privilege read-only scope
// `gmail.readonly`). Tokens must be stored in a real secrets manager, never in
// this repo or the demo database. All fetched content must be processed only on
// Canadian-controlled infrastructure and never persisted in raw form.
// ============================================================================
export class GmailSource implements EmailSource {
  readonly name = "Gmail (not implemented)";

  async listEmails(): Promise<RawEmail[]> {
    throw new Error(
      "GmailSource is a production stub and is not implemented in the prototype."
    );
  }
}

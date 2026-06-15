import type { EmailSource } from "./EmailSource";
import type { RawEmail } from "@/lib/types";

// ============================================================================
// STUB — not implemented in this prototype.
//
// TODO(production): Implement a read-only Microsoft 365 connector using the
// Microsoft Graph API with OAuth 2.0 and the least-privilege `Mail.Read` scope.
// Use the Azure AD tenant of the customer where required for data residency.
// Tokens must live in a real secrets manager. Fetched content must be processed
// only on Canadian-controlled infrastructure and never persisted in raw form.
// ============================================================================
export class MicrosoftGraphSource implements EmailSource {
  readonly name = "Microsoft 365 (not implemented)";

  async listEmails(): Promise<RawEmail[]> {
    throw new Error(
      "MicrosoftGraphSource is a production stub and is not implemented in the prototype."
    );
  }
}

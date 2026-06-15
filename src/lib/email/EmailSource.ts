import type { RawEmail } from "@/lib/types";

// ============================================================================
// EmailSource — the seam between this app and a user's mailbox.
//
// The whole product depends on swapping the demo source for real, read-only
// mailbox connectors WITHOUT changing the rest of the app. So every source
// implements this one small interface.
// ============================================================================
export interface EmailSource {
  readonly name: string;
  // Fetch the messages to be processed. Read-only by design.
  listEmails(): Promise<RawEmail[]>;
}

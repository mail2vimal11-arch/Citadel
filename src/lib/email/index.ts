import type { EmailSource } from "./EmailSource";
import { SampleDataSource } from "./SampleDataSource";
import { GmailSource } from "./GmailSource";
import { googleConnection } from "./googleAuth";

// ============================================================================
// getEmailSource — the ONE place that picks which mailbox the app reads from.
// Everything downstream (pipeline, AI, encryption, forget, audit) only ever
// sees the EmailSource interface, so swapping the mailbox changes nothing else.
//
//   EMAIL_SOURCE = auto | sample | gmail
//     auto   (default) = a connected Gmail account if present, else synthetic
//     sample           = always the synthetic demo data (free-tier preview)
//     gmail            = always Gmail (errors if no account is connected)
//
// `userId` scopes the mailbox: each user has their own Gmail connection/token.
// TODO(production): selection also becomes per-plan (free vs full), not just env.
// ============================================================================
export async function getEmailSource(userId: string): Promise<EmailSource> {
  const mode = (process.env.EMAIL_SOURCE ?? "auto").toLowerCase();
  if (mode === "sample") return new SampleDataSource();
  if (mode === "gmail") return new GmailSource(userId);
  // auto: use Gmail only if this user has actually connected an account.
  const conn = await googleConnection(userId);
  return conn.connected ? new GmailSource(userId) : new SampleDataSource();
}

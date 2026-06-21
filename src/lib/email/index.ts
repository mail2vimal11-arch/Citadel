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
// TODO(production): selection becomes per-user (each account brings its own
// connected mailbox + plan), not a process-wide env var.
// ============================================================================
export async function getEmailSource(): Promise<EmailSource> {
  const mode = (process.env.EMAIL_SOURCE ?? "auto").toLowerCase();
  if (mode === "sample") return new SampleDataSource();
  if (mode === "gmail") return new GmailSource();
  // auto: use Gmail only if an account is actually connected.
  const conn = await googleConnection();
  return conn.connected ? new GmailSource() : new SampleDataSource();
}

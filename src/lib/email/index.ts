import type { EmailSource } from "./EmailSource";
import { SampleDataSource } from "./SampleDataSource";
import { GmailSource } from "./GmailSource";
import { MicrosoftGraphSource } from "./MicrosoftGraphSource";
import { googleConnection } from "./googleAuth";
import { microsoftConnection } from "./microsoftAuth";

// ============================================================================
// getEmailSource — the ONE place that picks which mailbox the app reads from.
// Everything downstream (pipeline, AI, encryption, forget, audit) only ever
// sees the EmailSource interface, so swapping the mailbox changes nothing else.
//
//   EMAIL_SOURCE = auto | sample | gmail | microsoft
//     auto   (default) = a connected account if present (Gmail, else Microsoft),
//                        otherwise the synthetic demo data
//     sample           = always the synthetic demo data (free-tier preview)
//     gmail            = always Gmail (errors if no account is connected)
//     microsoft        = always Microsoft 365 (errors if no account is connected)
//
// `userId` scopes the mailbox: each user has their own connection/token.
// TODO(production): selection also becomes per-plan (free vs full), not just env.
// ============================================================================
export async function getEmailSource(userId: string): Promise<EmailSource> {
  const mode = (process.env.EMAIL_SOURCE ?? "auto").toLowerCase();
  if (mode === "sample") return new SampleDataSource();
  if (mode === "gmail") return new GmailSource(userId);
  if (mode === "microsoft" || mode === "m365") return new MicrosoftGraphSource(userId);

  // auto: use a real mailbox only if this user has actually connected one.
  if ((await googleConnection(userId)).connected) return new GmailSource(userId);
  if ((await microsoftConnection(userId)).connected) return new MicrosoftGraphSource(userId);
  return new SampleDataSource();
}

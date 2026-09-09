import type { EmailSource } from "./EmailSource";
import { SampleDataSource } from "./SampleDataSource";
import { GmailSource } from "./GmailSource";
import { MicrosoftGraphSource } from "./MicrosoftGraphSource";
import { CompositeSource } from "./CompositeSource";
import { googleConnection } from "./googleAuth";
import { microsoftConnection } from "./microsoftAuth";

// ============================================================================
// getEmailSource — the ONE place that picks which mailbox the app reads from.
// Everything downstream (pipeline, AI, encryption, forget, audit) only ever
// sees the EmailSource interface, so swapping the mailbox changes nothing else.
//
//   EMAIL_SOURCE = auto | sample | gmail | microsoft
//     auto   (default) = every connected account (Gmail + Microsoft) merged,
//                        otherwise the synthetic demo data
//     sample           = always the synthetic demo data (free-tier preview)
//     gmail            = all connected Gmail accounts
//     microsoft        = all connected Microsoft 365 accounts
//
// Each provider source is itself MULTI-ACCOUNT (P5.5): it merges every account
// the user connected for that provider. `userId` scopes everything.
// TODO(production): selection also becomes per-plan (free vs full) + an account cap.
// ============================================================================
export async function getEmailSource(userId: string): Promise<EmailSource> {
  const mode = (process.env.EMAIL_SOURCE ?? "auto").toLowerCase();
  if (mode === "sample") return new SampleDataSource();
  if (mode === "gmail") return new GmailSource(userId);
  if (mode === "microsoft" || mode === "m365") return new MicrosoftGraphSource(userId);

  // auto: merge whichever providers have at least one connected account.
  const [g, m] = await Promise.all([googleConnection(userId), microsoftConnection(userId)]);
  const sources: EmailSource[] = [];
  if (g.connected) sources.push(new GmailSource(userId));
  if (m.connected) sources.push(new MicrosoftGraphSource(userId));
  if (sources.length === 0) return new SampleDataSource();
  if (sources.length === 1) return sources[0];
  return new CompositeSource(sources);
}

import type { EmailSource } from "./EmailSource";
import type { RawEmail } from "@/lib/types";

// ============================================================================
// CompositeSource — merges several EmailSources into one (P5.5).
//
// Lets the inbox pull from Gmail AND Microsoft (each itself multi-account) in a
// single pass. Order is preserved per source; ids are already namespaced
// per provider+account so there's nothing to de-dupe. A failing source is
// skipped rather than sinking the whole inbox.
// ============================================================================
export class CompositeSource implements EmailSource {
  readonly name: string;

  constructor(private readonly sources: EmailSource[]) {
    this.name = `Merged mailbox (${sources.map((s) => s.name).join(" + ")})`;
  }

  async listEmails(): Promise<RawEmail[]> {
    const batches = await Promise.all(
      this.sources.map((s) => s.listEmails().catch(() => [] as RawEmail[]))
    );
    return batches.flat();
  }
}

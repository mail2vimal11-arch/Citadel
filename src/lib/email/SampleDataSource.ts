import type { EmailSource } from "./EmailSource";
import type { RawEmail } from "@/lib/types";
import { SAMPLE_EMAILS } from "./sampleEmails";

// The only EmailSource implemented in this prototype. Returns synthetic data
// from sampleEmails.ts. Nothing here touches a network or a real account.
export class SampleDataSource implements EmailSource {
  readonly name = "Synthetic sample data";

  async listEmails(): Promise<RawEmail[]> {
    // Return a copy so callers can't mutate the seed array.
    return SAMPLE_EMAILS.map((e) => ({ ...e }));
  }
}

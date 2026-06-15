import type { Priority, RawEmail } from "@/lib/types";

export interface TriageResult {
  priority: Priority;
  triageLabel: string;
}

// ============================================================================
// AIProvider — the seam between this app and whatever model does the thinking.
//
// The real product MUST run these on Canadian-hosted or on-device models for
// data sovereignty. That is the entire point. So the model backend has to be
// swappable without touching the rest of the app — hence this interface.
// ============================================================================
export interface AIProvider {
  readonly name: string;
  summarize(email: RawEmail): Promise<string>;
  triage(email: RawEmail): Promise<TriageResult>;
  draftReply(email: RawEmail): Promise<string>;
}

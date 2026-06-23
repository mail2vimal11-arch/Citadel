import type { Priority, RawEmail } from "@/lib/types";
import type { ComposeRequest, Tone } from "./prompts";

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
  // Auto-draft a reply to an incoming email, optionally in the user's tone.
  draftReply(email: RawEmail, opts?: { tone?: Tone }): Promise<string>;
  // Write-with-AI: compose a draft from a freeform instruction (+ optional
  // reply context and tone). Returns the email text only.
  compose(req: ComposeRequest): Promise<string>;
}

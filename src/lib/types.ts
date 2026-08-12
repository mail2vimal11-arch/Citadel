// Shared types used across the app.

// A raw email as delivered by an EmailSource. In the demo these are 100%
// synthetic. In production these would be fetched (read-only) from a real
// mailbox connector — see GmailSource / MicrosoftGraphSource stubs.
export interface RawEmail {
  id: string; // stable per-message id
  from: string;
  to: string;
  subject: string;
  receivedAt: string; // ISO timestamp
  body: string;
}

// Priority labels the triage step can assign.
export type Priority = "Urgent" | "Action needed" | "FYI" | "Low";

// The AI-derived payload. THIS is the only thing we persist (encrypted).
// We deliberately keep sender/subject in here too, so that once an item is
// forgotten (key destroyed) even the "who/what" disappears.
export interface DerivedPayload {
  sourceId: string;
  from: string;
  subject: string;
  receivedAt: string;
  summary: string;
  priority: Priority;
  triageLabel: string; // e.g. "Client matter", "Scheduling", "Newsletter"
  draftReply: string;
}

// What the inbox UI receives for an ACTIVE item (decrypted on the server,
// in-memory, just long enough to render).
export interface InboxItem {
  id: string;
  status: "ACTIVE";
  processedAt: string;
  forgetAt: string | null;
  payload: DerivedPayload;
}

// What the inbox UI receives for a FORGOTTEN item — no content, ever.
export interface ForgottenItem {
  id: string;
  status: "FORGOTTEN";
  processedAt: string;
  forgottenAt: string;
}

export type AnyInboxItem = InboxItem | ForgottenItem;

export type ForgetInterval = "1h" | "24h" | "7d" | "logout";

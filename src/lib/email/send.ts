import { getAccessToken as gmailToken } from "./googleAuth";
import { getAccessToken as microsoftToken } from "./microsoftAuth";
import { buildMimeMessage, base64Url, parseRecipients, mergeReferences, type OutgoingMessage } from "./mime";

// ============================================================================
// MailSender seam (send feature) — the swappable way the app SENDS mail.
//
// Read and send are deliberately separate concerns: reading is the EmailSource
// seam, sending is here. Sending uses the least extra privilege (gmail.send /
// Mail.Send) and goes out as the authenticated account. Raw bodies are never
// stored; we only audit a content-free SENT event.
//
// TODO(production): outbound queue + retry; signed/threaded replies with real
// Message-ID/References fetched at send time; run on Canadian-controlled infra.
// ============================================================================

export type SendProvider = "gmail" | "microsoft";

// Raised when the stored token lacks the send scope (account connected before
// sending existed) — the UI turns this into a "reconnect to enable sending" hint.
export class NeedsReconnectError extends Error {
  constructor(public readonly provider: SendProvider) {
    super(`${provider} account must be reconnected to grant send permission.`);
    this.name = "NeedsReconnectError";
  }
}

export async function sendEmail(
  userId: string,
  provider: SendProvider,
  accountId: string,
  msg: OutgoingMessage
): Promise<void> {
  if (provider === "gmail") return sendGmail(userId, accountId, msg);
  return sendMicrosoft(userId, accountId, msg);
}

// Threaded reply: replyToId is the ORIGINAL provider message id (from the item's
// namespaced id). We fetch just enough to thread (Gmail: Message-Id + threadId;
// Microsoft: its native createReply), so the reply lands in the conversation.
export async function sendReply(
  userId: string,
  provider: SendProvider,
  accountId: string,
  replyToId: string,
  msg: OutgoingMessage
): Promise<void> {
  if (provider === "gmail") return replyGmail(userId, accountId, replyToId, msg);
  return replyMicrosoft(userId, accountId, replyToId, msg);
}

async function replyGmail(userId: string, accountId: string, replyToId: string, msg: OutgoingMessage): Promise<void> {
  const token = await gmailToken(userId, accountId);
  const auth = { Authorization: `Bearer ${token}` };
  // Pull the original's Message-Id / References / threadId for proper threading.
  let inReplyTo: string | undefined;
  let references: string | undefined;
  let threadId: string | undefined;
  const meta = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(replyToId)}?format=metadata&metadataHeaders=Message-Id&metadataHeaders=References`,
    { headers: auth }
  );
  if (meta.ok) {
    const data = (await meta.json()) as { threadId?: string; payload?: { headers?: { name: string; value: string }[] } };
    const h = (n: string) => data.payload?.headers?.find((x) => x.name.toLowerCase() === n.toLowerCase())?.value;
    inReplyTo = h("Message-Id");
    references = mergeReferences(h("References"), inReplyTo) || undefined;
    threadId = data.threadId;
  }
  const raw = base64Url(buildMimeMessage({ ...msg, inReplyTo, references }));
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify(threadId ? { raw, threadId } : { raw }),
  });
  if (res.status === 403) throw new NeedsReconnectError("gmail");
  if (!res.ok) throw new Error(`Gmail reply failed (${res.status})`);
}

async function replyMicrosoft(userId: string, accountId: string, replyToId: string, msg: OutgoingMessage): Promise<void> {
  const token = await microsoftToken(userId, accountId);
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const base = "https://graph.microsoft.com/v1.0/me/messages";
  // 1) createReply gives a draft with threading + recipients already set.
  const cr = await fetch(`${base}/${encodeURIComponent(replyToId)}/createReply`, { method: "POST", headers: auth });
  if (cr.status === 403) throw new NeedsReconnectError("microsoft");
  if (!cr.ok) throw new Error(`Microsoft createReply failed (${cr.status})`);
  const draft = (await cr.json()) as { id: string };
  // 2) Replace the quoted body (and recipients, honouring any edit) with ours.
  const patch = await fetch(`${base}/${encodeURIComponent(draft.id)}`, {
    method: "PATCH",
    headers: auth,
    body: JSON.stringify({
      body: { contentType: "Text", content: msg.body },
      toRecipients: parseRecipients(msg.to).map((address) => ({ emailAddress: { address } })),
    }),
  });
  if (!patch.ok) throw new Error(`Microsoft reply update failed (${patch.status})`);
  // 3) Send the draft.
  const send = await fetch(`${base}/${encodeURIComponent(draft.id)}/send`, { method: "POST", headers: auth });
  if (!send.ok) throw new Error(`Microsoft reply send failed (${send.status})`);
}

async function sendGmail(userId: string, accountId: string, msg: OutgoingMessage): Promise<void> {
  const token = await gmailToken(userId, accountId);
  const raw = base64Url(buildMimeMessage(msg));
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  if (res.status === 403) throw new NeedsReconnectError("gmail");
  if (!res.ok) throw new Error(`Gmail send failed (${res.status})`);
}

async function sendMicrosoft(userId: string, accountId: string, msg: OutgoingMessage): Promise<void> {
  const token = await microsoftToken(userId, accountId);
  const body = {
    message: {
      subject: msg.subject,
      body: { contentType: "Text", content: msg.body },
      toRecipients: parseRecipients(msg.to).map((address) => ({ emailAddress: { address } })),
    },
    saveToSentItems: true,
  };
  const res = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 403) throw new NeedsReconnectError("microsoft");
  if (!res.ok) throw new Error(`Microsoft send failed (${res.status})`);
}

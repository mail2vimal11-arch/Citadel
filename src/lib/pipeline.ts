import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { getKeyVault } from "@/lib/keyvault/LocalKeyVault";
import { resolveAIProvider } from "@/lib/ai";
import { getEmailSource } from "@/lib/email";
import type { EmailSource } from "@/lib/email/EmailSource";
import { recordAudit } from "@/lib/audit";
import { computeForgetAt, getForgetInterval } from "@/lib/settings";
import type { DerivedPayload } from "@/lib/types";

// The core "process the inbox" loop:
//   raw email -> AI derives summary/triage/draft -> encrypt derived data with a
//   fresh per-item key -> store ciphertext + audit "PROCESSED".
//
// The mailbox is chosen by getEmailSource() (synthetic demo data, or a connected
// Gmail account) — this loop never cares which. The raw email body is used
// in-memory only and is NEVER written to the database.
export async function processInbox(
  source?: EmailSource
): Promise<{ processed: number; skipped: number; aiProvider: string; emailSource: string }> {
  const ai = await resolveAIProvider();
  const vault = getKeyVault();
  const interval = await getForgetInterval();

  const src = source ?? (await getEmailSource());
  const emails = await src.listEmails();
  let processed = 0;
  let skipped = 0;

  for (const email of emails) {
    // Skip anything we've already turned into a derived item (active or forgotten).
    const existing = await prisma.derivedItem.findUnique({
      where: { sourceId: email.id },
    });
    if (existing) {
      skipped++;
      continue;
    }

    // Run the AI over the email (raw body in memory only).
    const [summary, triage, draftReply] = await Promise.all([
      ai.summarize(email),
      ai.triage(email),
      ai.draftReply(email),
    ]);

    const payload: DerivedPayload = {
      sourceId: email.id,
      from: email.from,
      subject: email.subject,
      receivedAt: email.receivedAt,
      summary,
      priority: triage.priority,
      triageLabel: triage.triageLabel,
      draftReply,
    };

    // Encrypt the derived payload under its own fresh key.
    const { keyId, key } = await vault.issueKey();
    const enc = encrypt(JSON.stringify(payload), key);

    const processedAt = new Date();
    const forgetAt = computeForgetAt(processedAt, interval);

    await prisma.derivedItem.create({
      data: {
        sourceId: email.id,
        status: "ACTIVE",
        processedAt,
        forgetAt,
        ciphertext: enc.ciphertext,
        iv: enc.iv,
        authTag: enc.authTag,
        keyId,
      },
    });

    // Audit: record THAT we processed an item, and with WHICH local model.
    // Still content-free — the provider name is non-sensitive.
    await recordAudit({
      event: "PROCESSED",
      message: `Processed 1 email into encrypted derived data (per-item key issued) via ${ai.name}.`,
      sourceRef: email.id,
    });

    processed++;
  }

  return { processed, skipped, aiProvider: ai.name, emailSource: src.name };
}

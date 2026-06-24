import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { getKeyVault } from "@/lib/keyvault";
import { resolveAIProvider } from "@/lib/ai";
import { getEmailSource } from "@/lib/email";
import type { EmailSource } from "@/lib/email/EmailSource";
import { recordAudit } from "@/lib/audit";
import { computeForgetAt, getForgetInterval, getTone, getPlan } from "@/lib/settings";
import { planLimits } from "@/lib/billing";
import type { DerivedPayload } from "@/lib/types";

// The core "process the inbox" loop:
//   raw email -> AI derives summary/triage/draft -> encrypt derived data with a
//   fresh per-item key -> store ciphertext + audit "PROCESSED".
//
// The mailbox is chosen by getEmailSource() (synthetic demo data, or a connected
// Gmail account) — this loop never cares which. The raw email body is used
// in-memory only and is NEVER written to the database.
export async function processInbox(
  userId: string,
  source?: EmailSource
): Promise<{ processed: number; skipped: number; capped: boolean; plan: string; aiProvider: string; emailSource: string }> {
  const ai = await resolveAIProvider();
  const vault = getKeyVault();
  const interval = await getForgetInterval(userId);
  const tone = await getTone(userId); // auto-drafts use the user's voice

  // Freemium gating: the free plan caps ACTIVE items and limits AI text.
  const plan = await getPlan(userId);
  const limits = planLimits(plan);
  let activeCount = await prisma.derivedItem.count({ where: { userId, status: "ACTIVE" } });

  const src = source ?? (await getEmailSource(userId));
  const emails = await src.listEmails();
  let processed = 0;
  let skipped = 0;
  let capped = false;

  for (const email of emails) {
    // Stop once the plan's email cap is reached (free = 2). Already-stored items
    // still show; we just don't derive new ones beyond the cap.
    if (limits.emailCap !== null && activeCount >= limits.emailCap) {
      capped = true;
      break;
    }

    // Skip anything we've already turned into a derived item (active or forgotten)
    // — scoped to this user (sourceId is unique per user, not globally).
    const existing = await prisma.derivedItem.findUnique({
      where: { userId_sourceId: { userId, sourceId: email.id } },
    });
    if (existing) {
      skipped++;
      continue;
    }

    // Free plan limits the text fed to the AI (in-memory only).
    const aiEmail =
      limits.maxBodyChars !== null && email.body.length > limits.maxBodyChars
        ? { ...email, body: email.body.slice(0, limits.maxBodyChars) }
        : email;

    // Run the AI over the email (raw body in memory only).
    const [summary, triage, draftReply] = await Promise.all([
      ai.summarize(aiEmail),
      ai.triage(aiEmail),
      ai.draftReply(aiEmail, { tone }),
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
        userId,
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
      userId,
      event: "PROCESSED",
      message: `Processed 1 email into encrypted derived data (per-item key issued) via ${ai.name}.`,
      sourceRef: email.id,
    });

    processed++;
    activeCount++;
  }

  return { processed, skipped, capped, plan, aiProvider: ai.name, emailSource: src.name };
}

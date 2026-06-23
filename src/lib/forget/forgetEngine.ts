import { prisma } from "@/lib/db";
import { getKeyVault } from "@/lib/keyvault/LocalKeyVault";
import { recordAudit } from "@/lib/audit";

// ============================================================================
// The forget engine — the heart of the "prove it forgot" story.
//
// To forget an item we:
//   1. DESTROY its per-item key in the vault (irreversible).
//   2. Mark the item FORGOTTEN and stamp the time.
//   3. Write a content-free FORGOTTEN entry to the audit log.
//
// The ciphertext row is intentionally left in place but is now permanently
// unreadable. (We keep it so the demo can visibly prove "the data is still
// here as encrypted bytes, but no key exists to read it.")
// ============================================================================

async function forgetOne(userId: string, itemId: string, keyId: string): Promise<void> {
  const vault = getKeyVault();
  // 1. Destroy the key first — this is the irreversible step.
  await vault.destroyKey(keyId);
  // 2. Mark the item forgotten.
  await prisma.derivedItem.update({
    where: { id: itemId },
    data: { status: "FORGOTTEN", forgottenAt: new Date() },
  });
  // 3. Audit it (no content).
  await recordAudit({
    userId,
    event: "FORGOTTEN",
    message:
      "Per-item key destroyed; derived data is now permanently unrecoverable.",
    itemId,
  });
}

// Sweep: forget every ACTIVE item (for this user) whose deadline has passed.
// Safe to call often (e.g. on every page load / API request) — it's a no-op
// when nothing has expired.
export async function runForgetSweep(userId: string, now: Date = new Date()): Promise<number> {
  const due = await prisma.derivedItem.findMany({
    where: { userId, status: "ACTIVE", forgetAt: { not: null, lte: now } },
    select: { id: true, keyId: true },
  });
  for (const item of due) {
    await forgetOne(userId, item.id, item.keyId);
  }
  return due.length;
}

// Forget a single item right now (the "Forget now" button in the demo).
export async function forgetItemNow(userId: string, itemId: string): Promise<boolean> {
  const item = await prisma.derivedItem.findFirst({ where: { id: itemId, userId } });
  if (!item || item.status !== "ACTIVE") return false;
  await forgetOne(userId, item.id, item.keyId);
  return true;
}

// Forget everything still active for this user ("Log out & forget all").
export async function forgetAll(userId: string): Promise<number> {
  const active = await prisma.derivedItem.findMany({
    where: { userId, status: "ACTIVE" },
    select: { id: true, keyId: true },
  });
  for (const item of active) {
    await forgetOne(userId, item.id, item.keyId);
  }
  return active.length;
}

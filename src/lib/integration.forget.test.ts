import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { processInbox } from "@/lib/pipeline";
import { loadInbox, proveUnrecoverable } from "@/lib/inbox";
import { listAudit } from "@/lib/audit";
import { forgetItemNow } from "@/lib/forget/forgetEngine";
import { setPlan } from "@/lib/settings";

// ============================================================================
// INTEGRATION — the forget guarantee, end to end.
//
// This is the load-bearing promise of the whole product, so it gets a test that
// drives the REAL collaborators together (pipeline + heuristic AI + KeyVault +
// AES-GCM crypto + forget engine + audit + SQLite) rather than mocks. It proves
// the full lifecycle: an item is processed and readable, then crypto-shredded,
// after which it is permanently unrecoverable AND the audit trail that records
// the event carries none of its content.
// ============================================================================
const U = "forget-guarantee-user";

async function wipe(userId: string) {
  const items = await prisma.derivedItem.findMany({
    where: { userId },
    select: { keyId: true },
  });
  await prisma.vaultKey.deleteMany({ where: { id: { in: items.map((i) => i.keyId) } } });
  await prisma.derivedItem.deleteMany({ where: { userId } });
  await prisma.auditEvent.deleteMany({ where: { userId } });
}

beforeAll(async () => {
  process.env.EMAIL_SOURCE = "sample";
  await wipe(U);
  await setPlan(U, "full"); // don't let the free cap (2) truncate the run
});

afterAll(async () => {
  await wipe(U);
  await prisma.$disconnect();
});

describe("forget guarantee (integration)", () => {
  it("processes an item into readable, encrypted derived data", async () => {
    const res = await processInbox(U);
    expect(res.processed).toBeGreaterThan(0);

    const inbox = await loadInbox(U);
    const active = inbox.filter((i) => i.status === "ACTIVE");
    expect(active.length).toBeGreaterThan(0);

    // The derived payload is genuinely readable while ACTIVE (the key still lives).
    const first = active[0];
    if (first.status !== "ACTIVE") throw new Error("expected ACTIVE item");
    expect(first.payload.summary.length).toBeGreaterThan(0);

    // A PROCESSED audit event was recorded.
    const audit = await listAudit(U);
    expect(audit.some((e) => e.event === "PROCESSED")).toBe(true);
  });

  it("makes an item permanently unrecoverable once forgotten", async () => {
    const before = await loadInbox(U);
    const target = before.find((i) => i.status === "ACTIVE");
    if (!target || target.status !== "ACTIVE") throw new Error("no active item to forget");
    const summary = target.payload.summary; // capture to prove it never leaks

    // Crypto-shred this one item.
    const ok = await forgetItemNow(U, target.id);
    expect(ok).toBe(true);

    // The proof endpoint: ciphertext is STILL on disk, but the key is gone and a
    // decrypt attempt fails — the data is unrecoverable, not merely hidden.
    const proof = await proveUnrecoverable(U, target.id);
    expect(proof.found).toBe(true);
    expect(proof.status).toBe("FORGOTTEN");
    expect(proof.keyDestroyed).toBe(true);
    expect(proof.decryptAttempt).toBe("unrecoverable");
    expect(proof.ciphertextPreview && proof.ciphertextPreview.length).toBeGreaterThan(0);

    // The wrapped DEK row is actually destroyed at the DB level.
    const row = await prisma.derivedItem.findFirst({ where: { id: target.id, userId: U } });
    const keyRow = await prisma.vaultKey.findUnique({ where: { id: row!.keyId } });
    expect(keyRow?.destroyed).toBe(true);
    expect(keyRow?.material).toBeNull();

    // The inbox now shows it as FORGOTTEN with NO payload exposed.
    const after = await loadInbox(U);
    const shown = after.find((i) => i.id === target.id);
    expect(shown?.status).toBe("FORGOTTEN");
    expect(shown && "payload" in shown).toBe(false);

    // And the audit log proves the forget happened while staying content-free:
    // no event anywhere carries the item's summary text.
    const audit = await listAudit(U);
    expect(audit.some((e) => e.event === "FORGOTTEN")).toBe(true);
    const serialized = JSON.stringify(audit);
    expect(serialized.includes(summary)).toBe(false);
  });
});

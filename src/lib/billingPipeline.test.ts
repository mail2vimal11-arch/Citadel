import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { processInbox } from "@/lib/pipeline";
import { loadInbox } from "@/lib/inbox";
import { setPlan } from "@/lib/settings";

// Freemium gating end-to-end: the free plan caps the inbox at 2 derived items,
// even though the synthetic source offers 15.
const U = "billing-cap-user";

async function wipe() {
  const items = await prisma.derivedItem.findMany({ where: { userId: U }, select: { keyId: true } });
  await prisma.vaultKey.deleteMany({ where: { id: { in: items.map((i) => i.keyId) } } });
  await prisma.derivedItem.deleteMany({ where: { userId: U } });
  await prisma.auditEvent.deleteMany({ where: { userId: U } });
}

beforeAll(async () => {
  process.env.EMAIL_SOURCE = "sample";
  await wipe();
});
afterAll(async () => {
  await wipe();
  await prisma.$disconnect();
});

describe("freemium gating (pipeline)", () => {
  it("free plan stops at 2 emails and reports capped", async () => {
    await setPlan(U, "free");
    const r = await processInbox(U);
    expect(r.plan).toBe("free");
    expect(r.processed).toBe(2);
    expect(r.capped).toBe(true);
    expect((await loadInbox(U)).filter((i) => i.status === "ACTIVE")).toHaveLength(2);

    // Re-processing stays capped (no new items beyond 2).
    const again = await processInbox(U);
    expect(again.processed).toBe(0);
    expect(again.capped).toBe(true);
  });

  it("full plan lifts the cap", async () => {
    await wipe();
    await setPlan(U, "full");
    const r = await processInbox(U);
    expect(r.plan).toBe("full");
    expect(r.capped).toBe(false);
    expect(r.processed).toBeGreaterThan(2);
  });
});

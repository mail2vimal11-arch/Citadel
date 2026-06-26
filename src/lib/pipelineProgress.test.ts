import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { processInbox } from "@/lib/pipeline";
import { setPlan } from "@/lib/settings";

const U = "progress-user";

async function wipe() {
  const items = await prisma.derivedItem.findMany({ where: { userId: U }, select: { keyId: true } });
  await prisma.vaultKey.deleteMany({ where: { id: { in: items.map((i) => i.keyId) } } });
  await prisma.derivedItem.deleteMany({ where: { userId: U } });
  await prisma.auditEvent.deleteMany({ where: { userId: U } });
}

beforeAll(async () => {
  process.env.EMAIL_SOURCE = "sample";
  await wipe();
  await setPlan(U, "full");
});
afterAll(async () => {
  await wipe();
  await prisma.$disconnect();
});

describe("processInbox onProgress", () => {
  it("reports one increasing progress tick per email, against a stable total", async () => {
    const ticks: { current: number; total: number }[] = [];
    const r = await processInbox(U, undefined, (p) => ticks.push(p));

    expect(ticks.length).toBe(r.processed); // one tick per email seen (full plan = all)
    expect(ticks[0].current).toBe(1);
    expect(ticks[ticks.length - 1].current).toBe(ticks.length);
    // total is constant and matches the source size.
    expect(new Set(ticks.map((t) => t.total)).size).toBe(1);
    expect(ticks[0].total).toBe(r.processed);
  });
});

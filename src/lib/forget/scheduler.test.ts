import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { getKeyVault } from "@/lib/keyvault";
import { isDue, runForgetSweepAll } from "./forgetEngine";
import {
  sweepIntervalMs,
  startForgetScheduler,
  stopForgetScheduler,
  isSchedulerRunning,
  DEFAULT_SWEEP_INTERVAL_MS,
} from "./scheduler";

const U1 = "sched-user-1";
const U2 = "sched-user-2";

// Insert one ACTIVE item with a real per-item key and a chosen forget deadline.
async function seedItem(userId: string, forgetAt: Date | null) {
  const { keyId, key } = await getKeyVault().issueKey();
  const enc = encrypt(JSON.stringify({ hello: "world" }), key);
  return prisma.derivedItem.create({
    data: {
      userId,
      sourceId: `src-${Math.random().toString(36).slice(2)}`,
      status: "ACTIVE",
      processedAt: new Date(),
      forgetAt,
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      authTag: enc.authTag,
      keyId,
    },
  });
}

async function wipe() {
  for (const userId of [U1, U2]) {
    const items = await prisma.derivedItem.findMany({ where: { userId }, select: { keyId: true } });
    await prisma.vaultKey.deleteMany({ where: { id: { in: items.map((i) => i.keyId) } } });
    await prisma.derivedItem.deleteMany({ where: { userId } });
    await prisma.auditEvent.deleteMany({ where: { userId } });
  }
}

const ORIGINAL_INTERVAL = process.env.FORGET_SWEEP_INTERVAL_MS;
beforeEach(wipe);
afterEach(() => {
  stopForgetScheduler();
  if (ORIGINAL_INTERVAL === undefined) delete process.env.FORGET_SWEEP_INTERVAL_MS;
  else process.env.FORGET_SWEEP_INTERVAL_MS = ORIGINAL_INTERVAL;
});
afterAll(async () => {
  await wipe();
  await prisma.$disconnect();
});

describe("isDue", () => {
  const now = new Date("2026-06-23T12:00:00Z");
  it("is true for a past deadline", () => {
    expect(isDue(new Date("2026-06-23T11:59:59Z"), now)).toBe(true);
  });
  it("is true exactly at the deadline", () => {
    expect(isDue(new Date("2026-06-23T12:00:00Z"), now)).toBe(true);
  });
  it("is false for a future deadline", () => {
    expect(isDue(new Date("2026-06-23T12:00:01Z"), now)).toBe(false);
  });
  it("is false when there is no deadline", () => {
    expect(isDue(null, now)).toBe(false);
  });
});

describe("sweepIntervalMs", () => {
  it("defaults when unset", () => {
    delete process.env.FORGET_SWEEP_INTERVAL_MS;
    expect(sweepIntervalMs()).toBe(DEFAULT_SWEEP_INTERVAL_MS);
  });
  it("parses an explicit value", () => {
    process.env.FORGET_SWEEP_INTERVAL_MS = "5000";
    expect(sweepIntervalMs()).toBe(5000);
  });
  it("falls back to the default for garbage", () => {
    process.env.FORGET_SWEEP_INTERVAL_MS = "not-a-number";
    expect(sweepIntervalMs()).toBe(DEFAULT_SWEEP_INTERVAL_MS);
  });
});

describe("startForgetScheduler", () => {
  it("does not start when disabled (interval <= 0)", () => {
    process.env.FORGET_SWEEP_INTERVAL_MS = "0";
    expect(startForgetScheduler()).toBe(false);
    expect(isSchedulerRunning()).toBe(false);
  });

  it("starts once and is idempotent, then stops", () => {
    process.env.FORGET_SWEEP_INTERVAL_MS = "3600000"; // long, won't tick mid-test
    expect(startForgetScheduler()).toBe(true);
    expect(isSchedulerRunning()).toBe(true);
    expect(startForgetScheduler()).toBe(false); // already running
    stopForgetScheduler();
    expect(isSchedulerRunning()).toBe(false);
  });
});

describe("runForgetSweepAll — forgets on time with no user interaction", () => {
  it("forgets every expired item across all users, sparing the not-yet-due", async () => {
    const past = new Date(Date.now() - 60_000);
    const future = new Date(Date.now() + 60 * 60_000);

    const u1Expired = await seedItem(U1, past);
    const u1Future = await seedItem(U1, future);
    const u2Expired = await seedItem(U2, past);
    const u2Never = await seedItem(U2, null);

    const forgotten = await runForgetSweepAll();
    expect(forgotten).toBe(2); // both expired items, across the two users

    const rows = await prisma.derivedItem.findMany({
      where: { id: { in: [u1Expired.id, u1Future.id, u2Expired.id, u2Never.id] } },
      select: { id: true, status: true },
    });
    const status = Object.fromEntries(rows.map((r) => [r.id, r.status]));
    expect(status[u1Expired.id]).toBe("FORGOTTEN");
    expect(status[u2Expired.id]).toBe("FORGOTTEN");
    expect(status[u1Future.id]).toBe("ACTIVE");
    expect(status[u2Never.id]).toBe("ACTIVE");

    // The expired items' keys are destroyed (crypto-shred), the others' remain.
    expect(await getKeyVault().getKey((await keyIdOf(u1Expired.id)))).toBeNull();
    expect(await getKeyVault().getKey((await keyIdOf(u1Future.id)))).not.toBeNull();
  });
});

async function keyIdOf(itemId: string): Promise<string> {
  const row = await prisma.derivedItem.findUnique({ where: { id: itemId }, select: { keyId: true } });
  return row!.keyId;
}

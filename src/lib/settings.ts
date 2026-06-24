import { prisma } from "@/lib/db";
import type { ForgetInterval } from "@/lib/types";
import { normalizeTone, type Tone } from "@/lib/ai/prompts";
import { normalizePlan, type Plan } from "@/lib/billing";

export const FORGET_OPTIONS: { value: ForgetInterval; label: string; ms: number | null }[] = [
  { value: "1h", label: "After 1 hour", ms: 60 * 60 * 1000 },
  { value: "24h", label: "After 24 hours", ms: 24 * 60 * 60 * 1000 },
  { value: "7d", label: "After 7 days", ms: 7 * 24 * 60 * 60 * 1000 },
  { value: "logout", label: "On logout only (no timer)", ms: null },
];

export function intervalMs(interval: ForgetInterval): number | null {
  return FORGET_OPTIONS.find((o) => o.value === interval)?.ms ?? null;
}

// Compute the forget-deadline for an item processed at `processedAt`, given the
// chosen interval. Returns null for "logout" (no automatic timer).
export function computeForgetAt(
  processedAt: Date,
  interval: ForgetInterval
): Date | null {
  const ms = intervalMs(interval);
  if (ms === null) return null;
  return new Date(processedAt.getTime() + ms);
}

export async function getForgetInterval(userId: string): Promise<ForgetInterval> {
  const setting = await prisma.setting.upsert({
    where: { userId },
    update: {},
    create: { userId, forgetInterval: "24h" },
  });
  return setting.forgetInterval as ForgetInterval;
}

export async function setForgetInterval(userId: string, interval: ForgetInterval): Promise<void> {
  await prisma.setting.upsert({
    where: { userId },
    update: { forgetInterval: interval },
    create: { userId, forgetInterval: interval },
  });
}

// ---- Write-with-AI tone profile (P7) ----------------------------------------
export async function getTone(userId: string): Promise<Tone> {
  const setting = await prisma.setting.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  return normalizeTone(setting.tone);
}

export async function setTone(userId: string, tone: Tone): Promise<void> {
  await prisma.setting.upsert({
    where: { userId },
    update: { tone },
    create: { userId, tone },
  });
}

// ---- Plan (freemium gating, P12) --------------------------------------------
export async function getPlan(userId: string): Promise<Plan> {
  const setting = await prisma.setting.upsert({ where: { userId }, update: {}, create: { userId } });
  return normalizePlan(setting.plan);
}

export async function setPlan(userId: string, plan: Plan): Promise<void> {
  await prisma.setting.upsert({ where: { userId }, update: { plan }, create: { userId, plan } });
}

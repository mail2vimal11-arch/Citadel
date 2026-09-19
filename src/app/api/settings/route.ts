import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  FORGET_OPTIONS,
  computeForgetAt,
  getForgetInterval,
  setForgetInterval,
  getTone,
  setTone,
  getPlan,
  setPlan,
} from "@/lib/settings";
import { recordAudit } from "@/lib/audit";
import { requireUserId } from "@/lib/apiUser";
import { TONES, normalizeTone } from "@/lib/ai/prompts";
import { PLANS, normalizePlan } from "@/lib/billing";
import { paymentsConfigured } from "@/lib/payments";
import type { ForgetInterval } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/settings — current forget interval + tone, plus the available options.
export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const [forgetInterval, tone, plan] = await Promise.all([
    getForgetInterval(userId),
    getTone(userId),
    getPlan(userId),
  ]);
  return NextResponse.json({
    forgetInterval,
    options: FORGET_OPTIONS,
    tone,
    tones: TONES.map((t) => ({ value: t.value, label: t.label })),
    plan,
    plans: PLANS,
    billingConfigured: paymentsConfigured(),
  });
}

// POST /api/settings — change the forget schedule { forgetInterval } and/or the
// Write-with-AI tone { tone }. Either field may be sent on its own.
export async function POST(req: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const body = await req.json().catch(() => ({}));

  // ---- Tone-only update ----
  if (body?.tone !== undefined && body?.forgetInterval === undefined) {
    const valid = TONES.some((t) => t.value === body.tone);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid tone" }, { status: 400 });
    }
    const tone = normalizeTone(body.tone);
    await setTone(userId, tone);
    await recordAudit({
      userId,
      event: "SETTINGS_CHANGED",
      message: `Write-with-AI tone changed to "${tone}".`,
    });
    return NextResponse.json({ ok: true, tone });
  }

  // ---- Plan update (DEMO: no real billing yet — see TODO(production)) ----
  if (body?.plan !== undefined && body?.forgetInterval === undefined) {
    if (!PLANS.includes(body.plan)) {
      return NextResponse.json({ ok: false, error: "Invalid plan" }, { status: 400 });
    }
    // TODO(production): plan changes come from a verified Stripe webhook, never a
    // client POST. This demo switch only exists to show the freemium gating.
    const plan = normalizePlan(body.plan);
    await setPlan(userId, plan);
    await recordAudit({ userId, event: "SETTINGS_CHANGED", message: `Plan changed to "${plan}" (demo).` });
    return NextResponse.json({ ok: true, plan });
  }

  // ---- Forget-schedule update ----
  const interval = body?.forgetInterval as ForgetInterval | undefined;
  const valid = FORGET_OPTIONS.some((o) => o.value === interval);
  if (!valid || !interval) {
    return NextResponse.json({ ok: false, error: "Invalid forgetInterval" }, { status: 400 });
  }

  await setForgetInterval(userId, interval);

  // Recompute deadlines for this user's active items so the new schedule applies.
  const active = await prisma.derivedItem.findMany({
    where: { userId, status: "ACTIVE" },
    select: { id: true, processedAt: true },
  });
  for (const item of active) {
    await prisma.derivedItem.update({
      where: { id: item.id },
      data: { forgetAt: computeForgetAt(item.processedAt, interval) },
    });
  }

  await recordAudit({
    userId,
    event: "SETTINGS_CHANGED",
    message: `Forget schedule changed to "${interval}". Applied to ${active.length} active item(s).`,
  });

  return NextResponse.json({ ok: true, forgetInterval: interval, updated: active.length });
}

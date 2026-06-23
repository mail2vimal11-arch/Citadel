import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  FORGET_OPTIONS,
  computeForgetAt,
  getForgetInterval,
  setForgetInterval,
} from "@/lib/settings";
import { recordAudit } from "@/lib/audit";
import { requireUserId } from "@/lib/apiUser";
import type { ForgetInterval } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/settings — current forget interval + the available options.
export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const forgetInterval = await getForgetInterval(userId);
  return NextResponse.json({ forgetInterval, options: FORGET_OPTIONS });
}

// POST /api/settings { forgetInterval } — change the schedule and recompute the
// forget deadline for every ACTIVE item based on its original processed time.
export async function POST(req: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const body = await req.json().catch(() => ({}));
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

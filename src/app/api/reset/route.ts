import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/apiUser";

export const dynamic = "force-dynamic";

// POST /api/reset — DEMO-ONLY. Wipes THIS user's derived items, their keys, and
// their audit events so they can run the demo again from a clean slate.
//
// TODO(production): there is no "wipe everything" button in the real product;
// data lifecycle is governed solely by the forget schedule and explicit,
// audited user actions.
export async function POST() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  // Destroy only this user's keys, then their items + audit rows.
  const items = await prisma.derivedItem.findMany({
    where: { userId },
    select: { keyId: true },
  });
  await prisma.vaultKey.deleteMany({ where: { id: { in: items.map((i) => i.keyId) } } });
  await prisma.derivedItem.deleteMany({ where: { userId } });
  await prisma.auditEvent.deleteMany({ where: { userId } });
  return NextResponse.json({ ok: true });
}

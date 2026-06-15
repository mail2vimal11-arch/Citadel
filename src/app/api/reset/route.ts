import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/reset — DEMO-ONLY. Wipes all derived items, keys, and audit events
// so you can run the demo again from a clean slate. Does not touch settings.
//
// TODO(production): there is no "wipe everything" button in the real product;
// data lifecycle is governed solely by the forget schedule and explicit,
// audited user actions.
export async function POST() {
  await prisma.derivedItem.deleteMany({});
  await prisma.vaultKey.deleteMany({});
  await prisma.auditEvent.deleteMany({});
  return NextResponse.json({ ok: true });
}

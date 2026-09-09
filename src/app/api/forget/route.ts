import { NextResponse } from "next/server";
import { forgetAll, forgetItemNow } from "@/lib/forget/forgetEngine";
import { proveUnrecoverable } from "@/lib/inbox";
import { requireUserId } from "@/lib/apiUser";

export const dynamic = "force-dynamic";

// POST /api/forget
//   { itemId: "..." }  -> forget that one item now
//   { all: true }      -> forget everything (the "Log out & forget all" action)
export async function POST(req: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const body = await req.json().catch(() => ({}));

  if (body?.all === true) {
    const count = await forgetAll(userId);
    return NextResponse.json({ ok: true, forgotten: count });
  }

  if (typeof body?.itemId === "string") {
    const ok = await forgetItemNow(userId, body.itemId);
    return NextResponse.json({ ok, forgotten: ok ? 1 : 0 });
  }

  return NextResponse.json({ ok: false, error: "Provide itemId or all:true" }, { status: 400 });
}

// GET /api/forget?prove=<itemId> — demo helper that proves a forgotten item's
// stored bytes can no longer be decrypted.
export async function GET(req: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("prove");
  if (!itemId) {
    return NextResponse.json({ error: "Provide ?prove=<itemId>" }, { status: 400 });
  }
  const proof = await proveUnrecoverable(userId, itemId);
  return NextResponse.json(proof);
}

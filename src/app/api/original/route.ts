import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/apiUser";
import { prisma } from "@/lib/db";
import { getOriginalEmail } from "@/lib/email/original";

export const dynamic = "force-dynamic";

// POST /api/original { itemId } — fetch the ORIGINAL email body on demand.
//
// Citadel never stores raw bodies, so "View original" reads the message live
// from the user's mailbox (read-only) and returns it to THAT user only. Nothing
// here is persisted, audited, or logged — same guarantee as the pipeline's
// in-memory pass. Scoped to the caller's own items (never trust a client id).
export async function POST(req: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await req.json().catch(() => ({}));
  const itemId = typeof body?.itemId === "string" ? body.itemId : "";
  if (!itemId) {
    return NextResponse.json({ ok: false, error: "itemId required" }, { status: 400 });
  }

  // Resolve the item's provider sourceId — scoped to this user.
  const row = await prisma.derivedItem.findFirst({
    where: { id: itemId, userId },
    select: { sourceId: true },
  });
  if (!row) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const original = await getOriginalEmail(userId, row.sourceId);
  if (!original) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "The original couldn’t be fetched — it may have been deleted, or the account may need reconnecting.",
      },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Live body returned to the caller only — NOT stored, NOT logged, NOT cached.
  return NextResponse.json(
    {
      ok: true,
      from: original.from,
      to: original.to,
      subject: original.subject,
      receivedAt: original.receivedAt,
      body: original.body,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

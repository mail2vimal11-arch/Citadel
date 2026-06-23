import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/apiUser";
import { resolveAIProvider } from "@/lib/ai";
import { getTone } from "@/lib/settings";
import { loadInbox } from "@/lib/inbox";
import { recordAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

// POST /api/compose { instruction, itemId? } — Write-with-AI.
// Drafts an email from a freeform instruction, in the user's saved tone. If
// itemId is given, the item's NON-sensitive derived context (from/subject/
// summary) is passed for a contextual reply — never a raw body (none is stored).
//
// Nothing is persisted: the draft is returned to the client only. We record a
// CONTENT-FREE "DRAFTED" audit entry so the log still shows the assistant acted.
export async function POST(req: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await req.json().catch(() => ({}));
  const instruction = typeof body?.instruction === "string" ? body.instruction.trim() : "";
  if (!instruction) {
    return NextResponse.json({ ok: false, error: "Provide an instruction." }, { status: 400 });
  }

  // Optional reply context, derived-only and scoped to this user.
  let context: { from?: string; subject?: string; summary?: string } | undefined;
  if (typeof body?.itemId === "string") {
    const item = (await loadInbox(userId)).find((i) => i.id === body.itemId);
    if (item && item.status === "ACTIVE") {
      context = { from: item.payload.from, subject: item.payload.subject, summary: item.payload.summary };
    }
  }

  const tone = await getTone(userId);
  const ai = await resolveAIProvider();
  const draft = await ai.compose({ instruction, context, tone });

  await recordAudit({
    userId,
    event: "DRAFTED",
    message: `Composed a draft with AI (${tone} tone) via ${ai.name}.`,
  });

  return NextResponse.json({ ok: true, draft, tone, aiProvider: ai.name });
}

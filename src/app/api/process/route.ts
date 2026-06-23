import { NextResponse } from "next/server";
import { processInbox } from "@/lib/pipeline";
import { runForgetSweep } from "@/lib/forget/forgetEngine";
import { requireUserId } from "@/lib/apiUser";

export const dynamic = "force-dynamic";

// POST /api/process — run the AI pipeline over this user's not-yet-processed
// emails. We also run a forget sweep first so state stays consistent.
export async function POST() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  await runForgetSweep(userId);
  const result = await processInbox(userId);
  return NextResponse.json({ ok: true, ...result });
}

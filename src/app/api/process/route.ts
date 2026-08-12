import { NextResponse } from "next/server";
import { processInbox } from "@/lib/pipeline";
import { runForgetSweep } from "@/lib/forget/forgetEngine";

export const dynamic = "force-dynamic";

// POST /api/process — run the AI pipeline over any not-yet-processed sample
// emails. We also run a forget sweep first so the demo state stays consistent.
export async function POST() {
  await runForgetSweep();
  const result = await processInbox();
  return NextResponse.json({ ok: true, ...result });
}

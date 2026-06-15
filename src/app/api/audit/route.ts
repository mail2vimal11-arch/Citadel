import { NextResponse } from "next/server";
import { listAudit } from "@/lib/audit";
import { runForgetSweep } from "@/lib/forget/forgetEngine";

export const dynamic = "force-dynamic";

// GET /api/audit — the audit trail. We sweep first so that opening the log also
// reflects anything that just expired.
export async function GET() {
  await runForgetSweep();
  const events = await listAudit();
  return NextResponse.json({ events });
}

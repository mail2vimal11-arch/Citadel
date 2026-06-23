import { NextResponse } from "next/server";
import { listAudit } from "@/lib/audit";
import { runForgetSweep } from "@/lib/forget/forgetEngine";
import { requireUserId } from "@/lib/apiUser";

export const dynamic = "force-dynamic";

// GET /api/audit — the audit trail. We sweep first so that opening the log also
// reflects anything that just expired.
export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  await runForgetSweep(userId);
  const events = await listAudit(userId);
  return NextResponse.json({ events });
}

import { NextResponse } from "next/server";
import { loadInbox } from "@/lib/inbox";
import { runForgetSweep } from "@/lib/forget/forgetEngine";
import { getForgetInterval } from "@/lib/settings";
import { requireUserId } from "@/lib/apiUser";

export const dynamic = "force-dynamic";

// GET /api/items — the inbox. Every read first runs a forget sweep, so expired
// items are forgotten exactly when you look (no background daemon needed).
export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const forgottenNow = await runForgetSweep(userId);
  const [items, forgetInterval] = await Promise.all([
    loadInbox(userId),
    getForgetInterval(userId),
  ]);
  return NextResponse.json({ items, forgetInterval, forgottenNow });
}

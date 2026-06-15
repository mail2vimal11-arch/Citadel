import { NextResponse } from "next/server";
import { loadInbox } from "@/lib/inbox";
import { runForgetSweep } from "@/lib/forget/forgetEngine";
import { getForgetInterval } from "@/lib/settings";

export const dynamic = "force-dynamic";

// GET /api/items — the inbox. Every read first runs a forget sweep, so expired
// items are forgotten exactly when you look (no background daemon needed).
export async function GET() {
  const forgottenNow = await runForgetSweep();
  const [items, forgetInterval] = await Promise.all([
    loadInbox(),
    getForgetInterval(),
  ]);
  return NextResponse.json({ items, forgetInterval, forgottenNow });
}

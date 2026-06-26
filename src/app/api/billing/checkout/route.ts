import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/apiUser";
import { getPayments } from "@/lib/payments";

export const dynamic = "force-dynamic";

// POST /api/billing/checkout { cycle: "monthly" | "annual" } — start a Stripe
// Checkout for the Full plan and return its URL for the client to redirect to.
// 400 when billing isn't configured (demo mode — Settings has a demo switch).
export async function POST(req: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const payments = await getPayments();
  if (!payments) {
    return NextResponse.json({ ok: false, error: "Billing is not configured." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const cycle = body?.cycle === "annual" ? "annual" : "monthly";
  const base = process.env.APP_BASE_URL || new URL(req.url).origin;

  try {
    const url = await payments.createCheckoutUrl(userId, cycle, {
      success: `${base}/settings?upgraded=1`,
      cancel: `${base}/settings`,
    });
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Could not start checkout." },
      { status: 502 }
    );
  }
}

import { NextResponse } from "next/server";
import { getPayments } from "@/lib/payments";
import { setPlan } from "@/lib/settings";
import { recordAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

// POST /api/billing/webhook — Stripe calls this. We verify the signature against
// the RAW body, map the event to a plan change, and apply it. No requireUserId:
// the caller is Stripe; the userId rides in the event metadata we set at checkout.
//
// TODO(production): the Stripe webhook endpoint secret must come from a secrets
// manager; only go LIVE after the keys-off-host hosting move (see COMPLIANCE.md).
export async function POST(req: Request) {
  const payments = await getPayments();
  if (!payments) return new NextResponse("billing not configured", { status: 503 });

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text(); // raw body required for signature verification

  let change;
  try {
    change = await payments.parseWebhook(rawBody, signature);
  } catch {
    return new NextResponse("invalid signature", { status: 400 });
  }

  if (change) {
    await setPlan(change.userId, change.plan);
    // Content-free: who's plan changed and that Stripe drove it — never card data.
    await recordAudit({
      userId: change.userId,
      event: "SETTINGS_CHANGED",
      message: `Plan set to "${change.plan}" via Stripe.`,
    });
  }

  return NextResponse.json({ received: true });
}

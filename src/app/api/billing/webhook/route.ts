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

  let result;
  try {
    result = await payments.parseWebhook(rawBody, signature);
  } catch {
    return new NextResponse("invalid signature", { status: 400 });
  }

  if (result?.kind === "plan") {
    await setPlan(result.userId, result.plan);
    // Content-free: who's plan changed and that Stripe drove it — never card data.
    await recordAudit({
      userId: result.userId,
      event: "SETTINGS_CHANGED",
      message: `Plan set to "${result.plan}" via Stripe.`,
    });
  } else if (result?.kind === "payment_failed") {
    // Don't downgrade on a single failure — Stripe retries (dunning), and a final
    // failure cancels the subscription (→ a "plan: free" event). Just record it.
    await recordAudit({
      userId: result.userId,
      event: "SETTINGS_CHANGED",
      message: "Stripe payment failed; Stripe will retry before cancelling.",
    });
  }

  return NextResponse.json({ received: true });
}

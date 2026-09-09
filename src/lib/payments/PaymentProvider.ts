import type { Plan } from "@/lib/billing";

// ============================================================================
// PaymentProvider — the seam for charging (P12). Kept apart from the gating
// logic (src/lib/billing.ts) so the app never imports the Stripe SDK except in
// the two server routes that need it. Charging is OPT-IN: with no STRIPE_* env,
// `getPayments()` returns null and the app stays in demo mode.
//
// TODO(production): per ROADMAP, only flip this LIVE once the keys-off-host
// hosting move is real (see COMPLIANCE.md). The plumbing is ready; the switch is
// configuring the Stripe keys + price IDs.
// ============================================================================

export type Cycle = "monthly" | "annual";

// What a verified webhook tells us to do: change a plan, or note a payment
// failure (audited; the actual downgrade waits for Stripe's dunning to cancel
// the subscription, which arrives as customer.subscription.deleted).
export type WebhookResult =
  | { kind: "plan"; userId: string; plan: Plan }
  | { kind: "payment_failed"; userId: string }
  | null;

export interface PaymentProvider {
  readonly name: string;
  // Hosted checkout URL to upgrade `userId` to Full on the chosen billing cycle.
  createCheckoutUrl(userId: string, cycle: Cycle, urls: { success: string; cancel: string }): Promise<string>;
  // Verify a webhook (raw body + signature) and return what to do, or null when
  // the event isn't one we act on. Throws on a bad signature.
  parseWebhook(rawBody: string, signature: string | null): Promise<WebhookResult>;
}

type StripeEventLike = { type: string; data?: { object?: Record<string, unknown> } };

// The userId rides in client_reference_id / metadata we set at checkout; on
// invoice events Stripe surfaces the subscription's metadata as subscription_details.
function userIdOf(obj: Record<string, unknown>): string {
  const meta = (obj.metadata ?? {}) as Record<string, unknown>;
  const subDetails = (obj.subscription_details ?? {}) as Record<string, unknown>;
  const subMeta = (subDetails.metadata ?? {}) as Record<string, unknown>;
  return (obj.client_reference_id as string) || (meta.userId as string) || (subMeta.userId as string) || "";
}

// PURE: map an ALREADY-VERIFIED Stripe event to an action. No SDK import, so it's
// unit-testable. Paid checkout → Full; cancelled/paused subscription → Free;
// invoice.payment_failed → a content-free "payment failed" note.
export function interpretStripeEvent(event: StripeEventLike): WebhookResult {
  const obj = (event.data?.object ?? {}) as Record<string, unknown>;
  const userId = userIdOf(obj);

  switch (event.type) {
    case "checkout.session.completed":
      if (userId && (obj.payment_status === "paid" || obj.status === "complete")) {
        return { kind: "plan", userId, plan: "full" };
      }
      return null;
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
      return userId ? { kind: "plan", userId, plan: "free" } : null;
    case "invoice.payment_failed":
      return userId ? { kind: "payment_failed", userId } : null;
    default:
      return null;
  }
}

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
export type PlanChange = { userId: string; plan: Plan };

export interface PaymentProvider {
  readonly name: string;
  // Hosted checkout URL to upgrade `userId` to Full on the chosen billing cycle.
  createCheckoutUrl(userId: string, cycle: Cycle, urls: { success: string; cancel: string }): Promise<string>;
  // Verify a webhook (raw body + signature) and return the plan change to apply,
  // or null when the event isn't one we act on. Throws on a bad signature.
  parseWebhook(rawBody: string, signature: string | null): Promise<PlanChange | null>;
}

// PURE: map an ALREADY-VERIFIED Stripe event to a plan change. No SDK import, so
// it's unit-testable. A paid checkout → Full; a cancelled/paused subscription →
// Free. `userId` is carried in client_reference_id / metadata we set at checkout.
type StripeEventLike = { type: string; data?: { object?: Record<string, unknown> } };
export function planFromStripeEvent(event: StripeEventLike): PlanChange | null {
  const obj = (event.data?.object ?? {}) as Record<string, unknown>;
  const meta = (obj.metadata ?? {}) as Record<string, unknown>;
  const userId = (obj.client_reference_id as string) || (meta.userId as string) || "";

  switch (event.type) {
    case "checkout.session.completed":
      if (userId && (obj.payment_status === "paid" || obj.status === "complete")) {
        return { userId, plan: "full" };
      }
      return null;
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
      return userId ? { userId, plan: "free" } : null;
    default:
      return null;
  }
}

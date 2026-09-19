import Stripe from "stripe";
import type { Cycle, PaymentProvider, WebhookResult } from "./PaymentProvider";
import { interpretStripeEvent } from "./PaymentProvider";

// Stripe-backed PaymentProvider. Imported ONLY via getPayments() in server
// routes (never client-side), so the SDK stays out of every other bundle.
export class StripePayments implements PaymentProvider {
  readonly name = "Stripe";
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

  private priceId(cycle: Cycle): string | undefined {
    return cycle === "annual"
      ? process.env.STRIPE_PRICE_FULL_ANNUAL
      : process.env.STRIPE_PRICE_FULL_MONTHLY;
  }

  async createCheckoutUrl(
    userId: string,
    cycle: Cycle,
    urls: { success: string; cancel: string }
  ): Promise<string> {
    const price = this.priceId(cycle) ?? this.priceId("monthly") ?? this.priceId("annual");
    if (!price) throw new Error("No Stripe price configured.");
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      // Both carry the userId so the webhook can map the event back to the user.
      client_reference_id: userId,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
      success_url: urls.success,
      cancel_url: urls.cancel,
      allow_promotion_codes: true,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return session.url;
  }

  async parseWebhook(rawBody: string, signature: string | null): Promise<WebhookResult> {
    if (!signature) throw new Error("Missing Stripe signature.");
    const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
    // Throws on a bad/forged signature — the route turns that into a 400.
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    return interpretStripeEvent(event as unknown as { type: string; data?: { object?: Record<string, unknown> } });
  }
}

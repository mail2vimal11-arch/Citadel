import type { PaymentProvider } from "./PaymentProvider";

// Charging is configured only when the Stripe secret + webhook secret + at least
// one price ID are present. This check imports NO SDK, so client/server code can
// ask "is billing live?" cheaply.
export function paymentsConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      (process.env.STRIPE_PRICE_FULL_MONTHLY || process.env.STRIPE_PRICE_FULL_ANNUAL)
  );
}

// Returns the Stripe provider when configured, else null (demo mode). The SDK is
// loaded lazily so it never enters a bundle that only needs paymentsConfigured().
export async function getPayments(): Promise<PaymentProvider | null> {
  if (!paymentsConfigured()) return null;
  const { StripePayments } = await import("./StripePayments");
  return new StripePayments();
}

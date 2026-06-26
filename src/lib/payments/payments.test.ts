import { describe, it, expect, afterEach } from "vitest";
import { planFromStripeEvent } from "./PaymentProvider";
import { paymentsConfigured } from "./index";

describe("planFromStripeEvent", () => {
  it("a paid checkout → Full (userId from client_reference_id)", () => {
    expect(
      planFromStripeEvent({
        type: "checkout.session.completed",
        data: { object: { client_reference_id: "user-1", payment_status: "paid" } },
      })
    ).toEqual({ userId: "user-1", plan: "full" });
  });

  it("also reads userId from metadata", () => {
    expect(
      planFromStripeEvent({
        type: "checkout.session.completed",
        data: { object: { metadata: { userId: "user-2" }, status: "complete" } },
      })
    ).toEqual({ userId: "user-2", plan: "full" });
  });

  it("an unpaid/incomplete checkout → null", () => {
    expect(
      planFromStripeEvent({
        type: "checkout.session.completed",
        data: { object: { client_reference_id: "user-1", payment_status: "unpaid" } },
      })
    ).toBeNull();
  });

  it("a cancelled subscription → Free", () => {
    expect(
      planFromStripeEvent({
        type: "customer.subscription.deleted",
        data: { object: { metadata: { userId: "user-3" } } },
      })
    ).toEqual({ userId: "user-3", plan: "free" });
  });

  it("ignores unrelated events and missing userId", () => {
    expect(planFromStripeEvent({ type: "invoice.paid", data: { object: {} } })).toBeNull();
    expect(
      planFromStripeEvent({ type: "checkout.session.completed", data: { object: { payment_status: "paid" } } })
    ).toBeNull();
  });
});

describe("paymentsConfigured", () => {
  const keys = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_PRICE_FULL_MONTHLY", "STRIPE_PRICE_FULL_ANNUAL"];
  const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  afterEach(() => {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("is false with no Stripe env", () => {
    for (const k of keys) delete process.env[k];
    expect(paymentsConfigured()).toBe(false);
  });

  it("is true with secret + webhook + at least one price", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    delete process.env.STRIPE_PRICE_FULL_ANNUAL;
    process.env.STRIPE_PRICE_FULL_MONTHLY = "price_x";
    expect(paymentsConfigured()).toBe(true);
  });

  it("is false when the price is missing", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    delete process.env.STRIPE_PRICE_FULL_MONTHLY;
    delete process.env.STRIPE_PRICE_FULL_ANNUAL;
    expect(paymentsConfigured()).toBe(false);
  });
});

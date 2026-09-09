# STRIPE_SETUP.md — flip on paid plans (3 minutes, test mode first)

The billing code is already built and dormant (`src/lib/payments/`, `/api/billing/*`).
It activates the moment these four env values are present. Do it in **test mode**
first; only swap to **live** keys after the keys-off-host hosting move (`COMPLIANCE.md`).

> Why manually: in the Claude Code web sandbox the Stripe MCP isn't reachable
> (`api.stripe.com` is firewalled; CLI-added MCP servers don't surface in the web
> `/mcp`). The dashboard is faster and you keep the keys off-chat.

## 1. Switch to Test mode
Stripe Dashboard → toggle **Test mode** (top right). Everything below uses test data.

## 2. Create the product + two prices
**Product catalog → + Add product**
- Name: **Citadel Full**
- Add **two** recurring prices:
  - **$15.00 CAD / month** → copy its price ID → `price_…` → **STRIPE_PRICE_FULL_MONTHLY**
  - **$120.00 CAD / year** ($10/mo billed annually) → copy its ID → **STRIPE_PRICE_FULL_ANNUAL**

## 3. Secret key
**Developers → API keys → Secret key** (`sk_test_…`) → **STRIPE_SECRET_KEY**
(Use a restricted key with write access to *Checkout Sessions* + read on *Products/Prices* if you prefer.)

## 4. Webhook endpoint
**Developers → Webhooks → + Add endpoint**
- Endpoint URL: `https://citadel.aletheos.tech/api/billing/webhook`
- Events to send (exactly these three):
  - `checkout.session.completed`  → upgrades the user to Full
  - `customer.subscription.deleted` → downgrades to Free
  - `invoice.payment_failed` → recorded (content-free); Stripe's dunning handles the rest
- After creating it, **Reveal signing secret** (`whsec_…`) → **STRIPE_WEBHOOK_SECRET**

## 5. Put the four values in `.env.docker`
```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_FULL_MONTHLY=price_xxx
STRIPE_PRICE_FULL_ANNUAL=price_xxx
```
Then redeploy: `docker compose up -d --build`.

## 6. Verify
- Settings now shows real **Upgrade — $15/mo** / **$10/mo annual** buttons (the demo
  switch disappears).
- Click Upgrade → Stripe test Checkout → pay with test card **4242 4242 4242 4242**,
  any future expiry/CVC.
- The `checkout.session.completed` webhook fires → your plan flips to **Full**, the
  inbox cap lifts, and a content-free `SENT`-style entry lands in the Audit log.
- (Local webhook testing without a public URL: `stripe listen --forward-to
  localhost:3000/api/billing/webhook`, then use the `whsec_` it prints.)

## 7. Going live (LATER — gated)
Per `ROADMAP.md` / `COMPLIANCE.md`, only after the **keys-off-host** hosting move:
swap the four values for their **live** equivalents (`sk_live_…`, live price IDs,
a live webhook endpoint + secret) and redeploy. No code changes.

## What the app does with these (already built)
- `POST /api/billing/checkout { cycle }` → a hosted Stripe Checkout for Full.
- `POST /api/billing/webhook` → verifies the signature, maps events → `setPlan`,
  audits content-free. Stripe SDK is lazy-loaded; nothing runs until configured.

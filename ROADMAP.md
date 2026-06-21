# Roadmap — Prototype → Paid Production

_Last updated: 2026-06-21 · Companion to `PROJECT.md` (positioning + pricing) and
`ARCHITECTURE.md` (the swappable seams). This file sequences the work that turns the
working **concept prototype** into a **paid, production service**._

---

## Guiding principle
**Broad market, professional-grade — but do not monetize ahead of the trust.**
Everyone gets the same product. The whole value proposition is "your email AI never
leaves Canadian soil, and forgets on a schedule you can prove." Two things must be
genuinely real before we take a dollar:

1. **Real mailbox ingestion** — without it there is no product, only a demo.
2. **Real key custody** — we cannot charge for "provable, irreversible forgetting"
   while the encryption keys live in the same database as the data they protect
   (today's `LocalKeyVault`). Crypto-shredding is *functionally* real even now
   (destroy the key → data is unrecoverable), but "keys beside data" means a single
   database breach exposes everything. That has to move to a separate, Canadian
   key-management service before we custody anyone's real email.

Everything else (hosting speed, compliance paperwork, polish) is important but
sequenceable around those two.

---

## The gates, as phases
Effort is a rough T-shirt size (S / M / L / XL). Infra costs are estimates only.

### Phase 0 — Positioning & foundation _(in progress)_
- [x] Broaden the pitch to "private, sovereign email for everyone, professional-grade."
- [x] Define the freemium model (free = real inbox, 2 emails / capped text; Full =
      $15/mo or $10/mo paid annually).
- [ ] Confirm the product name (working title "Sovereign Inbox" vs. "Citadel").
- [ ] Decide the production data store (Postgres) and hosting region up front so we
      don't migrate twice.
- **Effort:** S · **Blocks revenue:** no (sets direction)

### Phase 1 — Real mailbox ingestion  ⟵ _start here_
Implement the `EmailSource` stubs for real, **read-only** inbox access.
- Gmail: Gmail API + OAuth (`gmail.readonly` scope) — or IMAP + App Password for a
  faster first cut on a test account.
- Microsoft 365: Microsoft Graph + OAuth (`Mail.Read`).
- Keep raw bodies **in memory only** — never written to the DB (existing hard rule).
- This is what makes the **free tier** demoable to a stranger with their own inbox.
- **Effort:** L · **Blocks revenue:** yes (no product without it) · **Infra:** OAuth
  app registration (free), Google security review later for the restricted scope.

### Phase 2 — Accounts & multi-tenancy
You cannot have paying users without logins and hard per-user data isolation.
- Auth (email + OAuth sign-in), sessions, per-user scoping on every query.
- Each user's items, keys, audit log fully partitioned; no cross-tenant reads.
- **Effort:** L · **Blocks revenue:** yes · **Infra:** an auth provider or self-hosted.

### Phase 3 — Real key management (the trust gate)
Replace the demo `LocalKeyVault` with a **Canadian-controlled HSM/KMS**.
- Per-item keys generated/stored/destroyed in the KMS, separate from the data store.
- "Forget" = the KMS destroys the key; the DB only ever held ciphertext.
- **Effort:** L · **Blocks revenue:** **yes — the core promise** · **Infra:** managed
  KMS in a Canadian region, or an on-prem HSM.

### Phase 4 — Canadian sovereign hosting + GPU
Move both the app and Apertus onto **Canadian** infrastructure.
- App + DB in a Canadian region; Apertus served on a Canadian GPU host (Apertus 8B
  q4 needs only ~6 GB VRAM — a modest **16 GB+** modern card is plenty).
- Candidates: ServaRica (Montréal; watch for GPU-VPS restock or use their dedicated
  GPU box), Hostrunway (Montréal — confirm a real 16 GB+ card, not the GT730/2 GB
  tier), BUZZ HPC (Quebec sovereign-AI cloud — strongest compliance story).
- The single seam to repoint is `OLLAMA_BASE_URL` in `src/lib/ai/ollamaClient.ts`.
- **Effort:** M · **Blocks revenue:** yes (data residency is the pitch) · **Infra:**
  ~$40–150+/mo for a GPU host, depending on card.

### Phase 5 — Durable storage + a reliable forget scheduler
- Move SQLite → a **Canadian-region managed Postgres**.
- Replace lazy "forget on read" with a **reliable scheduled job** (cron/worker) so
  forgetting happens on time even if no one opens the app, plus storage-layer
  enforcement. Keep the audit log content-free.
- **Effort:** M · **Blocks revenue:** soft (needed for a credible "we forget on
  schedule" claim) · **Infra:** managed Postgres (~$15–50/mo).

### Phase 6 — Billing & freemium gating
- Payments (e.g. Stripe) for **$15/mo** and **$10/mo annual** (12 months up front).
- Enforce the free-tier cap in the pipeline: **2 emails / limited text length**;
  Full tier unlocks full inbox, scheduler, search, and audit export.
- Plan state drives feature gates; graceful upgrade/downgrade.
- **Effort:** M · **Blocks revenue:** **yes — this is the cash register** · **Infra:**
  payment processor fees only.

### Phase 7 — Compliance & trust artifacts
What lets professionals (the premium tier) actually adopt it.
- PIPEDA + provincial health-privacy alignment; Threat & Impact Assessment (TIA).
- Signed data-residency / DPA with the Canadian host; privacy policy + ToS.
- Retention/forget policy documented; audit-log export for the user's own records.
- **Effort:** L (mostly legal, not code) · **Blocks revenue:** soft for consumers,
  **hard for the professional tier**.

### Phase 8 — Hardening
- Upgrade off the Next.js 14.2 line to Next 16 (React 19) — see `OPEN_BUGS.md`.
- Automated tests (crypto / forget / pipeline), CI already in place, monitoring,
  rate limits, reverse proxy, secrets management, a security review.
- **Effort:** M · **Blocks revenue:** soft (but do it before scale).

---

## Critical path to first revenue
The shortest honest line from here to a first paying customer:

**Phase 1 (ingestion) → Phase 2 (accounts) → Phase 3 (KMS) → Phase 4 (Canadian
hosting) → Phase 6 (billing).**

Phases 5, 7, and 8 run in parallel / fast-follow. The order is deliberate: you can
*demo* the free tier after Phase 1–2, but you should not **charge** until the key
custody (3) and Canadian hosting (4) make the privacy promise literally true —
otherwise the pitch and the product disagree, which is the one thing this product
cannot afford.

## Pricing recap (from `PROJECT.md`)
- **Free:** real inbox connection, AI on up to **2 emails** with **capped text** each.
- **Full:** **$15/month**, or **$10/month paid annually** (12 months up front) — full
  inbox, full forget scheduler, search, audit export. Professional/compliance
  add-ons ride on top of Full.

## Open decisions (need a founder call)
- **Product name:** "Sovereign Inbox" or "Citadel"? (rename touches docs + UI).
- **First ingestion target:** Gmail or Microsoft 365 first? (suggest Gmail — larger
  consumer base for the broad-market free tier).
- **KMS choice:** managed Canadian KMS vs. on-prem HSM (cost vs. control).
- **Hosting vendor:** ServaRica vs. Hostrunway vs. BUZZ HPC (see Phase 4).

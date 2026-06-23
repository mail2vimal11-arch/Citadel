# Roadmap — Prototype → Paid Production

_Last updated: 2026-06-21 · Companion to `PROJECT.md` (positioning + pricing) and
`ARCHITECTURE.md` (the swappable seams). This file sequences the work that turns the
working **concept prototype** into a **paid, production service**._

> **Feature-by-feature build sequence** (each phase tested + documented) lives in
> **`BUILD_PLAN.md`**; the Superhuman feature comparison lives in `COMPETITIVE.md`.
> This file is the higher-level production-gate view.

---

## Guiding principle
**Broad market, professional-grade — but do not monetize ahead of the trust.**
Everyone gets the same product. The whole value proposition is "your email AI never
leaves Canadian soil, and forgets on a schedule you can prove." Two things must be
genuinely real before we take a dollar:

1. **Real mailbox ingestion** — without it there is no product, only a demo.
2. **Real key custody** — we cannot charge for "provable, irreversible forgetting"
   while the encryption keys live in the same database as the data they protect.
   This is now **architecturally solved** (BUILD_PLAN P2): the default
   `KmsKeyVault` does envelope encryption — per-item keys are wrapped under a
   master key (KEK) that lives OUTSIDE the database, so the DB holds only
   ciphertext and a single database breach exposes nothing. The remaining
   production step is purely *where the KEK lives*: swap the offline
   `LocalKmsClient` for a Canadian-controlled managed KMS / HSM before we
   custody anyone's real email.

Everything else (hosting speed, compliance paperwork, polish) is important but
sequenceable around those two.

---

## The gates, as phases
Effort is a rough T-shirt size (S / M / L / XL). Infra costs are estimates only.

### Phase 0 — Positioning & foundation _(in progress)_
- [x] Broaden the pitch to "private, sovereign email for everyone, professional-grade."
- [x] Define the freemium model (free = real inbox, 2 emails / capped text; Full =
      $15/mo or $10/mo paid annually).
- [x] Product name confirmed: **Citadel** (tagline: "your sovereign inbox").
- [ ] Decide the production data store (Postgres) and hosting region up front so we
      don't migrate twice.
- **Effort:** S · **Blocks revenue:** no (sets direction)

### Phase 1 — Real mailbox ingestion  ⟵ _in progress_
Implement the `EmailSource` stubs for real, **read-only** inbox access.
- **Gmail (first target): ✅ built.** `GmailSource` reads via the Gmail API with
  OAuth 2.0 (`gmail.readonly`), bodies in memory only; Connect/Disconnect in the
  UI. _Remaining for production:_ per-user tokens in a secrets manager (today a
  local gitignored file), and Google's verification for the restricted scope
  before going public (test users work without it).
- **Microsoft 365 (next):** Microsoft Graph + OAuth (`Mail.Read`). Must support
  **both** account types — register the app as **multi-tenant + personal accounts**
  and use the **`/common`** authority so it works for corporate/work-or-school
  (Azure AD) **and** personal Outlook/Hotmail/Live IDs.
- Keep raw bodies **in memory only** — never written to the DB (existing hard rule).
- This is what makes the **free tier** demoable to a stranger with their own inbox.
- **Effort:** L · **Blocks revenue:** yes (no product without it) · **Infra:** OAuth
  app registration (free); Google security review later for the restricted Gmail
  scope; Microsoft app registration for the `/common` (multi-tenant + consumers)
  audience.

### Phase 2 — Accounts & multi-tenancy
You cannot have paying users without logins and hard per-user data isolation.
- Auth (email + OAuth sign-in), sessions, per-user scoping on every query.
- Each user's items, keys, audit log fully partitioned; no cross-tenant reads.
- **Effort:** L · **Blocks revenue:** yes · **Infra:** an auth provider or self-hosted.

### Phase 3 — Real key management (the trust gate) · seam shipped (BUILD_PLAN P2)
The **envelope-encryption seam is built**: the default `KmsKeyVault` keeps keys
apart from data (DB holds only ciphertext). What remains is repointing the
`KmsClient` seam from the offline `LocalKmsClient` at a **Canadian-controlled
HSM/KMS**.
- Per-item keys generated/stored/destroyed in the KMS, separate from the data store.
- "Forget" = destroy the wrapped per-item key; the DB only ever held ciphertext.
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
- ~~Product name~~ → **Citadel** (tagline "your sovereign inbox"). _Decided._
- ~~First ingestion target~~ → **Gmail** first; **Microsoft 365 next**, covering both
  corporate (Azure AD) and personal Outlook/Hotmail/Live accounts. _Decided._
- ~~Gmail first cut~~ → **Gmail API + OAuth**, built (read-only `gmail.readonly`).
  _Decided & done._
- **KMS choice:** managed Canadian KMS vs. on-prem HSM (cost vs. control).
- **Hosting vendor:** ServaRica vs. Hostrunway vs. BUZZ HPC (see Phase 4).

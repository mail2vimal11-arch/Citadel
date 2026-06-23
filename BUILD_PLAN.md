# Build Plan — Citadel, feature by feature

> The sequenced plan to build the **full product**. Each phase is **one shippable
> product feature/function**. `ROADMAP.md` holds the higher-level production
> gates and pricing; `COMPETITIVE.md` maps these against Superhuman.

## Working agreement (applies to EVERY phase)
A phase is **not done** until all four are true:
1. **Built** behind the existing interfaces/seams (no shortcuts around them).
2. **Tested** — unit tests for the new logic + `tsc --noEmit` + `next build`
   green in CI. Anything user-facing also gets a manual smoke-test note.
3. **Docs updated** — `CHANGELOG.md` always; plus the relevant subset of
   `PROJECT.md` / `ARCHITECTURE.md` / `README.md` / `CLAUDE.md` / `COMPETITIVE.md`.
   Every production-only concern keeps its `// TODO(production):` marker.
4. **Shipped** — committed and pushed to the working branch; PR stays current.

**Hard rules unchanged:** synthetic data only by default · AI 100% local via
Ollama · never log keys or decrypted content · forget must be irreversible.

## How to read a phase
Each phase lists **Goal · Build · Test · Docs · Done-when**. Effort is a
T-shirt size (S/M/L). "Gate" phases unblock revenue and should not be skipped.

---

## Stage A — Foundation (makes "tested + sellable" real)

### P0 · Test harness  · S · ✅ DONE (2026-06-23)
- **Goal:** every later phase can ship real tests.
- **Built:** added Vitest (+ `vitest.config.ts` with the `@` alias and a `test`
  script); extracted Gmail MIME parsing into `src/lib/email/gmailParse.ts` so it
  is testable without network/OAuth; wired `npm test` into CI between typecheck
  and build.
- **Tested:** 14 seed tests pass — `crypto` (round-trip + destroyed-key →
  unrecoverable + tamper + fresh-IV), `settings` (forget-schedule math),
  `gmailParse` (header/decode/strip/extract/map), `getEmailSource` selection.
  `tsc --noEmit` and `next build` stay green with tests present.
- **Docs:** CHANGELOG; CLAUDE (added `npm test`); OPEN_BUGS (tests/CI item
  closed). Done.

### P1 · Accounts & multi-tenancy  · L · **Gate** · ✅ DONE (2026-06-23)
- **Goal:** real users with isolated data — prerequisite for anything paid.
- **Built:** **Auth.js / NextAuth v5** (Google provider, Prisma adapter,
  database sessions) in `src/auth.ts`; a `/signin` page and an auth-gated
  `(app)` layout. Added `userId` to `DerivedItem` / `AuditEvent` / `Setting`
  (composite uniqueness `[userId, sourceId]`) and threaded it through pipeline,
  inbox, forget engine, audit, settings, search, and per-user Gmail tokens.
  `currentUserId()` is the single tenancy chokepoint; routes use
  `requireUserId()` (401 when unauthenticated). **Demo fallback:** unset
  `AUTH_*` → single-user `demo-user`, so the public prototype keeps working.
- **Tested:** a DB-backed isolation test drives the real pipeline for two
  tenants over the same mailbox and proves they cannot see / search / forget
  each other's items; `currentUserId` branch tests (demo / signed-in /
  unauthenticated). 20 tests total green; `tsc` + `next build` clean.
- **Docs:** ARCHITECTURE (data model + tenancy + auth/routes), PROJECT, CLAUDE,
  README, CHANGELOG. Done.

### P2 · Real key management (KMS seam)  · L · **Gate** · ✅ DONE (2026-06-23)
- **Goal:** the trust promise — keys live apart from the data.
- **Built:** `KmsKeyVault` (now the default) does **envelope encryption** through
  a `KmsClient` seam: per-item data keys are minted by the KMS, the payload is
  encrypted in memory, and only the **wrapped** DEK is persisted — the DB holds
  nothing but ciphertext. `LocalKmsClient` runs the KMS fully offline with the
  master key (KEK) in `KMS_MASTER_KEY` or a gitignored `.citadel-secrets/`
  file, never in the DB. Forget = destroy the one wrapped DEK. `KEY_VAULT`
  (`auto|kms|local`) selects; legacy raw-key rows read transparently.
- **Tested:** vault contract tests run against **both** vaults (issue → encrypt →
  destroy → unrecoverable); KMS-specific tests prove the stored value is wrapped
  (not raw), that a wrong KEK can't recover it (DB alone is useless), the legacy
  read path, and KMS wrap/unwrap round-trips. 28 tests total green.
- **Docs:** ARCHITECTURE (KeyVault → envelope impl + data model), ROADMAP,
  COMPETITIVE (BYOK/CMEK ✅), CLAUDE, CHANGELOG; `KEY_VAULT`/`KMS_MASTER_KEY`
  added to `.env` + `.env.docker.example`. Done.
- **Done-when:** forgetting destroys the key; data unrecoverable. ✅ — and the
  remaining production gap is only WHERE the KEK lives (swap `LocalKmsClient`
  for a Canadian-controlled managed KMS).

### P3 · Durable storage + reliable forget scheduler  · M · **Gate** · ✅ DONE (2026-06-23)
- **Goal:** truthful "forgets on schedule, even if you never open the app."
- **Built:** a background **forget scheduler** (`src/lib/forget/scheduler.ts`)
  started on boot via `src/instrumentation.ts`, running an all-users sweep
  (`runForgetSweepAll`) every `FORGET_SWEEP_INTERVAL_MS` (default 60s); on-read
  sweep kept as a backstop. **Durable Postgres seam:** provider-agnostic schema +
  optional compose `db` service (`--profile postgres`); the move is a two-line
  switch (provider + DATABASE_URL). Audit log stays content-free (sweep logs only
  a count). Edge build keeps the node-only scheduler out via a stub swap in
  `next.config`.
- **Tested:** `isDue` (due/at/after/null), interval parsing, scheduler
  start/stop/idempotency + disabled, and an all-users sweep that forgets every
  expired item across users while sparing not-yet-due ones (keys shredded). The
  **migration smoke test** validates the schema under the `postgresql` provider
  offline (opt-in live `db push` via `TEST_DATABASE_URL`). 39 pass + 1 skipped;
  `tsc` + `next build` green; verified `scheduler started` on boot.
- **Docs:** ARCHITECTURE (scheduler + durable storage), ROADMAP, CLAUDE,
  CHANGELOG; `FORGET_SWEEP_INTERVAL_MS` + Postgres `DATABASE_URL` in env files.
- **Done-when:** items forget on time with no user interaction. ✅ (production
  step that remains: point DATABASE_URL at a managed Canadian Postgres, and for
  multi-instance deploys run the sweep from a single leader/cron.)

---

## Stage B — Daily-driver email (make switching painless)

### P4 · Inbox list & reading UX  · M
- **Goal:** a real inbox, not just a process list.
- **Build:** message list, thread/read view (bodies in memory only), keyboard
  archive/done, pagination.
- **Test:** rendering + state tests; smoke note.
- **Docs:** README (demo script), CHANGELOG.

### P5 · Microsoft 365 ingestion  · L
- **Goal:** the second mailbox (corporate + personal Outlook).
- **Build:** `MicrosoftGraphSource` (read-only `Mail.Read`) via the `/common`
  authority; reuse the `EmailSource` seam + OAuth pattern.
- **Test:** Graph payload → `RawEmail` mapping tests; selector tests.
- **Docs:** ARCHITECTURE (EmailSource status), README (connect M365),
  COMPETITIVE, CHANGELOG.

### P6 · Split Inbox / auto-triage lanes  · M
- **Goal:** organize by VIP / tool / rule, not one flat list.
- **Build:** user-defined lanes; route processed items by sender/label/rule.
- **Test:** routing-rule unit tests.
- **Docs:** PROJECT, COMPETITIVE, CHANGELOG.

---

## Stage C — AI that earns the premium

### P7 · Write-with-AI + Auto Drafts + Tone  · M
- **Goal:** draft from a prompt; proactively suggest replies in the user's voice.
- **Build:** prompt-to-draft endpoint; opt-in auto-draft on incoming; a
  per-user tone profile fed into the system prompt. All via `ApertusLocalProvider`.
- **Test:** prompt-assembly unit tests; fallback-path tests.
- **Docs:** ARCHITECTURE (AI prompts), COMPETITIVE, CHANGELOG.

### P8 · Ask AI (Q&A over your inbox)  · M
- **Goal:** "what did Jordan say about the deadline?"
- **Build:** retrieval over the in-memory embeddings + derived data, answered
  locally by Apertus. Nothing persisted beyond existing encrypted items.
- **Test:** retrieval ranking tests; answer-grounding guardrail test.
- **Docs:** ARCHITECTURE, COMPETITIVE, CHANGELOG.

---

## Stage D — Productivity & polish

### P9 · Snippets · Send Later · Reminders · Snooze  · M
- **Build:** reusable snippets; scheduled send; follow-up reminders; snooze —
  each as its own small, tested unit.
- **Test:** scheduling/reminder unit tests.
- **Docs:** PROJECT, COMPETITIVE, CHANGELOG.

### P10 · Calendar (optional)  · M
- **Build:** See-Your-Day inline availability, create-event-from-email.
- **Test:** availability-calc tests.
- **Docs:** COMPETITIVE, CHANGELOG.

### P11 · Keyboard-first UX + Cmd+K  · M
- **Build:** shortcut map, command palette, fast navigation.
- **Test:** keymap unit tests; a11y smoke.
- **Docs:** README, COMPETITIVE, CHANGELOG.

---

## Stage E — Monetize

### P12 · Billing & freemium gating  · M · **Gate**
- **Goal:** the cash register (only after P1–P3 make the promise true).
- **Build:** Stripe; **Full $15/mo or $10/mo annual**; enforce the **free cap
  (2 emails / limited text)** in the pipeline; plan-state feature gates.
- **Test:** gating unit tests (free vs full limits); webhook handling tests.
- **Docs:** PROJECT (pricing live), ROADMAP, CHANGELOG.

---

## Stage F — Team tier

### P13 · Team workspaces  · L
- **Build:** orgs/teams; shared snippets; share-&-comment on a thread; reply
  indicators; (opt-in) team read statuses.
- **Test:** sharing-permission tests (no leakage outside team).
- **Docs:** ARCHITECTURE, COMPETITIVE, CHANGELOG.

---

## Stage G — Enterprise tier (premium, last)

### P14 · SSO + SCIM  · L
- **Build:** SAML SSO (Google/Microsoft/Okta) + SCIM provisioning/deprovisioning.
- **Test:** SAML assertion + SCIM lifecycle tests.
- **Docs:** ARCHITECTURE, COMPETITIVE, CHANGELOG.

### P15 · Admin console + roles + team AI governance  · L
- **Build:** centralized admin (seats, permissions, billing), custom roles,
  org-level AI enable/disable.
- **Test:** RBAC tests.
- **Docs:** COMPETITIVE, CHANGELOG.

### P16 · Compliance pack  · L
- **Build:** DLP / sensitivity labels, audit export, BYOK/CMEK option; produce
  PIPEDA/SOC2/ISO artifacts + a Threat & Impact Assessment (TIA).
- **Test:** DLP rule tests; audit-export integrity test.
- **Docs:** PROJECT (compliance), ROADMAP, COMPETITIVE, CHANGELOG.

### P17 · Agentic AI + MCP (optional, cutting-edge)  · L
- **Build:** multi-step workflow agents; MCP connectors — all on
  Canadian-controlled inference.
- **Test:** tool-call + guardrail tests.
- **Docs:** ARCHITECTURE, COMPETITIVE, CHANGELOG.

---

## Fast path to a paid product
Realistically, the shortest honest line to charging money is:
**P0 → P1 → P2 → P3 → P4 → P5 → P7 → P12.**
Everything else (Stage D polish, Stage F team, Stage G enterprise, P8/P10/P17)
is fast-follow once you have paying users. "Full product" is the whole list —
but ship the gated core first, in order, each phase tested and documented.

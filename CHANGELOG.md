# Changelog

All notable changes to Citadel (tagline: "your sovereign inbox") are recorded here.
This is a pre-release
prototype; versions are documentation milestones, not shipped releases. Format
loosely follows [Keep a Changelog](https://keepachangelog.com/); the project is not
yet using semantic-version releases.

## [Unreleased]
- **Hardening pass (robustness + mobile).**
  - **Live "Process inbox" progress (BUG-003):** `/api/process` now **streams**
    NDJSON (`{type:progress,current,total}` per email → `done`/`error`) via a
    pipeline `onProgress` callback; the inbox shows a live "Processing X of N…"
    bar instead of sitting silently on "Working…" for minutes on a CPU host.
  - **No more hung buttons:** every async action — process, forget/forget-all,
    disconnect, reset, search, Ask AI, Write-with-AI, send — now resets its
    busy/loading state in `finally` and surfaces a clear message on failure
    (network drop, server error) instead of spinning forever. The inbox/audit
    loaders fail to a **Retry**/empty state, not an infinite "Loading…".
  - **Mobile pass:** flex children may shrink (no accidental horizontal scroll),
    the upgrade-banner CTA goes full-width, and the top nav / reading pane /
    compose modal tighten on small screens.
- **Theme: copper → champagne-gold (premium dark).** Reskinned the brand accent
  from purple→pink to a richer copper→antique-gold on warm-espresso surfaces with
  ivory ink and faint brass hairlines — a "private-vault" premium feel for the
  regulated-professional audience. CSS-only.
- **`COMPLIANCE.md` + sovereignty posture (from two verified research passes).**
  Established that **no cloud jurisdiction is immune** (US-owned → CLOUD Act; even
  non-US providers are reachable via a local subsidiary — *King v. OVH*, Ont.
  2025), so the load-bearing guarantee is **technical**: keys held **off the
  compute host** + crypto-shredding, so a host/court can only obtain unreadable
  ciphertext. **Retired the "notify all clients & delete accounts" plan** (gag
  orders make notification unreliable; reactive deletion risks obstruction).
  Added an interim-host ranking (DigitalOcean TOR1 verified; Cloudspace pending
  ownership diligence; OVH BHS5 old-GPU; Bedrock/Azure disqualified — US-owned +
  can't run Apertus). Tightened the ARCHITECTURE KMS `TODO(production)` to specify
  an **off-host** external key manager, and updated ROADMAP Phase 4.
- **P12 (gating half) — Freemium limits.** Added a per-user **plan** (free | full)
  and enforced the **free cap in the pipeline**: free = a real inbox capped at
  **2 emails** with **limited AI text** (2000 chars); full = unlimited. Processing
  stops at the cap and reports it (inbox flash + a **Plan** section in Settings
  with a demo switch). Limits are a pure, tested module (`src/lib/billing.ts`)
  plus an end-to-end pipeline test. **Charging is deliberately NOT built** — real
  Stripe billing is deferred until the Canadian-hosting + managed-KMS sovereignty
  gates are live (ROADMAP); the plan-state seam is ready and the demo switch is
  clearly marked. The `Setting.plan` column is additive (default `free`) — safe
  `db push`, no data loss.
- **UX: one "Add account" button.** Replaced the separate "Add Gmail" / "Add
  Microsoft" buttons with a single **"+ Add account"** (Superhuman-style): it
  opens a provider chooser when more than one is configured, or goes straight to
  the provider when only one is. Microsoft only appears once its OAuth creds are
  set. (Note: the **Gmail message id is now stable** at `gmail:<accountId>:<id>`
  as of the P5.5 multi-account change — items processed on a *pre-P5.5* build use
  the old `gmail:<id>` and can appear duplicated after upgrading; **Reset demo**
  once to normalize. The dedupe itself is correct; Refresh never creates rows.)
- **Send & Reply (read-write) — NEW.** Citadel can now **send** mail, not just
  read it. A compose/reply modal (New email + a Reply button that seeds the AI
  draft) sends as a chosen connected account through a swappable **`MailSender`
  seam** (Gmail `messages.send` / Microsoft Graph `sendMail`). This adds the
  least-privilege **send scopes** (`gmail.send` / `Mail.Send`) — a deliberate
  shift from read-only — so **existing connected accounts must reconnect** to
  grant it (a clear "reconnect" hint shows on the first send if not). Every send
  takes an explicit confirm, stores **nothing** (raw content never persisted),
  and records a **content-free `SENT`** audit event. MIME construction (incl.
  header-injection stripping), base64url, `Re:` handling and recipient parsing
  are a pure, unit-tested module (`src/lib/email/mime.ts`). **Replies thread
  properly** (`sendReply`): Gmail sends with the original `Message-Id`/
  `References` + `threadId`; Microsoft uses Graph `createReply` — so a reply lands
  in the original conversation (a true single client, no app-shuffle). This
  stays consistent with the privacy promise: sending stores nothing and the
  promise is about *residency + minimization + forgetting*, not read-only.
  10 new tests (140 total green).
- **P11 — Keyboard-first UX + Cmd+K (BUILD_PLAN):** a **command palette** —
  press **⌘K / Ctrl+K** anywhere in the inbox to fuzzy-search and run actions
  (Process inbox, Refresh, Search, toggle Split Inbox, Forget all, Reset, connect/
  add accounts, go to Settings/Audit), arrow-navigable, Enter to run, Esc to close.
  The match/rank logic is a pure, unit-tested module (`src/lib/commands.ts`:
  substring beats subsequence, position-weighted). Joins the existing
  `j`/`k`/`e`/`f`/`/`/`r` shortcuts. 9 new tests (132 total green).
- **P10 — Calendar (BUILD_PLAN):** scheduling helpers for replies. **Propose
  times** inserts suggested meeting slots into the Write-with-AI box, and **Add to
  calendar** downloads an `.ics` event built from the message (create-event-from-
  email). Availability is a pure, unit-tested module (`src/lib/availability.ts`):
  free-slot computation around busy blocks, next-weekday proposals, and RFC-5545
  VEVENT generation. It models an **open working day** for now — live free/busy
  needs a Calendar scope (`// TODO(production):`). 7 new tests (123 total green).
- **P9 — Snippets · Snooze / Remind-me (BUILD_PLAN):** **Snooze** an item until a
  chosen time (Later today / This evening / Tomorrow 9am / Next week) — it drops
  out of the inbox and **reappears when due**, with a "Snoozed (N)" toggle to peek;
  this doubles as follow-up reminders. **Snippets** — reusable templates managed
  in Settings, inserted as one-tap chips into the Write-with-AI box. Both are
  client-side (localStorage), and the scheduling is a pure, unit-tested module
  (`src/lib/schedule.ts`). **Send Later** is deferred: actual transmission needs a
  send-capable mail scope (Citadel's connectors are read-only), so only the
  scheduling primitive ships now. 11 new tests (116 total green).
- **P5.5 — Multi-account mailbox (BUILD_PLAN):** connect **several** Gmail and/or
  Microsoft accounts per user (work + personal), not one of each. A shared
  per-account token store (`accountStore.ts`) holds a list of accounts per
  user+provider and **migrates the old single-token file** into a one-account
  list on read (no re-auth). The OAuth start uses `prompt=select_account` so a
  second account can be added; each provider source iterates all its accounts and
  a new `CompositeSource` **merges Gmail + Microsoft into one inbox**, with
  `sourceId` namespaced per account so nothing collides. Status routes now return
  the account list, and `DELETE …/status?accountId=` disconnects a single account.
  The inbox shows account chips with per-account disconnect plus Add Gmail / Add
  Microsoft. Bodies still processed in memory only. 8 new tests (104 total green).
- **P8 — Ask AI / Q&A over your inbox (BUILD_PLAN):** ask a natural-language
  question and get an answer **grounded in your own mail**, fully local. `POST
  /api/ask` does RAG: retrieval reuses the in-memory semantic search (keyword
  fallback) to pull the most relevant ACTIVE items, then the local model answers
  using ONLY those items' derived fields (from/subject/summary) and admits when
  the answer isn't there — no hallucinated facts, no raw bodies, nothing
  persisted. Forgotten items are swept first so they're never used as context.
  An "Ask AI" box in the inbox shows the answer with clickable source emails. The
  Ask prompt is a pure tested builder; the offline provider answers too (surfaces
  matches) so it works with no Ollama. 5 new tests (97 total green).
- **P6 — Split Inbox / auto-triage lanes (BUILD_PLAN):** the inbox can group into
  lanes instead of one flat list — **VIP / Important / Newsletters & notices /
  Everything else / Forgotten** — routed by priority, triage label, and a
  user-defined **VIP sender list**. A Split: On/Off toggle and an inline VIP
  editor live in the list toolbar; keyboard nav follows the grouped order;
  both preferences persist in `localStorage` (client-only, like the "done"
  declutter). Routing is a pure, unit-tested module (`src/lib/lanes.ts`) — 11
  new tests (92 total green).
- **CI: SSH auto-deploy.** Added a gated `deploy` job to the CI workflow that
  ships to the live host **after the build passes**, on a push to the deploy
  branch, via SSH (`git pull` + `docker compose up -d --build`). It no-ops with a
  notice until the `SSH_HOST` / `SSH_USER` / `SSH_KEY` / `DEPLOY_PATH` repo
  secrets are set (so CI stays green meanwhile). See README → "Continuous
  deployment". The container's build runs `prisma db push`, so additive schema
  changes apply to the SQLite volume with no data loss.
- **P7 — Write-with-AI + Auto Drafts + Tone (BUILD_PLAN):** the AI now writes in
  the user's voice. A **per-user tone profile** (Professional / Warm / Concise /
  Direct / Formal, stored on the `Setting` row) is folded into the system prompt
  for every draft. **Write-with-AI** — a new compose box in the reading pane —
  turns a freeform instruction into an email via `POST /api/compose`, using the
  saved tone and the selected message's NON-sensitive derived context
  (from/subject/summary; never a raw body, since none is stored); nothing is
  persisted, and a **content-free `DRAFTED`** audit entry records that the
  assistant acted. The pipeline's **auto-draft** (the suggested reply on every
  processed email) is now tone-aware too. All prompt wording + the tone directive
  live in a pure, unit-tested module (`src/lib/ai/prompts.ts`); the offline
  heuristic provider implements `compose`/tone so the feature works with no
  Ollama. Settings page gains a tone picker. 15 new tests (81 total green).
- **P5 — Microsoft 365 ingestion (BUILD_PLAN):** the second real mailbox.
  `MicrosoftGraphSource` reads recent inbox messages via **Microsoft Graph** with
  the least-privilege **`Mail.Read`** scope, returning bodies to the pipeline in
  memory only (never persisted) — exactly like the Gmail connector. OAuth runs on
  the **`/common`** authority so both work/school (Microsoft 365) and personal
  Outlook.com accounts can connect; per-user refresh tokens live in a gitignored
  `.citadel-secrets/microsoft-<userId>.json` (rotation-aware). Added the start /
  callback / status routes under `/api/auth/microsoft`, a **Connect / Disconnect
  Microsoft** control in the inbox (the connected banner + empty state now name
  whichever provider is live), and the `microsoft` (alias `m365`) option to
  `EMAIL_SOURCE` (`auto` prefers a connected Gmail, then Microsoft, else demo).
  Graph payload mapping is pure and unit-tested (`graphParse.ts`) — 12 new tests
  plus selector cases; 65 total green.
- **P4 — Inbox list & reading UX (BUILD_PLAN):** the inbox is now a real
  two-pane reader, not a flat process list. A compact **message list** (priority
  dot, sender, subject, summary snippet, received time, live forget countdown)
  sits beside a **reading pane** showing the full AI-derived view of the selected
  item — summary, suggested reply (with copy), badges, and a reminder that the
  raw body was processed in memory only and never stored. Added **keyboard
  navigation** (`j`/`k` move, `Enter`/`o` open, `e` mark done, `f` forget now,
  `/` search, `r` refresh, `Esc` close), a client-only **"done" declutter**
  (archive-like; persisted in `localStorage`, never sent to the server — it does
  not forget or delete), and **pagination** (20/page). Search results are now
  clickable and select the message. The reading logic is extracted to a pure,
  fully-tested view-model (`src/lib/inboxView.ts`): sorting, key→action mapping,
  selection movement, countdown, declutter, pagination — 13 new tests (53 total).
- **P3 — Durable storage + reliable forget scheduler (BUILD_PLAN):** the
  "forgets on schedule, even if you never open the app" promise is now literally
  true. A **background scheduler** (`src/lib/forget/scheduler.ts`), started on
  server boot via `src/instrumentation.ts`, runs an **all-users** forget sweep
  (`runForgetSweepAll`) every `FORGET_SWEEP_INTERVAL_MS` (default 60s) — so
  expired items are crypto-shredded close to their deadline with zero user
  interaction. The lazy on-read sweep stays as a backstop. **Durable Postgres
  seam:** the data model is provider-agnostic, so going from SQLite to a
  Canadian-region managed Postgres is a two-line switch (provider + DATABASE_URL,
  then `prisma db push`); added an optional `db` Postgres service to
  docker-compose (off by default, `--profile postgres`) and an offline
  **migration smoke test** that validates the schema under the `postgresql`
  provider (plus an opt-in live `db push` when `TEST_DATABASE_URL` is set). New
  tests cover `isDue`, the interval parser, scheduler start/stop/idempotency,
  and the all-users sweep — 39 passing + 1 opt-in skipped. Verified the worker
  logs `scheduler started` on boot. (Edge build note: `next.config` swaps the
  scheduler for a no-op stub in non-Node runtimes so its node-only graph never
  reaches the Edge bundler.)
- **P2 — Real key management / KMS seam (BUILD_PLAN):** keys now live **apart
  from the data**. New default `KmsKeyVault` does **envelope encryption** through
  a `KmsClient` seam: a per-item data key (DEK) is minted by the KMS, used
  in-memory to encrypt the payload, and only the **wrapped** DEK (encrypted under
  the KMS master key) is stored — so the database holds nothing but ciphertext.
  `LocalKmsClient` runs the KMS fully offline with the master key (KEK) in
  `KMS_MASTER_KEY` or an auto-provisioned, gitignored `.citadel-secrets/`
  file (mode 0600) — never in the DB. Forgetting destroys the one wrapped DEK,
  so an item is unrecoverable even to someone holding both the DB and the KEK.
  `KEY_VAULT` (`auto|kms|local`) selects the vault; the old `LocalKeyVault`
  (raw keys beside data) remains under `KEY_VAULT=local` for contrast. Legacy
  raw-key rows are read transparently, so the upgrade loses no existing items.
  Added vault contract tests across both vaults plus KMS-specific tests (stored
  value is wrapped not raw; wrong KEK can't recover; legacy read; wrap/unwrap
  round-trip) — 28 tests total, all green. The one remaining production gap is
  WHERE the KEK lives (swap `LocalKmsClient` for a Canadian-controlled KMS).
- **P1 — Accounts & multi-tenancy (BUILD_PLAN):** introduced real sign-in and
  per-user data isolation with **Auth.js / NextAuth v5** (Google provider,
  Prisma adapter, database sessions). Every stored row now carries a `userId`
  (`DerivedItem`, `AuditEvent`, `Setting`) and **every query is scoped by user** —
  pipeline, inbox, forget sweep, audit, settings, search, and per-user Gmail
  OAuth tokens. `currentUserId()` is the single tenancy chokepoint; API routes
  resolve it via `requireUserId()` (401 when unauthenticated). Added a `/signin`
  page and gated the `(app)` layout. **Demo mode preserved:** when `AUTH_SECRET`
  /`AUTH_GOOGLE_*` are unset the app runs single-user (no login) so the public
  prototype stays open. New tests prove **two accounts cannot see, search, or
  forget each other's items** (real pipeline over the same mailbox), plus the
  `currentUserId` branches — 20 tests total, all green. Added a DB-backed test
  harness (`vitest.globalSetup.ts` provisions a throwaway `prisma/test.db`).
- **P0 — Test harness (BUILD_PLAN):** added **Vitest** with a `test` script and
  `npm test` wired into CI (typecheck → test → build). Extracted Gmail MIME
  parsing into `src/lib/email/gmailParse.ts` (testable without network). 14 seed
  tests cover the crypto-shredding guarantee, the forget-schedule math, Gmail
  parsing, and the email-source selector.
- **Planning docs:** added `COMPETITIVE.md` (Superhuman feature map — D2C vs
  enterprise — and where Citadel matches / differentiates; grammar excluded) and
  `BUILD_PLAN.md` (the product built feature-by-feature, each phase gated on
  tests + doc updates). Cross-linked from `PROJECT.md` and `ROADMAP.md`.
- **Dark, Superhuman-style UI:** redesigned the theme to Superhuman's actual
  palette — near-black canvas with ambient purple/pink/blue glows, the signature
  purple→pink (`#9E6EE5→#FA75F8`) gradient on the primary button and brand mark,
  gradient headings, glassy surfaces, and a translucent blurred top bar.
- **Marketing landing page** at `/` (hero, faux inbox preview, feature trio,
  how-it-works, freemium pricing, CTA). The app moved to `/inbox` behind an
  `(app)` route group with its own nav layout; the landing uses the bare root
  layout. Nav + the OAuth callback now target `/inbox`.
- **Live deployment:** Citadel runs at `https://citadel.aletheos.tech` as a
  Docker container behind the host's existing Traefik proxy (auto HTTPS via
  Let's Encrypt). Added `Dockerfile`, `docker-compose.yml`, `.env.docker.example`,
  and `APP_BASE_URL` for correct redirects behind the proxy.
- **Fixes:** the connected-Gmail banner and the search box were still using light
  inline styles that clashed on the dark theme — both now use the dark surfaces.
- **Real Gmail ingestion (read-only):** implemented `GmailSource` against the Gmail
  API with OAuth 2.0 (`gmail.readonly`), plus the sign-in flow
  (`/api/auth/google`, `/callback`, `/status`) and a `getEmailSource()` selector
  (`EMAIL_SOURCE=auto|sample|gmail`). Raw bodies are processed in memory only and
  never stored. The inbox UI gains Connect/Disconnect Gmail and an honest
  "connected to real mail" banner. OAuth tokens live in a gitignored local file
  (`/.citadel-secrets/`) — `TODO(production)`: per-user secrets manager.
- **Renamed the product to Citadel** (tagline: "your sovereign inbox"). Updated the
  UI brand/metadata, docs, `package.json`/lockfile name, and Prisma schema header.
- **Ingestion targets decided:** Gmail first; Microsoft 365 next, supporting both
  corporate (Azure AD) and personal Outlook/Hotmail/Live accounts via the Graph
  `/common` authority (recorded in `ROADMAP.md`).
- **Repositioning:** broadened the pitch from "Canadian regulated professionals" to
  **"private, sovereign email for everyone, built to a regulated-professional
  standard."** Everyone gets the same product; professionals are the credibility
  anchor + premium tier. Updated `PROJECT.md`, `CLAUDE.md`, `README.md`, and the AI
  system persona in `ApertusLocalProvider`.
- **Freemium model defined:** free tier = real inbox, AI on up to 2 emails with
  capped text; Full tier = **$15/mo**, or **$10/mo paid annually**.
- **`ROADMAP.md` added:** sequenced, effort-sized plan from prototype to paid
  production (ingestion → accounts → KMS → Canadian hosting → billing, with
  compliance/storage/hardening as fast-follows).
- Documentation set: VPS deployment + troubleshooting guide in `README.md`;
  `CLAUDE.md` (project memory), `PROJECT.md` (overview), this changelog, and
  `OPEN_BUGS.md`.

## [0.1.0] — 2026-06-19 — Working concept prototype

First end-to-end prototype, verified running on a VPS with real local AI.

### Added
- **Core loop:** load 15 synthetic emails → AI pass (summary / triage / draft) →
  store only derived data, encrypted per-item (AES-256-GCM) → forget on schedule by
  destroying the per-item key → content-free audit log.
- **Local AI:** `ApertusLocalProvider` running **Apertus 8B Instruct** via a local
  Ollama server (`/api/chat`), fully offline. `LocalHeuristicProvider` kept as an
  offline fallback. Provider chosen by `AI_PROVIDER` (`auto`|`apertus`|`heuristic`);
  `auto` pings Ollama and falls back with a clear warning (never silently fakes AI).
- **Embeddings / search:** `EmbeddingProvider` interface + `LocalEmbeddingProvider`
  (`nomic-embed-text`) powering an in-memory semantic search (`/api/search`); vectors
  are never persisted, and it degrades to keyword match offline.
- **Single Ollama transport** (`src/lib/ai/ollamaClient.ts`) — the one seam to
  repoint at Canadian-controlled infrastructure.
- **Swappable interfaces:** `EmailSource` (+ Gmail/Microsoft stubs), `AIProvider`,
  `EmbeddingProvider`, `KeyVault` (demo `LocalKeyVault`).
- **UI:** Inbox (process, forget now, forget all, reset, "prove unrecoverable"),
  Settings (forget schedule), Audit log, semantic search box, shared nav.
- **Docs:** non-technical `README.md` (incl. Ollama + Apertus setup) and
  `ARCHITECTURE.md` (interfaces + every `TODO(production)` seam).

### Changed
- Output language **pinned to English** in `ApertusLocalProvider` — Apertus is a
  Swiss multilingual model and otherwise replied in German/French.
- Bumped **Next.js 14.2.15 → 14.2.35** to clear the Dec 2025 critical security
  advisory (no code changes; build verified).

### Security / privacy
- Keys and decrypted content are never logged; Prisma query logging is off.
- Audit log is content-free by construction; raw email bodies stay in memory only.
- `LocalKeyVault` is explicitly **insecure (demo only)** — keys live beside data.

### Known issues
See `OPEN_BUGS.md` (CPU-only slowness, over-eager "Urgent" triage, residual Next.js
DoS-class advisories pending a Next 16 upgrade).

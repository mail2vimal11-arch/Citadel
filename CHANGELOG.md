# Changelog

All notable changes to Citadel (tagline: "your sovereign inbox") are recorded here.
This is a pre-release
prototype; versions are documentation milestones, not shipped releases. Format
loosely follows [Keep a Changelog](https://keepachangelog.com/); the project is not
yet using semantic-version releases.

## [Unreleased]
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

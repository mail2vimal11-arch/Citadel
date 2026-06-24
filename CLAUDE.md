# Project Memory — Citadel

> This file is read automatically by Claude Code as project memory. Keep it short,
> current, and factual. For the human-facing overview see `PROJECT.md`.

## What this is
A **concept prototype** of **Citadel** ("your sovereign inbox"): a privacy-first email assistant for
**anyone who wants private, sovereign control of their inbox**, built to a
regulated-professional standard (lawyers, clinicians, journalists are the
credibility anchor + premium tier, but everyone gets the same product). It runs an
AI pass over **synthetic** emails, stores only the AI-derived data (encrypted
per-item), and **forgets** that data on a schedule by destroying the per-item key
("crypto-shredding"), with a content-free audit log proving it.

**Going to production:** see `ROADMAP.md` (sequenced gates) and `PROJECT.md`
(positioning + freemium pricing: free = real inbox capped at 2 emails / limited
text; Full = $15/mo or $10/mo paid annually).

**Hard rules:** synthetic data only · AI runs 100% locally via Ollama · never log
keys or decrypted content · forget must be irreversible · mark production-only
concerns with `// TODO(production):`.

## Stack
Next.js 14.2.35 (App Router) · TypeScript · SQLite via Prisma 5.22 · local Ollama
(Apertus 8B Instruct for chat, `nomic-embed-text` for search). No cloud calls.

## Key commands
```bash
npm install
npx prisma db push                 # create/refresh local SQLite (prisma/dev.db)
npm run demo                       # db push + next dev  (/ = landing, /inbox = app)
docker compose up -d --build       # production container (behind Traefik; see ROADMAP)
npx next dev -H 0.0.0.0 -p 3000    # bind to all interfaces (VPS)
npx tsc --noEmit                   # typecheck
npm test                           # unit tests (Vitest)
npx next build                     # full build (set AI_PROVIDER=heuristic if no Ollama)
```

## Architecture (the swappable seams)
All app code talks to interfaces, never concrete impls. Selectors are the only
lines to change for production.
- `src/lib/email/EmailSource.ts` → `SampleDataSource` (synthetic) · `GmailSource`
  (read-only Gmail) · `MicrosoftGraphSource` (read-only Microsoft 365) ·
  `CompositeSource` (merges them). Picked in `src/lib/email/index.ts` via
  `EMAIL_SOURCE` (`auto`|`sample`|`gmail`|`microsoft`). **Multi-account** (P5.5):
  per-account tokens via `accountStore.ts` (legacy file auto-migrated); `auto`
  merges every connected Gmail + Microsoft account into one inbox.
- `src/lib/ai/AIProvider.ts` → `ApertusLocalProvider` (Ollama) · `LocalHeuristicProvider`
  (offline fallback). Selected in `src/lib/ai/index.ts` via `AI_PROVIDER`
  (`auto`|`apertus`|`heuristic`). All model traffic goes through
  `src/lib/ai/ollamaClient.ts` (the one seam to repoint at Canadian infra).
- `src/lib/embeddings/EmbeddingProvider.ts` → `LocalEmbeddingProvider`
  (`nomic-embed-text`). Powers in-memory semantic search (`src/lib/search.ts`,
  `/api/search`); vectors are never persisted.
- `src/lib/keyvault/KeyVault.ts` → `KmsKeyVault` (default; envelope encryption, DB
  holds only ciphertext) · `LocalKeyVault` (`KEY_VAULT=local`, DEMO — keys beside
  data). Selected in `src/lib/keyvault/index.ts`. The KMS itself is a seam
  (`src/lib/keyvault/kms/KmsClient.ts` → `LocalKmsClient`, KEK in
  `KMS_MASTER_KEY`/`.citadel-secrets/`). Crypto in `src/lib/crypto.ts` (AES-256-GCM).
- Pipeline `src/lib/pipeline.ts`; forget engine `src/lib/forget/forgetEngine.ts`
  (lazy sweep on read + `runForgetSweepAll`); background scheduler
  `src/lib/forget/scheduler.ts` started by `src/instrumentation.ts` (forgets on
  time with no user interaction); audit `src/lib/audit.ts`; settings
  `src/lib/settings.ts`.

## Env vars (`.env`)
`DATABASE_URL` · `AI_PROVIDER` · `OLLAMA_BASE_URL` · `OLLAMA_MODEL` ·
`OLLAMA_EMBED_MODEL` · `KEY_VAULT` (`auto`|`kms`|`local`) · `KMS_MASTER_KEY`
(base64 KEK; blank → auto-provisioned local file) · `FORGET_SWEEP_INTERVAL_MS`
(background sweep cadence; `0` disables) · `AUTH_SECRET` /
`AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` (blank → demo mode, no login). The
committed `.env` defaults to `AI_PROVIDER="auto"`.

## Conventions
- Match the heavy, plain-language comment style already in `src/lib/**`.
- The audit log must stay **content-free** (only non-sensitive strings).
- Raw email bodies are in-memory only — never written to the DB.
- Every production-only concern gets a `// TODO(production):` marker.

## Status (2026-06-23)
Milestones 1–6 complete. Real Apertus runs locally; real **read-only Gmail**
ingestion shipped (Gmail API + OAuth). **Dark Superhuman-style UI** + a marketing
landing at `/` (app at `/inbox`, via an `(app)` route group). **Live at
`https://citadel.aletheos.tech`** — Docker container behind the host's existing
Traefik proxy (auto HTTPS). Routes: `/` = landing, `/signin` = Google sign-in,
`/inbox` `/settings` `/audit` = app, `/api/auth/[...nextauth]` = Auth.js,
`/api/auth/google*` = Gmail OAuth. Work lives on branch
`claude/sovereign-inbox-prototype-o03qrz` (PR #3). Next work is sequenced
feature-by-feature in `BUILD_PLAN.md` (each phase tested + documented);
Superhuman feature map in `COMPETITIVE.md`. **BUILD_PLAN P0 (test harness),
P1 (accounts & multi-tenancy), and P2 (KMS seam) are done:** Auth.js/NextAuth v5
sign-in + a `userId` on every stored row, every query user-scoped
(`currentUserId()` is the chokepoint), with a `demo-user` fallback when `AUTH_*`
is unset; and a default `KmsKeyVault` doing **envelope encryption** (per-item
DEKs wrapped under a KEK that lives outside the DB, so the DB holds only
ciphertext); and **P3 (durable storage + scheduled forget)** — a background
worker (`scheduler.ts`, started by `instrumentation.ts`) runs an all-users
forget sweep on an interval so items forget on time with no user interaction,
plus a provider-agnostic Postgres seam (two-line switch + optional compose
service + migration smoke test). **Stage A (Foundation: P0–P3) is complete.**
**P4 (inbox reading UX)** is also done: a two-pane reader (message list +
reading pane) with keyboard nav (`j`/`k`/`e`/`f`/`/`), a client-only "done"
declutter, and pagination, all over a pure tested view-model
(`src/lib/inboxView.ts`). **P5 (Microsoft 365)** is done too: a read-only
`MicrosoftGraphSource` (`Mail.Read` via Microsoft Graph, OAuth on `/common` for
work + personal accounts, per-user gitignored tokens, pure tested `graphParse`),
with Connect/Disconnect Microsoft in the inbox and a `microsoft`/`m365`
`EMAIL_SOURCE` option. **P7 (Write-with-AI + tone)** is done: a per-user tone
profile (on `Setting`) folded into all prompts, a `/api/compose` prompt-to-draft
endpoint + reading-pane "Write with AI" box, tone-aware auto-drafts, a
content-free `DRAFTED` audit event, all over a pure tested prompt module
(`src/lib/ai/prompts.ts`). **P6 (Split Inbox)** is done: pure lane routing
(`src/lib/lanes.ts`) into VIP/Important/Newsletters/Other/Forgotten by
priority/label + a client-side VIP sender list, with a Split toggle + VIP editor
in the inbox. **P8 (Ask AI)** is done: `POST /api/ask` does local RAG (retrieval
via `searchInbox`, grounded `answer()` over derived fields only, sources
returned), with an "Ask AI" box in the inbox. **P5.5 (multi-account mailbox)** is
done: connect several Gmail/Microsoft accounts, merged into one inbox. In
progress: **P9–P11 (Stage D productivity & polish)**. Then **P12 (billing &
freemium gating)** — though per ROADMAP, charging should wait until the
Canadian-hosting + managed-KMS production gates are real. See also
`CHANGELOG.md`, `ROADMAP.md`, and `OPEN_BUGS.md`.

## Gotchas (learned the hard way)
- Apertus needs its **chat template** applied or it rambles (math) / replies in
  German. Use the community instruct tag or build `FROM` it — never a bare `.gguf`.
- 8B on **CPU-only** hosts is slow (~minutes for all 15 emails). GPU host fixes it.
- Run commands from inside the project dir or Prisma can't find the schema.

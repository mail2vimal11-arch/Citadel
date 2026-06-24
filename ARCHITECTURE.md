# Architecture & Production Seams

This document is for a developer who will later turn the prototype into the real
product. It lists the **interfaces** (the clean seams) and **every
`TODO(production)`** marker, so the placeholder pieces can be swapped for
real, sovereign infrastructure without rewriting the app.

## Design principle

The app is built around four swappable abstractions. Application code (the
pipeline, the forget engine, the UI) only ever talks to these **interfaces** —
never to a concrete implementation. To go to production you write new
implementations and change one selector line each; nothing else moves.

```
                 ┌─────────────────────────────────────────────┐
   mailbox  ───► │  EmailSource     (read-only message fetch)    │
                 ├─────────────────────────────────────────────┤
   thinking ───► │  AIProvider      (summarize/triage/draft)     │
                 ├─────────────────────────────────────────────┤
   search   ───► │  EmbeddingProvider (text → vector)            │
                 ├─────────────────────────────────────────────┤
   keys     ───► │  KeyVault        (issue/get/destroy key)      │
                 └─────────────────────────────────────────────┘
```

Both `AIProvider` and `EmbeddingProvider` talk to a **local Ollama server**
(`http://localhost:11434`) through one client: `src/lib/ai/ollamaClient.ts`.
That client's base URL is the single seam to repoint at Canadian-hosted
infrastructure — no API keys or cloud endpoints exist anywhere in the app.

## Routes & layout
- `/` — marketing landing (`src/app/page.tsx`), bare root layout, no app nav.
- `/signin` — Google sign-in (`src/app/signin/page.tsx`); only shown when auth
  is configured, otherwise it redirects straight to `/inbox` (demo mode).
- `/inbox`, `/settings`, `/audit` — the app, under the `(app)` route group
  (`src/app/(app)/layout.tsx` adds the shared `Nav` and, when auth is
  configured, redirects unauthenticated visitors to `/signin`). The route group
  keeps the app chrome off the landing without changing URLs.
- `/api/...` — server routes (process, items, forget, settings, audit, reset,
  search, compose, ask, send, `auth/{google,microsoft}[/callback|/status]` for
  the Gmail / Microsoft 365 OAuth flows, and `auth/[...nextauth]` for the Auth.js
  session handlers). Each data route
  resolves the caller with `requireUserId()` (`src/lib/apiUser.ts`) and scopes
  every query to that user; it returns 401 when auth is on and there's no session.
- `EMAIL_SOURCE` (`auto|sample|gmail|microsoft`) and `APP_BASE_URL` (public origin, for
  correct OAuth redirects behind a reverse proxy) are the relevant env knobs.

### Authentication & multi-tenancy (Auth.js / NextAuth v5)
- **Sign-in** is `src/auth.ts`: NextAuth v5 with the Google provider, the Prisma
  adapter, and **database** sessions. `authConfigured()` is true only when
  `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` are all set.
- **Tenancy chokepoint** is `src/lib/currentUser.ts` → `currentUserId()`: returns
  the signed-in user's id, or — when auth is **not** configured — a fixed
  `demo-user` so the public prototype runs single-user with no login.
  `// TODO(production):` remove the demo fallback and require a real session.
- **Isolation rule:** `userId` is stored on `DerivedItem`, `AuditEvent`, and
  `Setting`, and **every** read/write is filtered by it (pipeline, inbox, forget
  sweep, audit, settings, search). Per-user Gmail tokens are keyed by `userId`
  too (`googleAuth.ts`). The DB-backed test `src/lib/tenancy.test.ts` proves two
  accounts over the same mailbox can't see / search / forget each other's items.

---

## The three interfaces

### 1. `EmailSource` — `src/lib/email/EmailSource.ts`
`listEmails(): Promise<RawEmail[]>` — read-only fetch of messages. The mailbox is
chosen in one place, `src/lib/email/index.ts` (`getEmailSource()`), via the
`EMAIL_SOURCE` env var (`auto` | `sample` | `gmail` | `microsoft`). In `auto`,
a connected account wins (Gmail, then Microsoft), else the synthetic source.

| Implementation | File | Status |
|---|---|---|
| `SampleDataSource` | `src/lib/email/SampleDataSource.ts` | ✅ used in demo (synthetic) |
| `GmailSource` | `src/lib/email/GmailSource.ts` | ✅ real — read-only Gmail API (`gmail.readonly`) via OAuth 2.0; bodies in memory only |
| `MicrosoftGraphSource` | `src/lib/email/MicrosoftGraphSource.ts` | ✅ real — read-only Microsoft Graph (`Mail.Read`) via OAuth 2.0 on the `/common` authority (work/school + personal Outlook); bodies in memory only |
| `CompositeSource` | `src/lib/email/CompositeSource.ts` | ✅ merges several sources/accounts into one inbox (P5.5) |

Each connector keeps OAuth in its own module — Gmail in
`src/lib/email/googleAuth.ts`, Microsoft in `src/lib/email/microsoftAuth.ts` —
holding the consent URL and code/refresh exchange. Token storage is shared by
`src/lib/email/accountStore.ts`: a per-user, per-provider **gitignored** file
(`.citadel-secrets/{google,microsoft}-<userId>.json`) holding a **list of
accounts** (P5.5 multi-account) — each with its own `accountId` (the lowercased
email), email, and tokens. The store migrates a legacy single-token file into a
one-element list on read, so already-connected users never re-auth. Provider
payload parsing is pure and unit-tested (`gmailParse.ts`, `graphParse.ts`), and
`sourceId` is namespaced per account (`gmail:<accountId>:<msgid>`) so two
accounts never collide. The sign-in routes mirror each other:
`src/app/api/auth/{google,microsoft}` (start — `prompt=select_account` so a
second account can be added), `.../callback`, and `.../status`
(GET lists accounts; DELETE`?accountId=` disconnects one, or all when omitted).
`getEmailSource` returns a **`CompositeSource`** that merges every connected
account across Gmail + Microsoft. `TODO(production)`: per-user tokens in a
Canadian-controlled secrets manager — never a file or the DB; an account cap on
the free tier (P12).

**Sending (read-write).** Reading and sending are separate seams: sending lives
in `src/lib/email/send.ts` (`sendEmail(userId, provider, accountId, msg)`), with
the least-privilege **send scopes** (`gmail.send` / `Mail.Send`) added to OAuth —
so accounts connected before sending existed must **reconnect** (a 403 surfaces
as `NeedsReconnectError` → a reconnect hint). `POST /api/send` sends as the
chosen account after a client-side confirm, **persists nothing**, and writes a
content-free `SENT` audit event. Message construction (`src/lib/email/mime.ts`:
MIME build with header-injection stripping, base64url, `Re:`, recipient parsing)
is pure + tested. The inbox's compose/reply modal feeds it; the body is seeded
from the AI draft. `TODO(production)`: outbound queue/retry, threaded replies
(real `Message-ID`/`References`), rate limits.

### 2. `AIProvider` — `src/lib/ai/AIProvider.ts`
`summarize()`, `triage()`, `draftReply(email, {tone})`, `compose(req)`,
`answer(question, contexts)`. Selected
in `src/lib/ai/index.ts` via the `AI_PROVIDER` env var (`auto` | `apertus` |
`heuristic`). Prompt wording and the **per-user tone profile** live in a pure,
unit-tested module, `src/lib/ai/prompts.ts` (`SYSTEM_BASE`, `TONES`,
`buildDraftMessages`, `buildComposeMessages`) — both providers share it, so the
exact prompts are testable with no Ollama.

**Write-with-AI (P7).** `POST /api/compose { instruction, itemId? }` drafts an
email from a freeform instruction in the user's saved tone; when `itemId` is
given it adds **derived-only** reply context (from/subject/summary — never a raw
body, since none is stored). It persists nothing and writes a content-free
`DRAFTED` audit entry. The pipeline's auto-draft (`draftReply`) uses the same
tone. Tone is stored on the `Setting` row (`getTone`/`setTone`) and chosen in
Settings.

**Ask AI (P8).** `POST /api/ask { question }` is RAG over the inbox: retrieval
reuses the local semantic search (`searchInbox`, in-memory, keyword fallback) to
pull the most relevant ACTIVE items, then `answer()` has the local model respond
**grounded only in those items' derived fields** (from/subject/summary) and admit
when the answer isn't there. Forgotten items are swept first, so they're never
context. Nothing is persisted; the response returns the answer plus clickable
source items.

| Implementation | File | Status |
|---|---|---|
| `ApertusLocalProvider` | `src/lib/ai/ApertusLocalProvider.ts` | ✅ real AI — Apertus 8B, runs locally via Ollama, fully offline |
| `LocalHeuristicProvider` | `src/lib/ai/LocalHeuristicProvider.ts` | ✅ offline rule-based stand-in (auto-fallback when Ollama isn't up) |
| Apertus on Canadian infra | — | 🚧 `TODO(production)` — same model, repoint `OLLAMA_BASE_URL` |

In `auto` mode the selector pings Ollama (`ollamaModelReady`) and uses Apertus
when the model is pulled, otherwise falls back to the stand-in and logs a clear
warning — it never silently passes the placeholder off as real AI.

### 3. `EmbeddingProvider` — `src/lib/embeddings/EmbeddingProvider.ts`
`embed()`, `embedBatch()` for the search/memory layer. Selected in
`src/lib/embeddings/LocalEmbeddingProvider.ts` (`getEmbeddingProvider`).

| Implementation | File | Status |
|---|---|---|
| `LocalEmbeddingProvider` | `src/lib/embeddings/LocalEmbeddingProvider.ts` | ✅ local `nomic-embed-text` via Ollama |
| Embeddings on Canadian infra | — | 🚧 `TODO(production)` — same model, repoint `OLLAMA_BASE_URL` |

Used by `src/lib/search.ts` for an **in-memory** semantic search over active
items (vectors are never persisted, so search adds nothing to forget/shred; it
degrades to keyword match when Ollama embeddings are unavailable).

### 4. `KeyVault` — `src/lib/keyvault/KeyVault.ts`
`issueKey()`, `getKey()`, `destroyKey()`. The "crypto-shredding" engine: one key
per item; destroying it makes that item unrecoverable. Selected by
`getKeyVault()` (`src/lib/keyvault/index.ts`) via the `KEY_VAULT` env var.

| Implementation | File | Status |
|---|---|---|
| `KmsKeyVault` (default) | `src/lib/keyvault/KmsKeyVault.ts` | ✅ **envelope encryption** — keys live apart from data; DB holds only ciphertext |
| `LocalKeyVault` (`KEY_VAULT=local`) | `src/lib/keyvault/LocalKeyVault.ts` | demo only — **insecure** (raw keys beside data); kept for contrast |
| Canadian HSM/KMS | `src/lib/keyvault/kms/KmsClient.ts` (seam) | 🚧 `TODO(production)` — repoint `LocalKmsClient` at a managed KMS |

**Envelope encryption (the P2 model).** `KmsKeyVault` never stores raw keys. It
asks the KMS seam (`KmsClient`) for a per-item **data key (DEK)**: the KMS returns
the DEK in the clear (used in memory to encrypt the payload) plus a **wrapped**
copy (the DEK encrypted under the KMS **master key / KEK**). Only the wrapped DEK
is persisted, so the database holds nothing but ciphertext. `LocalKmsClient`
implements the KMS fully offline, with the KEK in `KMS_MASTER_KEY` (base64) or an
auto-provisioned `.citadel-secrets/kms-master.key` (gitignored, mode 0600) —
**never** in the DB. To **forget**, we destroy the item's one wrapped DEK; since
the plaintext DEK was never written down, the item is unrecoverable even to
someone holding both the database *and* the KEK. Legacy raw-key rows from the old
vault are read transparently so upgrading never loses data.

---

## Supporting modules

| Module | File | Role |
|---|---|---|
| Ollama client | `src/lib/ai/ollamaClient.ts` | the ONLY transport to the local model server (chat, embeddings, readiness) |
| Crypto | `src/lib/crypto.ts` | AES-256-GCM encrypt/decrypt of the derived payload |
| Search | `src/lib/search.ts` | in-memory semantic search via `EmbeddingProvider` (keyword fallback) |
| Pipeline | `src/lib/pipeline.ts` | email → AI → encrypt → store + `PROCESSED` audit |
| Forget engine | `src/lib/forget/forgetEngine.ts` | sweep expired (per-user + all-users) / forget one / forget all → destroy key + `FORGOTTEN` audit |
| Forget scheduler | `src/lib/forget/scheduler.ts` | background worker (started by `src/instrumentation.ts`) that runs the all-users sweep on an interval |
| Inbox reader | `src/lib/inbox.ts` | decrypts active items in-memory; proof-of-unrecoverability helper |
| Settings | `src/lib/settings.ts` | forget-interval storage + deadline computation |
| Audit | `src/lib/audit.ts` | append-only, content-free event log |
| DB client | `src/lib/db.ts` | Prisma client (query logging deliberately off) |

### Forgetting on schedule (not just on read)
Two mechanisms drive a forget, and both are crypto-shred (destroy the per-item
key → ciphertext unrecoverable):
- **On-read sweep** — `runForgetSweep(userId)` fires from the API routes, so
  expired items are gone the moment you open the inbox/audit.
- **Background scheduler** — `startForgetScheduler()` (launched on server boot
  by `src/instrumentation.ts`) runs `runForgetSweepAll()` every
  `FORGET_SWEEP_INTERVAL_MS` (default 60s, `0` disables) so deadlines are honoured
  **with no user interaction**. It's idempotent and logs only a count (content-
  free). Because the scheduler's node-only graph (Prisma, KMS) can't compile for
  the Edge runtime, `next.config.mjs` swaps it for a no-op stub in non-Node builds
  (`scheduler.stub.ts`); `instrumentation.ts` only starts it on `nodejs`.
  `// TODO(production):` for multi-instance deploys, run the sweep from a single
  leader (advisory lock) or external cron/queue — the logic is already idempotent.

### Durable storage (the P3 seam)
SQLite is the local/CI/offline-demo default. The data model is provider-agnostic
(no SQLite-only types or SQL), so going durable is a two-line switch — set
`provider = "postgresql"` in `prisma/schema.prisma`, point `DATABASE_URL` at a
**Canadian-region managed Postgres**, then `prisma db push`. `docker-compose.yml`
ships an optional local `db` service (`docker compose --profile postgres up -d db`)
and `src/lib/db.postgres.test.ts` validates the schema under the Postgres provider
(offline) with an opt-in live push via `TEST_DATABASE_URL`.

## Data model — `prisma/schema.prisma`

- `DerivedItem` — encrypted derived payload + `forgetAt`/`forgottenAt`/`status`.
  Sensitive fields exist **only inside the ciphertext**, never as clear columns.
  Carries `userId`; unique per `[userId, sourceId]` so each tenant ingests the
  same source mailbox independently.
- `VaultKey` — per-item key record. Under the default `KmsKeyVault`, `material`
  is the **wrapped** DEK (ciphertext, useless without the KEK); under the demo
  vault it's a raw base64 key. `destroyed` flag + nulled material = shred.
- `AuditEvent` — `PROCESSED` / `FORGOTTEN` / `SETTINGS_CHANGED` / `DRAFTED` /
  `SENT`, content-free.
  Carries `userId`; indexed by `[userId, createdAt]`.
- `Setting` — per-user forget interval (`userId` is the primary key).
- **Auth.js tables** — `User`, `Account`, `Session`, `VerificationToken` (the
  standard `@auth/prisma-adapter` schema). `userId` columns above are plain
  string scopes — not FKs to `User` — so the demo `demo-user` works without a
  row, and tenancy is enforced by query scoping rather than referential joins.

## How "forget" works (and why it's irreversible)

1. Each item's derived data is encrypted under a **unique random key**.
2. The key lives in the `KeyVault`, separate from the app logic.
3. Forgetting = `KeyVault.destroyKey()`. The ciphertext row is left in place but
   can never be decrypted again. A content-free `FORGOTTEN` audit entry is written.
4. The forget timer is enforced **lazily**: `runForgetSweep()` runs on every
   inbox/audit read, so expired items are shredded the moment anyone looks. No
   background daemon is required for the demo.
   - `TODO(production):` add a reliable scheduled job (e.g. a cron/worker) so
     forgetting happens on time even with no user activity, plus enforcement at
     the storage layer.

---

## Every `TODO(production)` seam (checklist)

- [x] **Gmail connector** — `GmailSource`: read-only Gmail API + OAuth 2.0
      (`gmail.readonly`) is implemented. _Remaining for production:_ move tokens
      from the local file to a Canadian-controlled secrets manager, make them
      per-user, and complete Google's verification for the restricted scope.
- [ ] **Microsoft 365 connector** — `MicrosoftGraphSource`: read-only `Mail.Read`
      via the `/common` authority (corporate Azure AD **and** personal Outlook/
      Hotmail/Live accounts); tokens in a real secrets manager.
- [ ] **Canadian-hosted AI & embeddings** — the prototype already runs the real
      Apertus model locally; for production serve that same Apertus model (and
      the embedding model) on Canadian-controlled infrastructure and repoint
      `OLLAMA_BASE_URL` (`src/lib/ai/ollamaClient.ts`) over a private,
      mutually-authenticated connection. Email-derived data must never leave
      Canadian-controlled infrastructure.
- [ ] **Real key management** — replace `LocalKeyVault` with a Canadian-controlled
      HSM/KMS; keys must never sit beside the data; destruction must be
      hardware-backed and auditable.
- [ ] **Sovereign hosting & database** — move SQLite (`.env` `DATABASE_URL`,
      `prisma/schema.prisma`) to a Canadian-region managed database with
      encryption-at-rest, access logging, and a data residency agreement.
- [ ] **Reliable forget scheduler** — background job + storage-layer enforcement,
      not just lazy sweeps on read.
- [ ] **No "reset everything" button** — `src/app/api/reset/route.ts` is a demo
      convenience only; real lifecycle is governed solely by the forget schedule
      and audited user actions.
- [ ] **Compliance artifacts** — PIPEDA/provincial-health-privacy alignment, a
      Threat & Impact Assessment (TIA), retention/forget policy, and audit-log
      retention/export controls.
- [ ] **Dependency hardening** — pinned to Next.js 14.2.35 (clears the Dec 2025
      critical advisory). Remaining audit flags are DoS/image-optimizer/middleware
      issues not exercised by this app; a full upgrade to the Next.js 16 line
      (React 19) is the production follow-up. Re-run `npm audit` on each release.

## Security notes honored in the prototype

- Keys and decrypted content are **never logged**. Prisma query logging is off.
- The audit log is content-free by construction (`recordAudit` callers pass only
  non-sensitive strings).
- Raw email bodies are used in-memory only and are **never written to the DB** —
  only the encrypted derived payload is persisted.

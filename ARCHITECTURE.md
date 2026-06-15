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

---

## The three interfaces

### 1. `EmailSource` — `src/lib/email/EmailSource.ts`
`listEmails(): Promise<RawEmail[]>` — read-only fetch of messages.

| Implementation | File | Status |
|---|---|---|
| `SampleDataSource` | `src/lib/email/SampleDataSource.ts` | ✅ used in demo (synthetic) |
| `GmailSource` | `src/lib/email/GmailSource.ts` | 🚧 stub — `TODO(production)` |
| `MicrosoftGraphSource` | `src/lib/email/MicrosoftGraphSource.ts` | 🚧 stub — `TODO(production)` |

### 2. `AIProvider` — `src/lib/ai/AIProvider.ts`
`summarize()`, `triage()`, `draftReply()`. Selected in `src/lib/ai/index.ts`
via the `AI_PROVIDER` env var (`auto` | `apertus` | `heuristic`).

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
per item; destroying it makes that item unrecoverable.

| Implementation | File | Status |
|---|---|---|
| `LocalKeyVault` | `src/lib/keyvault/LocalKeyVault.ts` | ✅ demo only — **insecure** (keys stored beside data) |
| Canadian HSM/KMS | — | 🚧 `TODO(production)` |

---

## Supporting modules

| Module | File | Role |
|---|---|---|
| Ollama client | `src/lib/ai/ollamaClient.ts` | the ONLY transport to the local model server (chat, embeddings, readiness) |
| Crypto | `src/lib/crypto.ts` | AES-256-GCM encrypt/decrypt of the derived payload |
| Search | `src/lib/search.ts` | in-memory semantic search via `EmbeddingProvider` (keyword fallback) |
| Pipeline | `src/lib/pipeline.ts` | email → AI → encrypt → store + `PROCESSED` audit |
| Forget engine | `src/lib/forget/forgetEngine.ts` | sweep expired / forget one / forget all → destroy key + `FORGOTTEN` audit |
| Inbox reader | `src/lib/inbox.ts` | decrypts active items in-memory; proof-of-unrecoverability helper |
| Settings | `src/lib/settings.ts` | forget-interval storage + deadline computation |
| Audit | `src/lib/audit.ts` | append-only, content-free event log |
| DB client | `src/lib/db.ts` | Prisma client (query logging deliberately off) |

## Data model — `prisma/schema.prisma`

- `DerivedItem` — encrypted derived payload + `forgetAt`/`forgottenAt`/`status`.
  Sensitive fields exist **only inside the ciphertext**, never as clear columns.
- `VaultKey` — per-item key material; `destroyed` flag + nulled material = shred.
- `AuditEvent` — `PROCESSED` / `FORGOTTEN` / `SETTINGS_CHANGED`, content-free.
- `Setting` — single-row forget interval.

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

- [ ] **Real mailbox connectors** — `GmailSource`, `MicrosoftGraphSource`:
      read-only OAuth, least-privilege scopes, tokens in a real secrets manager.
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

## Security notes honored in the prototype

- Keys and decrypted content are **never logged**. Prisma query logging is off.
- The audit log is content-free by construction (`recordAudit` callers pass only
  non-sensitive strings).
- Raw email bodies are used in-memory only and are **never written to the DB** —
  only the encrypted derived payload is persisted.

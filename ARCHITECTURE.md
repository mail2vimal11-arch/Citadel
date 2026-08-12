# Architecture & Production Seams

This document is for a developer who will later turn the prototype into the real
product. It lists the **interfaces** (the clean seams) and **every
`TODO(production)`** marker, so the placeholder pieces can be swapped for
real, sovereign infrastructure without rewriting the app.

## Design principle

The app is built around three swappable abstractions. Application code (the
pipeline, the forget engine, the UI) only ever talks to these **interfaces** —
never to a concrete implementation. To go to production you write new
implementations and change one selector line each; nothing else moves.

```
                 ┌─────────────────────────────────────────┐
   mailbox  ───► │  EmailSource   (read-only message fetch)  │
                 ├─────────────────────────────────────────┤
   thinking ───► │  AIProvider    (summarize/triage/draft)   │
                 ├─────────────────────────────────────────┤
   keys     ───► │  KeyVault      (issue/get/destroy key)    │
                 └─────────────────────────────────────────┘
```

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
`summarize()`, `triage()`, `draftReply()`. Selected in `src/lib/ai/index.ts`.

| Implementation | File | Status |
|---|---|---|
| `LocalHeuristicProvider` | `src/lib/ai/LocalHeuristicProvider.ts` | ✅ placeholder — **not real AI**, rule-based, offline |
| Canadian-hosted / on-device model | — | 🚧 `TODO(production)` |

### 3. `KeyVault` — `src/lib/keyvault/KeyVault.ts`
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
| Crypto | `src/lib/crypto.ts` | AES-256-GCM encrypt/decrypt of the derived payload |
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
- [ ] **Canadian / on-device AI** — replace `LocalHeuristicProvider`; keep all
      email-derived data inside Canadian-controlled infrastructure.
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

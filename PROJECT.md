# Sovereign Inbox — Project Overview

_Last updated: 2026-06-19 · Status: working concept prototype (v0.1.0)_

## Vision
A privacy-first "sovereignty overlay" for email, aimed at **Canadian regulated
professionals** (lawyers, healthcare). It sits on top of a user's existing
Microsoft 365 / Google Workspace mailbox, runs AI on **Canadian-controlled
infrastructure**, and is built around **data minimization**: it stores only
AI-derived data, **forgets** it on a user-set schedule, and **proves** it forgot
via an audit log.

## Why it matters
Regulated professionals handle privileged/sensitive correspondence under PIPEDA and
provincial health-privacy law. Mainstream AI email tools send content to US clouds.
The wedge here is **data residency + data minimization + provable forgetting**.

## Scope of this build (the prototype)
A locally runnable web app that demonstrates the core loop on **synthetic data**,
with the **AI running fully offline**. It is a demo for design partners (law
professors) — **not** production. Real mailbox connections, sovereign hosting, real
key management, and compliance artifacts are deliberately stubbed behind clean
interfaces and marked `// TODO(production):`.

### In scope (done)
1. Load 15 synthetic emails (client matters, scheduling, newsletters, a
   privilege-sensitive one).
2. AI pass per email — summary, priority/triage label, suggested reply — via local
   **Apertus 8B** through Ollama.
3. Store only derived data, **encrypted per-item** (AES-256-GCM, unique key each).
4. **Forget engine** — destroy the per-item key on schedule (1h / 24h / 7d / logout)
   → data permanently unrecoverable; write a `FORGOTTEN` audit entry.
5. **Audit log** — content-free `PROCESSED` / `FORGOTTEN` events.
6. **Inbox UI**, settings panel for the schedule, semantic search box.

### Explicitly out of scope (production seams)
Real OAuth mailbox connectors · Apertus served on Canadian infra · real HSM/KMS ·
Canadian-region managed DB · sovereign hosting · reliable forget scheduler ·
PIPEDA/health-privacy compliance + Threat & Impact Assessment (TIA).

## Architecture at a glance
Four swappable interfaces — `EmailSource`, `AIProvider`, `EmbeddingProvider`,
`KeyVault` — with local/demo implementations now and `TODO(production)` stubs for
the real versions. App code only ever sees the interfaces. Full detail in
`ARCHITECTURE.md`; quick map in `CLAUDE.md`.

## Current state
- Milestones 1–6 complete; typecheck + build green.
- Verified end-to-end on a **Hostinger KVM 4 VPS** (Ubuntu): real Apertus output in
  English, encrypt → forget → audit all working. CPU-only, so processing is slow.
- Branch `claude/sovereign-inbox-prototype-o03qrz`, draft **PR #3**.

## Hosting decisions / notes
- **Prototype demo:** any VPS is fine (synthetic data). Currently on Hostinger
  (US data centre — _not_ Canadian; acceptable only because data is fake).
- **Production target:** a **Canadian** host. A GPU box (e.g. ServaRica "Bee", Tesla
  P40 24 GB, Montréal) is the recommended path — it both satisfies data residency and
  fixes the CPU-inference speed problem. See chat history / `ARCHITECTURE.md`.

## Roadmap (post-prototype)
1. **Performance:** move Apertus to a Canadian GPU host (snappy multi-user inference).
2. **Ingestion:** implement `GmailSource` / `MicrosoftGraphSource` (read-only OAuth).
3. **Key management:** replace `LocalKeyVault` with a Canadian-controlled HSM/KMS.
4. **Storage/hosting:** Canadian-region managed Postgres; sovereign hosting; reliable
   forget scheduler (not lazy-on-read).
5. **Compliance:** PIPEDA/health-privacy alignment, TIA, retention/forget policy,
   signed data-residency / DPA with the host.
6. **Hardening:** upgrade off the Next.js 14.2 line (see `OPEN_BUGS.md`), add tests/CI,
   auth + reverse proxy.

## Key documents
- `README.md` — how to install, run, deploy on a VPS, and demo the forget feature.
- `ARCHITECTURE.md` — interfaces + every `TODO(production)` seam.
- `CLAUDE.md` — project memory / quick reference.
- `CHANGELOG.md` — version history.
- `OPEN_BUGS.md` — known issues and their status.

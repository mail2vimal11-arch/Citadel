# Citadel — Project Overview

_Citadel — your sovereign inbox._

_Last updated: 2026-06-21 · Status: working concept prototype (v0.1.0)_

## Vision
A privacy-first "sovereignty overlay" for email — **for anyone who wants private,
sovereign control of their inbox**, delivered to a **regulated-professional
standard**. Everyone gets the same product. It sits on top of a user's existing
Microsoft 365 / Google Workspace mailbox, runs AI on **Canadian-controlled
infrastructure**, and is built around **data minimization**: it stores only
AI-derived data, **forgets** it on a user-set schedule, and **proves** it forgot
via an audit log.

## Who it's for
**Broad market, professional-grade.** The promise — "your email AI never leaves
Canadian soil, and forgets on a schedule you can prove" — is for everyone: anyone
uncomfortable handing their inbox to a US AI cloud. The product is built to the
rigor demanded by **regulated professionals** (lawyers, clinicians, journalists,
accountants), and those professionals are the credibility anchor and the premium
revenue tier — but the engine they get is the same one everyone gets.

## Why it matters
Mainstream AI email tools send your content to US clouds. Regulated professionals
handle privileged/sensitive correspondence under PIPEDA and provincial
health-privacy law and often *cannot* use those tools at all — but the same
discomfort scales to everyone. The wedge is **data residency + data minimization +
provable forgetting**, sold broadly and proven to a compliance standard.

## Business model (freemium)
- **Free tier** — connect a real inbox, but limited: AI processing of up to **2
  emails** with a **capped text length** per email. Enough to feel the magic
  (local AI summary/triage/draft + the forget-and-prove loop) before paying.
- **Full tier — $15/month**, or **$10/month when paid annually** (12 months
  up front). Unlocks the full inbox, the full forget scheduler, search, and audit
  export. Same engine for consumers and professionals; the professional/compliance
  add-ons ride on top of the Full tier.

_See `ROADMAP.md` for how the product gets from prototype to a paid, production
service._

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
6. **Inbox UI**, settings panel for the schedule, semantic search box — plus a
   **marketing landing page** (`/`) in a dark, Superhuman-style design; the app
   lives at `/inbox`.

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
- **Renamed Citadel**, broadened positioning, freemium model defined.
- **Real read-only Gmail** ingestion (Gmail API + OAuth) shipped behind the
  `EmailSource` seam; Microsoft 365 (`/common`) is next.
- **Dark, Superhuman-style UI** + a **marketing landing page** at `/`.
- **Live at `https://citadel.aletheos.tech`** — deployed as a Docker container
  behind the host's existing Traefik proxy (auto HTTPS via Let's Encrypt).
- Originally verified end-to-end on a **Hostinger KVM 4 VPS** (Ubuntu): real
  Apertus output in English, encrypt → forget → audit all working. CPU-only,
  so processing is slow (Canadian GPU host is the production fix).
- Branch `claude/sovereign-inbox-prototype-o03qrz`, draft **PR #3**.

## Hosting decisions / notes
- **Prototype demo:** any VPS is fine (synthetic data). Currently on Hostinger
  (US data centre — _not_ Canadian; acceptable only because data is fake).
- **Production target:** a **Canadian** GPU host (data residency + fixes CPU-inference
  speed). Apertus 8B q4 needs only ~6 GB VRAM, so a modest **16 GB+** modern card is
  plenty — no H100/A100 required. Candidates, best-fit first: **ServaRica** (Montréal;
  the "Bee" GPU VPS is currently sold out — watch for a restock or use their dedicated
  GPU box), **Hostrunway** (Montréal GPU servers — confirm a 16 GB+ modern card, _not_
  the GT730/2 GB tier), and **BUZZ HPC** (Quebec sovereign-AI cloud — strongest
  compliance story, pricier). Avoid US regions for production. See `ROADMAP.md`.

## Roadmap (post-prototype)
The full, sequenced plan to a paid production service lives in **`ROADMAP.md`**.
Critical path to first revenue: real mailbox ingestion → accounts/multi-tenancy →
real key management (HSM/KMS) → Canadian sovereign hosting → billing & freemium
gating. Compliance, durable storage + a reliable forget scheduler, and hardening
run as fast-follows.

## Key documents
- `README.md` — how to install, run, deploy on a VPS, and demo the forget feature.
- `ARCHITECTURE.md` — interfaces + every `TODO(production)` seam.
- `ROADMAP.md` — sequenced plan from prototype to paid production.
- `CLAUDE.md` — project memory / quick reference.
- `CHANGELOG.md` — version history.
- `OPEN_BUGS.md` — known issues and their status.

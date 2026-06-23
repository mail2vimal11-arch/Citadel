# Changelog

All notable changes to Citadel (tagline: "your sovereign inbox") are recorded here.
This is a pre-release
prototype; versions are documentation milestones, not shipped releases. Format
loosely follows [Keep a Changelog](https://keepachangelog.com/); the project is not
yet using semantic-version releases.

## [Unreleased]
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

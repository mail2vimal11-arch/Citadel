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
- `src/lib/email/EmailSource.ts` → `SampleDataSource` (live) · `GmailSource` /
  `MicrosoftGraphSource` (stubs).
- `src/lib/ai/AIProvider.ts` → `ApertusLocalProvider` (Ollama) · `LocalHeuristicProvider`
  (offline fallback). Selected in `src/lib/ai/index.ts` via `AI_PROVIDER`
  (`auto`|`apertus`|`heuristic`). All model traffic goes through
  `src/lib/ai/ollamaClient.ts` (the one seam to repoint at Canadian infra).
- `src/lib/embeddings/EmbeddingProvider.ts` → `LocalEmbeddingProvider`
  (`nomic-embed-text`). Powers in-memory semantic search (`src/lib/search.ts`,
  `/api/search`); vectors are never persisted.
- `src/lib/keyvault/KeyVault.ts` → `LocalKeyVault` (DEMO ONLY, insecure — keys live
  beside data). Crypto in `src/lib/crypto.ts` (AES-256-GCM).
- Pipeline `src/lib/pipeline.ts`; forget engine `src/lib/forget/forgetEngine.ts`
  (lazy sweep on read); audit `src/lib/audit.ts`; settings `src/lib/settings.ts`.

## Env vars (`.env`)
`DATABASE_URL` · `AI_PROVIDER` · `OLLAMA_BASE_URL` · `OLLAMA_MODEL` ·
`OLLAMA_EMBED_MODEL`. The committed `.env` defaults to `AI_PROVIDER="auto"`.

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
Traefik proxy (auto HTTPS). Routes: `/` = landing, `/inbox` `/settings` `/audit`
= app, `/api/auth/google*` = Gmail OAuth. Work lives on branch
`claude/sovereign-inbox-prototype-o03qrz` (PR #3). Next work is sequenced
feature-by-feature in `BUILD_PLAN.md` (each phase tested + documented);
Superhuman feature map in `COMPETITIVE.md`. See also `CHANGELOG.md`,
`ROADMAP.md`, and `OPEN_BUGS.md`.

## Gotchas (learned the hard way)
- Apertus needs its **chat template** applied or it rambles (math) / replies in
  German. Use the community instruct tag or build `FROM` it — never a bare `.gguf`.
- 8B on **CPU-only** hosts is slow (~minutes for all 15 emails). GPU host fixes it.
- Run commands from inside the project dir or Prisma can't find the schema.

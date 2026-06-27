# Testing

How Citadel is tested, across every layer, on a standard cadence. The goal is
that the privacy promise (residency · minimization · provable forgetting) and the
app around it are continuously verified — not checked once.

## Cadence at a glance

| Cadence | What runs | Where |
|---|---|---|
| **Every push + PR** | typecheck · unit · integration · regression · sanity · white-box (coverage) · smoke · system · E2E · black-box · secret scan · dependency audit · SAST | `ci.yml`, `tests.yml`, `security.yml` |
| **Nightly** | performance · load · stress | `tests.yml` (cron 05:00 UTC) |
| **Weekly** | DAST (OWASP ZAP) + full security sweep | `security.yml` (cron Mon 06:00 UTC) |
| **Per release / on demand** | UAT scenarios · manual exploratory · manual pen test | checklist below + `workflow_dispatch` |

`ci.yml` is the fast typecheck+build+deploy **gate**; `tests.yml` is the breadth;
`security.yml` is security. They run in parallel.

## The test types

### Core
- **Unit testing** — Vitest, 160+ tests over the pure domain logic (crypto,
  forget scheduling, lane routing, prompts, billing limits, parsers, availability,
  commands…). `npm test`. *Every push.*
- **Integration testing** — real collaborators wired together against a real
  SQLite + heuristic AI + KeyVault: `src/lib/tenancy.test.ts` (multi-tenant
  isolation) and `src/lib/integration.forget.test.ts` (the full
  process → encrypt → crypto-shred → prove-unrecoverable → content-free-audit
  lifecycle). `npm test`. *Every push.*
- **System testing** — the whole app, built and booted, exercised through its real
  HTTP surface by Playwright (`/`, `/inbox`, `/api/health`). `npm run test:e2e`.
  *Every push.*
- **End-to-end (E2E) testing** — Playwright drives a real Chromium through user
  journeys (`e2e/landing.spec.ts`: hero → guarantees → pricing → CTA opens the
  app). `npm run test:e2e`. *Every push.*

### Pipeline & maintenance
- **Smoke testing** — the fastest "is it alive" set: health 200, landing renders,
  inbox boots (`e2e/smoke.spec.ts`). `npm run smoke`. *Every push, and as a
  post-deploy gate.*
- **Regression testing** — the entire unit + integration + E2E suite runs on every
  change, so a fix never silently breaks something else. Notable regression locks:
  the CodeQL `bad-tag-filter`/`double-escaping` cases in `gmailParse.test.ts`.
  *Every push.*
- **Sanity testing** — a quick targeted check that a specific area still behaves
  after a change: run just the relevant file, e.g.
  `npx vitest run src/lib/forget` or `npm run smoke`. *On demand / after a focused
  change.*

### Non-functional
- **Performance testing** — `tools/perf/load.mjs` measures latency percentiles +
  throughput and fails if p99 exceeds the budget. `npm run perf:load`. *Nightly.*
- **Load testing** — same harness at sustained realistic concurrency (default 50
  connections / 20s); fails on any non-2xx. `npm run perf:load`. *Nightly.*
- **Stress testing** — `tools/perf/stress.mjs` pushes well past normal load
  (default 250 connections, pipelined) to confirm graceful degradation rather than
  a crash. `npm run perf:stress`. *Nightly.*
- **Security testing** — gitleaks (secrets), `npm audit` (deps), CodeQL (SAST) on
  every push + weekly, and OWASP ZAP baseline (DAST) weekly/on-demand. See
  `SECURITY.md`. *Every push + weekly.*

### Structural & business perspectives
- **White-box testing** — tests written with knowledge of internals, plus coverage
  reporting to see what the logic exercises. `npm run test:coverage` (HTML report
  in `coverage/`). *Every push.*
- **Black-box testing** — Playwright tests assert only on observable behaviour
  (rendered text, navigation, HTTP responses), with no reach into internals.
  `npm run test:e2e`. *Every push.*
- **User acceptance testing (UAT)** — scenario checklist below, validated against
  the live site before a release. The E2E journeys automate the happy paths; UAT
  confirms they meet the actual user need.

## UAT scenario checklist (per release)
Run against `https://citadel.aletheos.tech` (or a staging deploy):
1. **Land & understand** — the landing page communicates residency, minimization,
   and provable forgetting; pricing (Free vs $15 Full) is clear; the CTA opens the
   app.
2. **Connect & process** — connect a mailbox (or use the synthetic source); emails
   are summarized, triaged, and given draft replies.
3. **Read & act** — two-pane reader works; keyboard nav (`j`/`k`/`e`/`f`/`/`),
   Split Inbox, snooze, Ask AI, and Write-with-AI behave.
4. **Forget & prove** — set a forget schedule; after it elapses an item shows as
   FORGOTTEN with no content, and "prove unrecoverable" confirms the ciphertext is
   present but unreadable.
5. **Audit** — the audit log shows PROCESSED/FORGOTTEN events and never leaks
   content.
6. **Billing** — (when live) upgrade to Full lifts the free cap; downgrade/cancel
   restores it.

## Running locally
```bash
npm test                 # unit + integration (+ regression)
npm run test:coverage    # the above + coverage report (coverage/index.html)

npx next build           # E2E/smoke/perf run against a production build
npm run smoke            # quick smoke specs (Playwright boots the built app on :3100)
npm run test:e2e         # full E2E / system / black-box

# performance (Playwright isn't involved — start the built app yourself):
npx next start -p 3100 &
BASE_URL=http://127.0.0.1:3100 npm run perf:load
BASE_URL=http://127.0.0.1:3100 npm run perf:stress
```
E2E uses the pre-installed Chromium locally (`PLAYWRIGHT_BROWSERS_PATH`); CI runs
`playwright install chromium`.

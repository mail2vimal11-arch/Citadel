# Build Plan — Citadel, feature by feature

> The sequenced plan to build the **full product**. Each phase is **one shippable
> product feature/function**. `ROADMAP.md` holds the higher-level production
> gates and pricing; `COMPETITIVE.md` maps these against Superhuman.

## Working agreement (applies to EVERY phase)
A phase is **not done** until all four are true:
1. **Built** behind the existing interfaces/seams (no shortcuts around them).
2. **Tested** — unit tests for the new logic + `tsc --noEmit` + `next build`
   green in CI. Anything user-facing also gets a manual smoke-test note.
3. **Docs updated** — `CHANGELOG.md` always; plus the relevant subset of
   `PROJECT.md` / `ARCHITECTURE.md` / `README.md` / `CLAUDE.md` / `COMPETITIVE.md`.
   Every production-only concern keeps its `// TODO(production):` marker.
4. **Shipped** — committed and pushed to the working branch; PR stays current.

**Hard rules unchanged:** synthetic data only by default · AI 100% local via
Ollama · never log keys or decrypted content · forget must be irreversible.

## How to read a phase
Each phase lists **Goal · Build · Test · Docs · Done-when**. Effort is a
T-shirt size (S/M/L). "Gate" phases unblock revenue and should not be skipped.

---

## Stage A — Foundation (makes "tested + sellable" real)

### P0 · Test harness  · S
- **Goal:** every later phase can ship real tests.
- **Build:** add Vitest; wire `npm test` into the CI workflow; seed tests for
  the existing core — `crypto` (encrypt/decrypt + key-destroy → unrecoverable),
  `forgetEngine` (schedule math + sweep), `GmailSource` MIME parsing, and
  `getEmailSource()` selection.
- **Test:** the seed tests pass in CI.
- **Docs:** CHANGELOG; CLAUDE (key commands → add `npm test`); OPEN_BUGS (close
  "no tests" item).
- **Done-when:** `npm test` runs in CI and is green.

### P1 · Accounts & multi-tenancy  · L · **Gate**
- **Goal:** real users with isolated data — prerequisite for anything paid.
- **Build:** email + OAuth sign-in, sessions; add a `userId` to every stored
  item / audit row / key reference; scope every query by user.
- **Test:** unit tests proving no cross-tenant read; auth flow integration test.
- **Docs:** ARCHITECTURE (data model + tenancy), PROJECT, CHANGELOG.
- **Done-when:** two accounts cannot see each other's items; pipeline/forget/
  audit all user-scoped.

### P2 · Real key management (KMS seam)  · L · **Gate**
- **Goal:** the trust promise — keys live apart from the data.
- **Build:** implement a `KeyVault` against a Canadian-controlled managed KMS;
  per-item keys issued/destroyed in the KMS; DB only ever holds ciphertext.
- **Test:** vault contract tests (issue → encrypt → destroy → decrypt fails);
  run the existing crypto suite against the new vault.
- **Docs:** ARCHITECTURE (KeyVault table → real impl), ROADMAP (P3 done),
  COMPETITIVE (BYOK/CMEK ✅), CHANGELOG.
- **Done-when:** forgetting destroys the key in the KMS; data unrecoverable.

### P3 · Durable storage + reliable forget scheduler  · M · **Gate**
- **Goal:** truthful "forgets on schedule, even if you never open the app."
- **Build:** SQLite → Canadian-region managed Postgres; replace lazy-on-read
  sweep with a scheduled worker; keep the audit log content-free.
- **Test:** scheduler unit tests (due/not-due); migration smoke test.
- **Docs:** ARCHITECTURE, ROADMAP, CHANGELOG.
- **Done-when:** items forget on time with no user interaction.

---

## Stage B — Daily-driver email (make switching painless)

### P4 · Inbox list & reading UX  · M
- **Goal:** a real inbox, not just a process list.
- **Build:** message list, thread/read view (bodies in memory only), keyboard
  archive/done, pagination.
- **Test:** rendering + state tests; smoke note.
- **Docs:** README (demo script), CHANGELOG.

### P5 · Microsoft 365 ingestion  · L
- **Goal:** the second mailbox (corporate + personal Outlook).
- **Build:** `MicrosoftGraphSource` (read-only `Mail.Read`) via the `/common`
  authority; reuse the `EmailSource` seam + OAuth pattern.
- **Test:** Graph payload → `RawEmail` mapping tests; selector tests.
- **Docs:** ARCHITECTURE (EmailSource status), README (connect M365),
  COMPETITIVE, CHANGELOG.

### P6 · Split Inbox / auto-triage lanes  · M
- **Goal:** organize by VIP / tool / rule, not one flat list.
- **Build:** user-defined lanes; route processed items by sender/label/rule.
- **Test:** routing-rule unit tests.
- **Docs:** PROJECT, COMPETITIVE, CHANGELOG.

---

## Stage C — AI that earns the premium

### P7 · Write-with-AI + Auto Drafts + Tone  · M
- **Goal:** draft from a prompt; proactively suggest replies in the user's voice.
- **Build:** prompt-to-draft endpoint; opt-in auto-draft on incoming; a
  per-user tone profile fed into the system prompt. All via `ApertusLocalProvider`.
- **Test:** prompt-assembly unit tests; fallback-path tests.
- **Docs:** ARCHITECTURE (AI prompts), COMPETITIVE, CHANGELOG.

### P8 · Ask AI (Q&A over your inbox)  · M
- **Goal:** "what did Jordan say about the deadline?"
- **Build:** retrieval over the in-memory embeddings + derived data, answered
  locally by Apertus. Nothing persisted beyond existing encrypted items.
- **Test:** retrieval ranking tests; answer-grounding guardrail test.
- **Docs:** ARCHITECTURE, COMPETITIVE, CHANGELOG.

---

## Stage D — Productivity & polish

### P9 · Snippets · Send Later · Reminders · Snooze  · M
- **Build:** reusable snippets; scheduled send; follow-up reminders; snooze —
  each as its own small, tested unit.
- **Test:** scheduling/reminder unit tests.
- **Docs:** PROJECT, COMPETITIVE, CHANGELOG.

### P10 · Calendar (optional)  · M
- **Build:** See-Your-Day inline availability, create-event-from-email.
- **Test:** availability-calc tests.
- **Docs:** COMPETITIVE, CHANGELOG.

### P11 · Keyboard-first UX + Cmd+K  · M
- **Build:** shortcut map, command palette, fast navigation.
- **Test:** keymap unit tests; a11y smoke.
- **Docs:** README, COMPETITIVE, CHANGELOG.

---

## Stage E — Monetize

### P12 · Billing & freemium gating  · M · **Gate**
- **Goal:** the cash register (only after P1–P3 make the promise true).
- **Build:** Stripe; **Full $15/mo or $10/mo annual**; enforce the **free cap
  (2 emails / limited text)** in the pipeline; plan-state feature gates.
- **Test:** gating unit tests (free vs full limits); webhook handling tests.
- **Docs:** PROJECT (pricing live), ROADMAP, CHANGELOG.

---

## Stage F — Team tier

### P13 · Team workspaces  · L
- **Build:** orgs/teams; shared snippets; share-&-comment on a thread; reply
  indicators; (opt-in) team read statuses.
- **Test:** sharing-permission tests (no leakage outside team).
- **Docs:** ARCHITECTURE, COMPETITIVE, CHANGELOG.

---

## Stage G — Enterprise tier (premium, last)

### P14 · SSO + SCIM  · L
- **Build:** SAML SSO (Google/Microsoft/Okta) + SCIM provisioning/deprovisioning.
- **Test:** SAML assertion + SCIM lifecycle tests.
- **Docs:** ARCHITECTURE, COMPETITIVE, CHANGELOG.

### P15 · Admin console + roles + team AI governance  · L
- **Build:** centralized admin (seats, permissions, billing), custom roles,
  org-level AI enable/disable.
- **Test:** RBAC tests.
- **Docs:** COMPETITIVE, CHANGELOG.

### P16 · Compliance pack  · L
- **Build:** DLP / sensitivity labels, audit export, BYOK/CMEK option; produce
  PIPEDA/SOC2/ISO artifacts + a Threat & Impact Assessment (TIA).
- **Test:** DLP rule tests; audit-export integrity test.
- **Docs:** PROJECT (compliance), ROADMAP, COMPETITIVE, CHANGELOG.

### P17 · Agentic AI + MCP (optional, cutting-edge)  · L
- **Build:** multi-step workflow agents; MCP connectors — all on
  Canadian-controlled inference.
- **Test:** tool-call + guardrail tests.
- **Docs:** ARCHITECTURE, COMPETITIVE, CHANGELOG.

---

## Fast path to a paid product
Realistically, the shortest honest line to charging money is:
**P0 → P1 → P2 → P3 → P4 → P5 → P7 → P12.**
Everything else (Stage D polish, Stage F team, Stage G enterprise, P8/P10/P17)
is fast-follow once you have paying users. "Full product" is the whole list —
but ship the gated core first, in order, each phase tested and documented.

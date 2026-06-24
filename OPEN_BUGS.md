# Open Bugs & Known Issues

Tracking file for the prototype. Each item has a severity and status. "By design"
items are intentional prototype simplifications (documented, not defects).

_Last updated: 2026-06-23_

---

## Open

### BUG-001 — CPU-only inference is slow
- **Severity:** Medium (UX / demo flow)
- **Where:** any non-GPU host (e.g. Hostinger KVM 4). Apertus 8B runs ~15 emails ×
  3 passes on CPU.
- **Symptom:** "Process inbox" takes several minutes; only some cards appear if you
  navigate away mid-run.
- **Workaround:** click "Process inbox" again to resume (already-done emails are
  skipped); pre-process before a live demo.
- **Fix:** serve Apertus on a **Canadian GPU host** (e.g. ServaRica "Bee", Tesla P40).
- **Status:** Open (environment/hardware, not a code defect).

### BUG-003 — No progress indicator for long processing runs
- **Severity:** Low (UX)
- **Where:** `src/app/page.tsx` + `/api/process` (single blocking request).
- **Symptom:** on slow hosts the button sits on "Working…" with no per-email progress;
  a very long request can appear to stall.
- **Fix idea:** stream progress (process per-email and report counts) or poll a status
  endpoint.
- **Status:** Open (enhancement).

### BUG-007 — Replies are not threaded
- **Severity:** Low (feature polish)
- **Where:** `src/lib/email/send.ts` / compose modal. A reply goes out as a new
  message to the original sender with a `Re:` subject, but without real
  `In-Reply-To`/`References` headers (we don't persist the original `Message-ID`),
  so it may not group into the original thread in the recipient's client.
- **Fix:** at reply time, fetch the original message's `Message-ID` + thread id by
  its (already-known) provider id via the read scope, and set the threading
  headers / Gmail `threadId`.
- **Status:** Open (follow-up to the send feature).

### BUG-008 — Connected accounts need reconnect to send
- **Severity:** Low (one-time, expected)
- **Where:** OAuth scopes gained `gmail.send` / `Mail.Send`. Accounts connected
  before sending existed hold read-only tokens, so the first send returns 403.
- **Workaround:** click **Add Gmail / Add Microsoft** to reconnect (the UI shows a
  reconnect hint on the 403). By design — a scope upgrade always needs re-consent.
- **Status:** Open (expected; documented in README).

### BUG-004 — Residual Next.js security advisories
- **Severity:** Low (for this prototype — issues are DoS / image-optimizer /
  middleware / cache-poisoning, none exercised by this app)
- **Where:** `next@14.2.35` (critical advisory already cleared).
- **Fix:** full upgrade to the **Next.js 16** line (React 19) — a breaking change,
  deferred to production hardening. Re-run `npm audit` each release.
- **Status:** Deferred (production).

---

## Resolved

### BUG-006 — One mailbox per provider (no multi-account)
- **Resolved 2026-06-24 (P5.5).** Tokens were one file per provider per user, so
  a second Gmail/Microsoft connect overwrote the first. Now a shared
  `accountStore` keeps a per-account list (legacy file migrated on read), the
  OAuth start uses `prompt=select_account`, and a `CompositeSource` merges every
  connected account into one inbox (sourceIds namespaced per account). Inbox shows
  per-account chips + Add buttons.

### BUG-005 — Light-on-dark UI glitches after the dark redesign
- **Resolved 2026-06-23.** After moving to the dark Superhuman-style theme, two
  sections kept hard-coded light inline backgrounds: the connected-Gmail banner
  and the semantic-search box. Both now use the dark theme surfaces
  (`.banner.warn` and `.card`).

### BUG-002 — Triage over-labeled emails "Urgent"
- **Resolved 2026-06-19.** Rewrote the triage prompt in `ApertusLocalProvider` with
  an explicit, ordered rubric for each priority ("Urgent" only for an imminent hard
  deadline / time-sensitive consequence) and a preferred set of triage labels. Being
  prompt-based, results are improved but still model-dependent.

### BUG-R01 — Apertus replied in German/French
- **Resolved 2026-06-19.** Hardened the system prompt + per-instruction wording in
  `ApertusLocalProvider` to force English regardless of input language.

### BUG-R02 — Apertus returned gibberish / math instead of answers
- **Resolved 2026-06-19 (config).** Root cause: a bare `.gguf` imported into Ollama
  with **no chat template**, so the model ran as a base completion model. Fix: use the
  community **instruct** tag (`MichelRosselli/apertus:8b-instruct-2509-q4_k_m`) or
  build a custom model `FROM` it (inherits the correct template). Documented in
  `README.md` troubleshooting.

---

## By design (not bugs — documented prototype limits)

- **Key custody is local** — the default `KmsKeyVault` does envelope encryption
  with the KEK in `KMS_MASTER_KEY` / a gitignored file (keys apart from data, DB
  holds only ciphertext). The insecure co-located `LocalKeyVault` remains only
  under `KEY_VAULT=local`. `TODO(production)`: a Canadian-controlled HSM/KMS
  behind the `KmsClient` seam (P2 shipped the seam, not the managed KMS).
- **Forget runs on a timer, but storage isn't Postgres yet** — a background
  scheduler (P3) sweeps all users on an interval (lazy on-read kept as a
  backstop). `TODO(production)`: Canadian-region managed Postgres + single-leader
  scheduling for multi-instance deploys.
- **Hosting is not Canadian (yet)** — the demo VPS (Hostinger) is US-based. Acceptable
  only because data is synthetic. `TODO(production)`: Canadian-region host.
- **"Reset demo" button** exists for the demo only — real lifecycle is governed solely
  by the forget schedule.
- ~~No automated tests / CI~~ — **resolved 2026-06-23 (P0).** CI runs
  typecheck → **Vitest unit tests** → build on every push; 14 tests cover
  crypto-shredding, forget-schedule math, Gmail parsing, and source selection.
  `TODO`: broaden coverage (pipeline integration, e2e) as features land.

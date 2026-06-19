# Open Bugs & Known Issues

Tracking file for the prototype. Each item has a severity and status. "By design"
items are intentional prototype simplifications (documented, not defects).

_Last updated: 2026-06-19_

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

### BUG-004 — Residual Next.js security advisories
- **Severity:** Low (for this prototype — issues are DoS / image-optimizer /
  middleware / cache-poisoning, none exercised by this app)
- **Where:** `next@14.2.35` (critical advisory already cleared).
- **Fix:** full upgrade to the **Next.js 16** line (React 19) — a breaking change,
  deferred to production hardening. Re-run `npm audit` each release.
- **Status:** Deferred (production).

---

## Resolved

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

- **`LocalKeyVault` is insecure** — per-item keys are stored base64 in the **same**
  SQLite file as the ciphertext. Demonstrates the crypto-shredding lifecycle only.
  `TODO(production)`: Canadian-controlled HSM/KMS.
- **Forget is lazy** — `runForgetSweep()` runs on inbox/audit reads, not via a
  background scheduler. `TODO(production)`: reliable scheduled job + storage-layer
  enforcement.
- **Hosting is not Canadian (yet)** — the demo VPS (Hostinger) is US-based. Acceptable
  only because data is synthetic. `TODO(production)`: Canadian-region host.
- **"Reset demo" button** exists for the demo only — real lifecycle is governed solely
  by the forget schedule.
- **No automated tests / CI** yet. `TODO`: add unit tests (crypto/forget/pipeline) and
  a build+typecheck CI workflow.

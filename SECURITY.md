# Security

Citadel's whole promise is a security property: your mail is processed on
infrastructure you control, the AI-derived data is encrypted per item, and it is
**provably forgotten** on a schedule (`COMPLIANCE.md`, `ARCHITECTURE.md`). That
promise is only as good as the discipline behind it, so security testing runs on a
**cadence**, not once.

## Reporting a vulnerability
Email **security@aletheos.tech** with steps to reproduce. Please do not open a
public issue for anything exploitable. We aim to acknowledge within 72 hours.
Good-faith research is welcome; do not run destructive tests, scrape real user
data, or attempt DoS against the live host.

## Testing cadence

### Automated — every push + weekly (`.github/workflows/security.yml`)
| Check | Tool | Catches |
|---|---|---|
| Secret scan | gitleaks (full history) | Committed keys/tokens — live secrets must live only in `.env` on the host, never in the repo |
| Dependency audit | `npm audit` (high+) | Known-vulnerable packages; summary posted to each run |
| Static analysis (SAST) | CodeQL (`security-and-quality`) | Injection, unsafe sinks, taint flows in the TS |
| Dynamic scan (DAST) | OWASP ZAP baseline | Missing security headers, reflected XSS, info leaks — run against a live heuristic build weekly / on demand |

Run the dynamic scan on demand: **Actions → Security → Run workflow**.

### Manual — quarterly pen test
Automated scanners catch the common classes; a human pass catches the logic flaws
they can't. Once a quarter (and before any launch that widens data exposure — e.g.
turning on real multi-tenant auth, or going live with the keys-off-host KMS), walk
the focused checklist below and file findings as issues.

**Scope — the things that would actually hurt:**
1. **Tenant isolation.** Every stored row is `userId`-scoped through
   `currentUserId()`. Try to read/forget another user's items by tampering with
   IDs, session, and API params. Confirm no endpoint trusts a client-supplied
   `userId`.
2. **The forget guarantee.** Verify a forgotten item is genuinely unrecoverable:
   the wrapped DEK is gone, the ciphertext won't decrypt, and nothing (logs,
   caches, audit, error messages) leaks the plaintext or a key.
3. **Audit log stays content-free.** Confirm no event carries subject lines, body
   text, summaries, or key material — only the non-sensitive strings.
4. **Raw bodies never persist.** Trace an email through the pipeline and confirm
   the raw body is in-memory only and never written to the DB or logs.
5. **Keys-off-host boundary.** With `KMS_REMOTE_URL` set, confirm the app host
   holds no KEK, the bearer token is required on `/wrap` + `/unwrap`, the key
   service is not reachable except from the app, and TLS (ideally mTLS) is
   enforced (`tools/keyservice/DEPLOY.md`).
6. **OAuth + token storage.** Gmail/Microsoft tokens are per-user and gitignored;
   confirm scopes are read-or-send as intended and tokens aren't logged.
7. **Billing webhook.** Confirm the Stripe webhook verifies the signature on the
   **raw** body and that a forged event can't flip a plan.
8. **Standard web surface.** Re-confirm the ZAP findings by hand: security
   headers, cookie flags, CSRF on state-changing POSTs, rate limiting.

**Suggested manual DAST against the live site** (read-only, non-destructive):
```bash
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t https://citadel.aletheos.tech -a -m 5
```

## Production hardening (tracked, not yet all done)
Items carry `// TODO(production):` markers in code. The load-bearing ones:
- Stand up the **keys-off-host** key service on a separate Canadian host with mTLS
  + unwrap audit logging before taking real client data (`tools/keyservice/`).
- Add rate limiting and CSRF protection on state-changing endpoints.
- Move from on-host SQLite/KEK demo posture to managed Canadian Postgres + KMS/HSM.

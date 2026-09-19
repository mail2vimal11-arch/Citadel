# OAuth verification — the "connect a real inbox" gate

Connecting a real mailbox needs the mail provider's OAuth consent screen, and both
Google and Microsoft gate the **scopes Citadel uses** behind app review. This is a
real production gate (like keys-off-host and the GPU move) — track it here.

## Scopes Citadel requests (least-privilege, but "restricted")
| Provider | Scopes | Class | Where |
|---|---|---|---|
| Google | `https://www.googleapis.com/auth/gmail.readonly`, `gmail.send` | **Restricted** | `src/lib/email/googleAuth.ts` |
| Microsoft | `Mail.Read`, `Mail.Send`, `User.Read`, `offline_access` | Delegated | `src/lib/email/microsoftAuth.ts` |

Gmail read + send are **restricted scopes** — Google's most heavily reviewed tier.
That's what triggers *"Access blocked: aletheos.tech has not completed the Google
verification process."*

---

## Pilot path (now) — Testing mode + test users, NO verification
For 1–100 testers you do **not** need verification. Keep the OAuth app in
**Testing** and add each tester as a **Test user**:

1. Google Cloud Console → the project holding the OAuth client → **APIs & Services
   → OAuth consent screen** (2026 console: **Google Auth Platform → Audience**).
2. **Publishing status = Testing** (an unverified *In production* app hard-blocks
   everyone on restricted scopes).
3. **Test users → + Add users** → add each tester's Gmail (incl. the owner). Save.
4. Reconnect Gmail. Testers see *"Google hasn't verified this app"* → **Advanced →
   Go to aletheos.tech (unsafe) → Continue**. This is expected in testing.

**Caveat — 7-day tokens.** In Testing mode Google **expires refresh tokens after 7
days**, so testers must reconnect Gmail weekly. Fine for a short pilot; it's the
main reason to verify before a longer beta.

**Microsoft** equivalent: in Entra, keep the app multi-tenant + add testers; a
personal-Outlook tester just consents. (Microsoft doesn't gate `Mail.Read`/`Send`
as hard as Google, but publisher verification is still recommended before scale.)

---

## Production path (before public / >100 users / no weekly re-auth)
Full **Google OAuth verification** for restricted scopes. The long pole is CASA.

- [ ] **Verify domain** `aletheos.tech` (Search Console) and set it as an
      authorized domain on the consent screen.
- [ ] **Public homepage** — `https://citadel.aletheos.tech/` (done).
- [ ] **Public privacy policy** — `https://citadel.aletheos.tech/privacy`
      (done; includes the **Google API Limited Use** disclosure — required).
- [ ] App name, logo, support email, scope **justifications**, and a **demo video**
      showing each requested scope in use.
- [ ] **CASA (Cloud Application Security Assessment)** — a third-party security
      assessment **required for restricted scopes**, renewed annually. Takes
      **weeks** and has a cost. **Start this early** — it gates launch.
- [ ] Submit for verification; respond to Google's review.

### What Citadel already satisfies (helps the review)
- **Data minimization:** only AI-derived summary/triage/draft is stored; raw bodies
  are in-memory only, never written to disk (`src/lib/pipeline.ts`).
- **No human access / no ads / no sale:** the AI pass is automated and local
  (Ollama/Apertus); no human reads content; nothing is sold or used for ads.
- **Crypto-shredding + keys-off-host:** derived data is encrypted per item and
  destroyed on a schedule; the KEK can live off the compute host.
- **Limited Use disclosure** is published in `/privacy`.

---

## Quick reference
- Restricted scopes & verification: https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification
- Limited Use requirements: https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes
- CASA: https://appdefensealliance.dev/casa

## TODO(production)
- Decide pilot ceiling (stay in Testing ≤100 users, accept weekly re-auth) vs.
  commit to verification + CASA now.
- Create `support@aletheos.tech` / `privacy@aletheos.tech` mailboxes (verification
  requires a working support contact).
- Fill the legal-entity + address placeholders in `/privacy` before submitting.

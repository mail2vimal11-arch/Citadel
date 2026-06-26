# COMPLIANCE.md — Data sovereignty posture & client disclosure

> Working document for Citadel. Distils two adversarially-verified research passes
> (see session notes). **Not legal advice** — the legal claims rest on primary
> statute (18 U.S.C. § 2705(b)), a US Congressional Research Service report, AWS's
> own CLOUD Act page, law-firm analyses, and a docketed Canadian case
> (*King v. OVH*, Ont. 2025). Confirm everything with Canadian + US counsel before
> relying on it with real clients.

## TL;DR
**No cloud — US or non-US — gives jurisdictional immunity.** The protection that
holds is *technical*: Citadel holds the encryption keys in a manager it controls
**off the compute/data host**, and **crypto-shreds** on a schedule, so any host
or court can only ever obtain **ciphertext it cannot read**. Jurisdiction is a
secondary, best-effort layer — never the guarantee.

## The legal reality (verified; not legal advice)
- **US-owned clouds are CLOUD-Act-reachable regardless of region.** AWS, GCP,
  Azure, and DigitalOcean must produce data in their "possession, custody, or
  control" under a valid SCA warrant even when it sits in a Canadian region. AWS
  concedes it discloses under "a legally valid and binding order."
- **Notification cannot be promised.** 18 U.S.C. § 2705(b) gag / non-disclosure
  orders can legally bar the provider (or Citadel, if served) from telling
  clients — and they accompany roughly half of large providers' demands. The
  July 2025 D.C. Circuit ruling narrowed but did **not** abolish them.
- **Non-US ownership is necessary but NOT sufficient.** In *King v. OVH* (Ontario,
  Sept 2025) an Ontario court ordered French-owned **OVHcloud** to produce
  customer data stored in France/UK/Australia **through its Canadian subsidiary**.
  A local commercial presence creates a "possession/custody/control" nexus that
  mirrors the CLOUD Act — so even a "sovereign" provider with a local entity can
  be compelled by **local** court order. (Under appeal; theory is documented now.)

## The guarantee that actually holds (technical, provider-independent)
1. **Per-item encryption** (already shipped — AES-256-GCM, one key per item).
2. **Keys held off the host.** An external key manager Citadel controls, hosted
   **separately** from the GPU/data host (AWS KMS **External Key Store / XKS**
   style, or our own off-host KMS). The host stores only ciphertext + *wrapped*
   DEKs it cannot decrypt alone. **Plain BYOK is not enough** — only a true
   external manager keeps the decrypting key off the host.
3. **Crypto-shredding** (already shipped — destroy per-item keys on schedule →
   data unrecoverable even if ciphertext is later compelled).
4. **Net:** a compelled disclosure yields unreadable bytes. This does **not**
   depend on a notification promise a gag order can void.

This is already Citadel's architecture: the `KmsKeyVault` seam (BUILD_PLAN P2) +
the scheduled forget engine (P3). **The production step is to point the KEK at an
off-host key store** — not the cloud that runs the model. See ARCHITECTURE.md.

## Interim hosting — until a sovereign Canadian-GPU end-state
Ranked for a sovereignty-leaning, bootstrap budget that **keeps self-hosted
Apertus** (and therefore the "AI runs on infra you control" posture):

| Option | Owner | Runs Apertus? | $0 idle? | Verdict |
|---|---|---|---|---|
| **DigitalOcean TOR1** (Toronto) | 🇺🇸 US | ✅ container | ❌ per-hour | Cheapest **verified** ($0.76/hr RTX 4000 Ada). US-owned → only acceptable **with keys-off-host**. TOR1 GPU capacity constrained (Mar 2026). |
| **Cloudspace.ca** | 🇨🇦? | ✅ container | ❌ flat monthly | Canadian *marketing*, but **ownership unproven (refuted in research)** — verify the corporate entity before trusting the sovereignty angle. |
| **OVHcloud BHS5** (Québec) | 🇫🇷 FR | ✅ container | ❌ per-hour | Only **old V100s** in Canada (new GPUs are France-only); "CLOUD Act immunity" undercut by *King v. OVH*. |
| **Bedrock / Azure MaaS** | 🇺🇸 US | ❌ own catalog only | ✅ pay-per-token | **Disqualified:** US-owned **and** can't run Apertus — breaks the wedge. |
| **Xcelsior** | ? | ? | ? | **Unverified** — no surviving evidence; do not rely on without direct diligence. |

**Practical interim call:** because jurisdiction never fully saves you, run Apertus
on whatever Canadian-region container is cheap/available **and make the guarantee
keys-off-host + crypto-shred**. DigitalOcean TOR1 is the pragmatic verified pick;
Cloudspace is preferable *iff* its Canadian ownership checks out. Either way the
client-facing promise is technical, not jurisdictional.

## Honest client disclosure (interim wording)
> *"During our interim phase your AI-derived data is hosted on cloud infrastructure
> in a Canadian region. We do not rely on the hosting company's jurisdiction for
> your privacy — no cloud is immune to a court order. Instead, we hold the
> encryption keys ourselves, on infrastructure separate from where your data
> lives, so the host can only ever be compelled to produce encrypted bytes it
> cannot read; and we destroy those keys on a schedule (crypto-shredding) so even
> that becomes permanently unrecoverable. We cannot promise to notify you of a
> government request — a non-disclosure order may legally forbid it — which is
> exactly why our protection is technical (we hold the keys), not a promise."*

## Canadian privacy law (confirm with counsel)
PIPEDA permits cross-border / US-cloud processing **with safeguards + transparency**;
Quebec **Law 25** and Ontario **PHIPA** add disclosure (and, for Law 25, a privacy
impact assessment) obligations for transfers outside the province/country. The
keys-off-host + crypto-shred design is the *safeguard*; the disclosure above is the
*transparency*. Confirm the specific consent/PIA obligations with Canadian counsel.

## Retired posture
- ❌ *"We will notify all clients and permanently delete all accounts on a CLOUD
  Act request."* **Retired** — gag orders make notification unreliable, and
  *reactive* deletion after a known request risks obstruction/spoliation. Replaced
  by **scheduled crypto-shredding + keys-off-host** (a standing technical control,
  not a reaction to a request).

## Open items (need fresh diligence / counsel)
- Verify **Cloudspace.ca** corporate ownership + per-GPU pricing.
- Verify **Xcelsior** existence / ownership / pricing, or drop it.
- Confirm **Bedrock ca-central-1 / Azure MaaS Canada** serverless catalog + in-region
  residency *if* ever reconsidering a managed-model fallback (note: abandons Apertus).
- Counsel sign-off on Law 25 / PHIPA consent + PIA for the interim host.
- The end-state question: even a purely Canadian-owned host can be reached by a
  Canadian production order (same local-presence logic) — so keys-off-host +
  crypto-shred remains the load-bearing control even after the sovereign-GPU move.

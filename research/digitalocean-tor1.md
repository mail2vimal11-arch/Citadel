# DigitalOcean TOR1 — sovereignty assessment for Citadel

**Question.** Is DigitalOcean's Toronto region (TOR1) a viable production substrate
for Citadel / Sovereign Inbox, given the architecture's PIPEDA + Canadian-sovereignty
goals (see `ARCHITECTURE.md`, "TODO(production)" checklist)?

**Short answer.** TOR1 gives **data residency** but not **data sovereignty**.
That distinction is decisive for this project. TOR1 is acceptable for compute and
storage *if* the KeyVault seam is moved off DigitalOcean entirely. It is not
acceptable as a single-vendor sovereign stack.

---

## 1. Residency vs. sovereignty — the load-bearing finding

DigitalOcean Holdings, Inc. is US-incorporated. Under the US CLOUD Act, a US
court can compel a US-incorporated provider to produce data in its possession,
custody, or control **regardless of where the data physically sits**. Putting
droplets, managed Postgres, and Spaces in TOR1 changes the bits' GPS coordinates;
it does not change who can be served a warrant.

- "Storing data on Canadian soil does not protect it. The CLOUD Act compels
  disclosure based on who controls the data, not where it is stored."
  — [BLG, *Data sovereignty and the CLOUD Act*](https://www.blg.com/en/insights/2026/04/data-sovereignty-and-the-cloud-act-what-canadian-organizations-should-know)
- "When Canadians use services provided by US-headquartered companies … their
  data is subject to CLOUD Act jurisdiction regardless of where it is physically
  stored."
  — [Balsillie Papers, *Whose Law Governs Canadian Data?*](https://balsilliepapers.ca/canadian-data/us-cloud-act/)

PIPEDA itself does not require physical residency in Canada — it requires
*accountability* for safeguards and *notice* on cross-border processing
([Pilotcore](https://pilotcore.io/blog/canadian-data-residency-and-the-public-cloud)).
So TOR1 buys low latency and the *appearance* of locality; the legal posture is
unchanged from NYC3 or AMS3.

**Implication for Citadel.** The architecture's stated goal —
"keep all email-derived data inside Canadian-controlled infrastructure" — is
not satisfied by TOR1 alone. The CLOUD Act exposure is the same as for any other
DigitalOcean region.

## 2. What TOR1 *does* give you

| Capability | Status in TOR1 (Jun 2026) |
|---|---|
| Droplets — Basic / General Purpose / CPU-, Memory-, Storage-Optimized, Premium Intel + AMD | ✅ |
| Managed PostgreSQL / MySQL / MongoDB / OpenSearch / Kafka / Valkey | ✅ (Postgres + MySQL now ship expanded storage tiers in TOR1) |
| App Platform | ✅ (region `tor`) |
| Functions (serverless) | ✅ |
| Spaces (object storage, S3-compatible) | ✅ — [added 2024](https://www.digitalocean.com/blog/digitalocean-spaces-now-available-in-toronto) |
| Volumes / NFS / Container Registry | ✅ |
| GPU Droplets + Bare Metal GPUs | ✅ (TOR1 + NYC2 are the two GPU regions) |
| VPC, Load Balancers, Snapshots, Backups, Reserved IPs | ✅ |
| **Native KMS / HSM / customer-managed keys** | **❌ — no DO product exists** |

Source: [DigitalOcean Regional Availability](https://docs.digitalocean.com/platform/regional-availability/),
[Spaces availability](https://docs.digitalocean.com/products/spaces/details/availability/),
[App Platform availability](https://docs.digitalocean.com/products/app-platform/details/availability/),
[Managed Databases H1 update](https://www.digitalocean.com/blog/managed-databases-updates-h1).

For the prototype's `EmailSource` → `AIProvider` → `KeyVault` pipeline, TOR1
covers everything *except* the KeyVault.

## 3. Compliance posture

**Provider-level (DigitalOcean Holdings).**
SOC 2 Type II, SOC 3 Type II, GDPR-aligned, eligible to process HIPAA and DORA
workloads. ISO 27001 referenced in third-party listings; DO's own Trust page is
the canonical source: [digitalocean.com/trust/certification-reports](https://www.digitalocean.com/trust/certification-reports).

**Facility-level (TOR1 colo, operated by Cologix/Equinix per public listings).**
ISO 9001, 14001, 22301, **27001**, 45001, 50001, PCI-DSS, SOC 1 Type II,
SOC 2 Type II. ([datacenters.com TOR1 listing](https://www.datacenters.com/digitalocean-digitalocean-tor1)).

**Managed Postgres encryption at rest.**
Full-volume LUKS, AES-XTS-Plain64/SHA-256, 512-bit randomly generated ephemeral
key per instance/volume. Backups: AES-256-CTR + HMAC-SHA-256. TLS in transit.
**No BYOK / customer-managed key support.**
([DO Postgres security docs](https://docs.digitalocean.com/products/databases/postgresql/how-to/secure/)).

This is the structural problem for Citadel: the `KeyVault` interface
(`ARCHITECTURE.md` §3) requires per-item keys that the operator can *destroy*
to make a record unrecoverable. DO's managed-DB encryption is single-key,
ephemeral, and opaque — it satisfies "encrypted at rest" auditor checkboxes but
gives no surface for cryptographic shredding at item granularity.

## 4. The KMS gap — three workable options

DigitalOcean has no native KMS, no HSM service, and no BYOK on managed
databases. The KeyVault seam must therefore live elsewhere. Three options,
ranked by sovereignty:

### Option A — YubiHSM 2 in a Canadian colo (most sovereign)
Hardware HSM shipped to a Canadian-operator colo (e.g. Estruxture, Cologix
TOR-1 cage, eStruxture MTL-2). App talks to it over private wire. Keys never
leave the device; destruction is physically auditable. No US-jurisdiction
provider in the trust path.
**Cost.** ~CA$650 device + colo cross-connect + remote-hands SLA. Single point
of failure unless paired.
**Fit.** Strongest match for the architecture's "hardware-backed and auditable"
TODO. Operationally heaviest.

### Option B — HashiCorp Vault on a Canadian-incorporated provider
Vault (open source, Raft storage) on a droplet — but the droplet should sit at
a Canadian-incorporated provider (OVHcloud BHS, eStruxture, IONOS Toronto)
rather than DO TOR1. Vault then exposes a clean `KeyVault` implementation:
`issueKey` / `getKey` / `destroyKey` map to its KV v2 + Transit engines.
DigitalOcean Marketplace offers a 1-Click Vault droplet
([docs](https://docs.digitalocean.com/products/marketplace/catalog/hashicorp-vault/))
— **do not use the DO 1-Click for the production KeyVault**, because that puts
keys back inside DO's blast radius and CLOUD Act perimeter. Use it as a
reference for the deployment shape only.
**Cost.** ~CA$10–30/mo droplet + ops effort.
**Fit.** Good middle ground; software-only, no hardware root of trust.

### Option C — OVHcloud OKMS (cleanest API, sovereignty caveat)
OVHcloud's KMaaS supports BYOK, KMIP, REST. Targeting ISO 27001 and FIPS 140-3.
([OVHcloud KMS labs](https://labs.ovhcloud.com/en/key-management-service/)).
OVHcloud runs a 1-AZ region in Beauharnois (`ca-east-bhs`).
**Caveat that matters.** OVHcloud's **Shared HSM and Managed HSM tiers launch
in Paris and Milan first**, with no announced Canadian rollout
([OVHcloud HSM labs](https://labs.ovhcloud.com/en/shared-hsm/),
[Managed HSM](https://labs.ovhcloud.com/en/managed-hsm/)). The OKMS software
service is regionally broader but the dedicated HSM root of trust is not in
Canada in 2026. OVHcloud is French-incorporated, so EU/French process applies
— better than CLOUD Act for a Canadian sovereignty story, but still not
Canadian law.

## 5. The OVHcloud BHS alternative — full-stack comparison

| Dimension | DigitalOcean TOR1 | OVHcloud BHS |
|---|---|---|
| Compute region in Canada | ✅ Toronto | ✅ Beauharnois, QC (1-AZ `ca-east-bhs`) |
| Provider HQ jurisdiction | 🇺🇸 US (CLOUD Act exposure) | 🇫🇷 France (no CLOUD Act, EU law) |
| Managed Postgres | ✅, no BYOK | ✅ Managed PG, BYOK via OKMS |
| Object storage | ✅ Spaces | ✅ Object Storage / S3-compatible |
| Native KMS | ❌ | ✅ OKMS (KMIP + REST, BYOK) |
| Hardware HSM in-region | ❌ | ❌ (Paris/Milan first, mid-2026) |
| GPU compute | ✅ in TOR1 | Limited in BHS |
| Compliance ceiling | SOC 2, ISO 27001 | SOC 2, ISO 27001, **SecNumCloud** (FR sovereignty cert) |
| DX / docs quality | High | Good but rougher |

Neither vendor delivers a *Canadian-incorporated* end-to-end stack in 2026.
OVHcloud BHS is the closer fit for Citadel's stated goal because (a) the parent
company is not subject to CLOUD Act, and (b) BYOK on managed Postgres
*structurally permits* the per-item key model the `KeyVault` interface
requires, even if you still wire it through your own Vault or HSM for the
shredding semantics.

## 6. Recommendation for Citadel

1. **Reframe the architecture's TODO line.** "Canadian-controlled
   infrastructure" can mean *physical residency* or *jurisdictional sovereignty*.
   The current ARCHITECTURE.md uses the phrase as if they're the same. They
   are not. Pick one explicitly, because the answer flips the vendor choice.
2. **If the goal is residency-only (PIPEDA accountability + Canadian-region
   compute):** DO TOR1 is fine. Use Managed Postgres for the `DerivedItem`
   ciphertext store, Spaces for any future attachments, App Platform for the
   Next.js front end. Move only the `KeyVault` off DO — Option A (YubiHSM in a
   Canadian colo) or Option B (Vault on OVHcloud BHS droplet) closes the gap.
3. **If the goal is true jurisdictional sovereignty:** TOR1 is the wrong
   substrate. Move the whole stack to OVHcloud BHS, use OKMS for keys, and
   accept the slightly rougher DX.
4. **Either way:** keep the three-interface seam from `ARCHITECTURE.md`
   intact. The `KeyVault` interface is the lever that lets us decouple key
   custody from the rest of the stack — that's exactly the surface this
   sovereignty question turns on.

## 7. Open questions worth one more round

- **MLAT vs. direct disclosure.** DO's [Law Enforcement Guidelines](https://www.digitalocean.com/legal/law-enforcement-guidelines)
  page is the canonical source for what process DO honours and whether they
  notify users; that page 403'd from WebFetch here, so this needs a manual
  read before a final decision.
- **Threat & Impact Assessment (TIA) template.** PIPEDA + provincial health
  privacy regimes (PHIPA in ON, Loi 25 in QC) each have specific TIA
  expectations; not researched here.
- **OVHcloud Managed Postgres BYOK end-to-end test.** Confirm the OKMS →
  Managed PG key path actually works in `ca-east-bhs` (vs. only in the
  EU regions) before committing to Option C.

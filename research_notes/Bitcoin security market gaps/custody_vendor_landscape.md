# Crypto/Bitcoin Custody and Key-Management Vendor Landscape (as of Oct 31, 2026)

Research method note: 19 web searches (no full-page fetches) on Oct 31, 2026. Most findings come from search-result summaries of news coverage, not full primary documents. Items marked **[PRIOR KNOWLEDGE – NOT RE-VERIFIED]** come from the researcher's background knowledge (cutoff mid-2026). They were not confirmed with a source in this session and appear only under Inferences or Gaps. Treat them as leads to verify. Several vendors on the requested list (Komainu, Hex Trust, Cobo, Taurus, Liminal, Nunchuk, Lit, Cordial Systems, Blockdaemon/Sepior, and the HSM vendors) had **no 2025–2026 coverage surface** in this session's searches. Their rows are thin and flagged.

## 1. What each vendor offers, who they sell to, and architecture / Bitcoin depth

### Takeaway
The market splits into four tiers:
- Regulated qualified custodians: Coinbase, Anchorage, BitGo, Fidelity, Zodia/StanChart.
- MPC/policy-engine software platforms: Fireblocks, Dfns, Fordefi, Utila, Turnkey, Cobo, Liminal.
- Bank-grade custody software: Ripple Custody (formerly Metaco) + Palisade, Taurus.
- Bitcoin-native collaborative multisig: Unchained, Casa, Nunchuk, Bitkey, Onramp, AnchorWatch.

Only the Bitcoin-native tier, plus BitGo, offers native on-chain multisig. The MPC platforms are EVM/stablecoin-centric. Evidence that any major institutional custodian supports Miniscript or Taproot policies natively is thin.

### Cited Findings
**Regulated custodians**
- **Coinbase Custody/Prime:** $376B in crypto assets under custody at year-end 2025, nearly 13% of total crypto market cap. — [Forbes](https://www.forbes.com/sites/jasonbrett/2026/04/08/coinbase-wins-occ-nod-for-376-billion-institutional-custody-empire/)
- **Coinbase charter status:** received **conditional** OCC approval (Corporate Decision #1370) on Apr 2, 2026 for "Coinbase National Trust Company," a non-insured national trust charter. It will not operate under the charter until final approval and a pre-opening exam. It already holds a NYDFS limited-purpose trust charter (2018). — [CoinDesk](https://www.coindesk.com/policy/2026/04/02/coinbase-wins-initial-occ-nod-for-trust-charter-boosting-sustody-push); [Ledger Insights](https://www.ledgerinsights.com/coinbase-receives-conditional-occ-approval-for-national-trust-charter/)
- **Other OCC charter applicants:** Paxos, Ripple, Circle and Stripe's Bridge have also applied. — [CoinDesk](https://www.coindesk.com/policy/2026/04/02/coinbase-wins-initial-occ-nod-for-trust-charter-boosting-sustody-push)
- **Anchorage Digital:** OCC-chartered crypto bank (Anchorage Digital Bank NA). It was chosen by Tether in Sept 2025 to issue Tether's US stablecoin USA₮. — [Bloomberg](https://www.bloomberg.com/news/articles/2026-02-05/tether-invests-100-million-in-crypto-bank-anchorage-digital); [Markets Media](https://www.marketsmedia.com/tether-invests-100m-in-anchorage-digital/)
- **BitGo architecture:** described by a third-party comparison site as offering both traditional 2-of-3 native multisig and MPC/TSS, with API support for Taproot (P2TR) and MuSig2. This is not confirmed from BitGo's own docs. — [Spark comparison](https://www.spark.money/tools/bitcoin-custody-api-comparison)
- **Zodia Custody:** regulated entities in Singapore, Hong Kong, Australia, UAE and Luxembourg, now being absorbed by Standard Chartered (see §4). — [The Block](https://www.theblock.co/news/business/2026-10-21-standard-chartered-signs-definitive-agreements-to-acquire-zodia-custody-421535)

**MPC / policy platforms**
- **Fireblocks:** stablecoin settlement, custody and tokenization infrastructure for banks and payment companies. — [crypto.news](https://crypto.news/visa-fireblocks-acquisition-talks-2-5-billion/)
- **Fireblocks protocols:** uses its own MPC-CMP / MPC-CMPGG protocols. — [Fireblocks press](https://www.fireblocks.com/press/fireblocks-researchers-uncover-vulnerabilities-impacting-dozens-of-major-wallet-providers)
- **Fireblocks policy engine:** policy rules are "signed by a quorum of admins and encrypted within SGX" (Intel SGX enclave). The Policy Inspector simulates policy evaluation but only for TRANSFER-type transactions and only against the *currently active* policy. — [Fireblocks support: Policy inspector](https://support.fireblocks.io/hc/en-us/articles/27117127096604-Policy-inspector-Transparent-transaction-diagnostics)
- **Fireblocks consumer layer:** in Oct 2025 it added a "custody-to-consumer" embedded-wallet/authentication layer via Dynamic (50M+ onchain accounts; customers include Kraken, Magic Eden, Ondo). — [The Block](https://www.theblock.co/post/375939/fireblocks-crypto-authentication-dynamic-web3)
- **Dfns:** wallet-infrastructure API for institutions. Clients include Fidelity and Bridge (Stripe). — [FF News](https://ffnews.com/news/dfns-secures-16m-to-expand-its-crypto-wallet-infrastructure-for-finance)
- **Fordefi:** institutional MPC wallet (DeFi-focused). Clients include Pantera, DeFiance, Keyrock and Flare. It has a WaaS product for retail-facing platforms and reported >$3B in transaction volume as of Feb 2024. — [CoinDesk](https://www.coindesk.com/business/2024/02/13/fordefi-raises-10m-to-make-crypto-safer-with-institutional-grade-wallet-to-retail-facing-platforms)
- **Utila:** institutional MPC wallet/operations platform for institutions, trading firms and Web3 builders. Its roadmap covers gas management, API integrations and smart-contract support. — [SiliconANGLE](https://siliconangle.com/2025/03/19/utila-raises-18m-meet-demand-institutional-digital-asset-mpc-wallets/)
- **Turnkey:** embedded/verifiable wallet infrastructure. Its 2026 funding is earmarked for "Turnkey Verifiable Cloud," a secure-compute product for digital assets (TEE-based verifiability is its positioning). — [CoinDesk](https://www.coindesk.com/business/2026/05/06/turnkey-raises-usd12-5-million-in-round-backed-by-circle-ventures-and-sequoia-capital); [AlleyWatch](https://www.alleywatch.com/2025/06/turnkey-crypto-infrastructure-embedded-verifiable-wallets-onchain-automation-bryce-ferguson/)
- **Cobo:** markets MPC custody and argues institutions are moving to MPC for privacy and lower fees (vendor claim). It has launched an "Agentic Wallet" for AI agents. — [Cobo blog](https://www.cobo.com/post/bitcoin-custody-explained-how-to-secure-your-btc-in-2025)

**Bank custody software**
- **Ripple Custody (ex-Metaco) + Palisade:** used by Absa, BBVA and Société Générale. Palisade adds an MPC Wallet-as-a-Service with AML screening and "zero-trust" architecture. — [Finovate](https://finovate.com/ripple-acquires-palisade-to-bolster-crypto-custody-capabilities/); [The Block](https://www.theblock.co/post/377368/ripples-crypto-investments-hit-4-billion-with-acquisition-of-wallet-tech-firm-palisade)

**Settlement**
- **Copper:** closed its enterprise custody business in 2023 and refocused on ClearLoop. ClearLoop is off-exchange delivery-versus-payment from within custody, with 1,000+ counterparties and >$50B in monthly volume (reported). — [CoinDesk](https://www.coindesk.com/business/2026/05/20/crypto-custody-firm-copper-is-looking-to-sale-the-company-for-usd500-million)
  - **Conflict:** "closed enterprise custody business" comes from search-summary paraphrase, and Copper still markets custody. Verify against the CoinDesk piece directly.

**Bitcoin-native collaborative custody**
- **Common architecture:** most use 2-of-3 multisig where the client holds 2 keys and the provider 1. Unchained, Casa and Bitkey are in "roughly the same architectural lane." — [Unchained compare](https://www.unchained.com/compare/best-bitcoin-custody-services); [Spark](https://www.spark.money/tools/bitcoin-collaborative-custody-comparison)
- **Unchained:** Bitcoin IRAs with collaborative custody and Bitcoin-backed loans for businesses (it no longer lends to individuals). Claims >$3B in BTC under custody, but that figure is from an older press release. — [Unchained](https://www.unchained.com/compare/unchained-vs-anchorwatch); [BusinessWire 2023](https://www.businesswire.com/news/home/20230711658268/en/Unchained-Launches-First-Private-Client-Service-with-Collaborative-Bitcoin-Custody)
- **Casa and Unchained:** reportedly still use traditional P2WSH multisig (not Taproot) as of mid-2026. — [Bitcoin Insurance 2026 comparison](https://www.bitcoinproducts.com/blog/bitcoin-insurance-2026)
- **Bitkey (Block):** no seed phrase. An "Emergency Exit Kit" allows recovery without Block's involvement. — [Unchained vs Bitkey](https://www.unchained.com/compare/unchained-vs-bitkey)
- **AnchorWatch:** Miniscript-based collaborative multisig paired with named Lloyd's of London insurance. It is a Nashville-based MGA founded in 2022 and a Lloyd's Coverholder since Nov 2024. Ten31 led its seed round. — [Bitcoin Insurance 2026](https://www.bitcoinproducts.com/blog/bitcoin-insurance-2026); [Unchained vs AnchorWatch](https://www.unchained.com/compare/unchained-vs-anchorwatch)
- **Onramp:** positions itself as "multi-institution custody," with keys spread across separate institutions (self-description). A May 2026 third-party table marks Onramp as lacking recovery without company involvement. — [Onramp](https://onrampbitcoin.com/knowledge-center/best-unchained-alternatives-in-2026-what-to-consider-before-you-switch); [Spark](https://www.spark.money/tools/bitcoin-collaborative-custody-comparison)

**Bitcoin protocol depth**
- **Adoption:** commentary says Taproot adoption for complex scripts "remains minimal." FROST (draft BIP-445) is the path to threshold signing that yields standard Taproot outputs; its status is unconfirmed. — [Spark research](https://www.spark.money/research/bitcoin-mpc-vs-multisig-custody); [Chainscore](https://www.chainscorelabs.com/blog/bitcoins-evolution-defi-ordinals-and-l2s/bitcoin-production-readiness/production-grade-bitcoin-key-management)
- **Custodian support:** no source found showing major institutional custodians offer Miniscript policies natively. — (absence of evidence in [search results](https://www.spark.money/research/bitcoin-custody-solutions-compared))

**Clear signing**
- **ERC-7730 / Clear Signing:** Ledger transferred stewardship to the Ethereum Foundation on May 12, 2026. Fireblocks, Trezor, MetaMask and WalletConnect are among the stewards. Ledger Enterprise Multisig ships Clear Signing, and Ledger claims every transaction is parsed into human-readable form on the device (vendor claim). — [Ledger blog](https://www.ledger.com/blog-ledger-clear-signing-ethereum-foundation); [Ledger: treasury clear signing](https://www.ledger.com/blog-why-your-treasury-needs-clear-signing)
- **Trezor:** planned human-readable signing in Q2 2026. — [Cryptonomist](https://en.cryptonomist.ch/2026/05/13/ethereum-clear-signing-erc-7730/)

### Inferences
- **MPC means Bitcoin is generic:** MPC/TSS platforms (Fireblocks, Dfns, Fordefi, Utila, Cobo, Liminal) produce single-sig outputs on Bitcoin. That gives no on-chain policy enforcement, so all policy lives in vendor software (Fireblocks: in an SGX enclave). For Bitcoin treasuries this means policy integrity depends entirely on vendor-side code and enclaves, not Bitcoin Script.
- **Clear signing skews to Ethereum:** ERC-7730 is EVM-only. The Bitcoin equivalent (PSBT plus device display of outputs and change, wallet-policy registration as on Ledger/Coldcard) exists at the hardware-wallet level but is not packaged into an institutional policy and attestation product.
- **Indicative vendor matrix (synthesis; rows marked * rely partly on PRIOR KNOWLEDGE):**

| Vendor | Core arch | Primary buyers | BTC native multisig | Notable |
|---|---|---|---|---|
| Coinbase Custody/Prime | MPC + cold storage (HSM)* | ETF issuers, institutions | No (custodial)* | $376B AUC; OCC conditional |
| BitGo | Multisig + TSS | Exchanges, institutions, WaaS | Yes (2-of-3; Taproot/MuSig2 per 3rd party) | NYSE: BTGO |
| Anchorage | HSM-based + biometric approvals* | Institutions, stablecoin issuers | No* | OCC bank; $4.2B val. |
| Fidelity Digital Assets | Cold storage, in-house* | Institutions, Fidelity ETFs* | No* | No 2026 data found |
| Fireblocks | MPC-CMP + SGX policy engine | Exchanges, banks, PSPs, fintech | No (MPC) | Visa rumor Oct 2026 |
| Ripple Custody (Metaco)+Palisade | HSM-based orchestration + MPC WaaS | Banks (BBVA, SocGen, Absa) | Unclear | — |
| Zodia (→ StanChart) | — | Institutions in Asia/ME/EU | Unclear | Being absorbed |
| Copper | MPC* + ClearLoop | Funds, prime/settlement | No* | For sale ~$500M |
| Dfns / Fordefi / Utila / Turnkey / Cobo | MPC/TSS or TEE | Fintechs, funds, Web3 | No | Funding below |
| Unchained / Casa / Nunchuk / Bitkey / Onramp / AnchorWatch | Native BTC multisig | HNWIs, family offices, SMB treasuries | Yes | AnchorWatch = Miniscript + Lloyd's |

### Gaps
- No session sources for Fidelity Digital Assets, Komainu, Hex Trust, Taurus, Liminal, Nunchuk, Lit Protocol, Cordial Systems, Blockdaemon/Sepior, or the HSM vendors (Thales, Entrust, Securosys, Utimaco, AWS CloudHSM). **[PRIOR KNOWLEDGE – NOT RE-VERIFIED]:**
  - **Komainu:** Nomura/CoinShares/Ledger JV; in 2025 it took investment from Blockstream.
  - **Hex Trust:** Hong Kong custodian; Hex Safe platform.
  - **Taurus:** Swiss; Deutsche Bank and State Street partner; HSM/MPC "Taurus-PROTECT."
  - **Liminal:** India/Singapore; was the WazirX wallet provider in the July 2024 ~$230M WazirX hack.
  - **Cordial Systems:** "Cordial Treasury," self-hosted, non-MPC, emphasizing on-prem deployment.
  - **Blockdaemon:** acquired Sepior (MPC) in 2022.
  - **HSMs:** Securosys and Utimaco HSMs are widely used by Swiss/EU banks for crypto keys; AWS CloudHSM supports secp256k1.
- BitGo's own documentation on Taproot, MuSig2 and Miniscript was not fetched.
- Coinbase's and Anchorage's exact key architecture was not verified in-session.
- Coinbase/Fireblocks transaction-simulation features beyond the Fireblocks Policy Inspector were not researched.

## 2. Signer-device integrity, signing-ceremony audit logs, post-incident forensics

### Takeaway
Vendors publish audit-log exports and SIEM hooks. None was found to publicly document a tamper-evident, independently verifiable record that cryptographically binds each approval to a specific attested device, user, IP and location, together with what the signer's screen actually displayed. Bybit showed that this missing "what was displayed vs. what was signed" evidence is the critical forensic gap.

### Cited Findings
- **Fireblocks audit log, access and retention:** Owners, Admins and Non-Signing Admins can view and export workspace events. Events do not expire.
- **Fireblocks audit log, contents and integration:** categories include IP-allowlist changes and approval steps (by quorum or by user). There are API endpoints for SIEM integration. — [Fireblocks support](https://support.fireblocks.io/hc/en-us/articles/360015646820)
- **Fireblocks, what is not documented:** the searches found no Fireblocks documentation confirming device-IP capture per approval or formally immutable or tamper-evident approval logs. Third-party claims of "granular, real-time audit logs (approver IDs, policy checks)" for Fireblocks and Copper come from a marketing-oriented comparison page. — [Chainscore comparison](https://www.chainscorelabs.com/comparisons/custody-mpc-vs-multisig-vs-hardware/compliance-and-audit-integration/hardware-wallet-providers-vs-mpc-providers-for-audit-log-exports)
- **Fireblocks Policy Inspector cannot replay history:** it evaluates against the *current* policy, so "if the policy was modified since the transaction took place, the simulation result may differ from the actual historical outcome." It cannot reconstruct which policy version authorized a past transaction. — [Fireblocks support](https://support.fireblocks.io/hc/en-us/articles/29211960021020-Policy-inspector-Transparent-transaction-diagnostics)
- **Bybit, how the attack worked:** the Safe{Wallet} interface "displayed legitimate transaction details to Bybit signers while malicious data was being signed and executed in the background." — [Sygnia case study](https://www.sygnia.co/case-study/bybit-heist-case-study/)
- **Bybit, the forensic contest:** Safe stated its frontend, source code and contracts were not compromised. Sygnia found malicious JS served from Safe's AWS S3 bucket. Earlier, Sygnia noted that Safe's Mandiant findings had not been independently confirmed by forensic investigation of Safe's infrastructure. The forensic record was contested and split across two companies' environments. — [Sygnia blog](https://www.sygnia.co/blog/sygnia-investigation-bybit-hack/); [The Block](https://www.theblock.co/post/343530/lazarus-appears-to-compromise-safe-developer-machine-in-lead-up-to-1-5-billion-bybit-hack-report)
- **Bybit, root-cause framings differ:** Ledger blames blind signing and a contract change invisible on the hardware device. A separate Ledger piece says the software interface was hijacked. — [Ledger blog](https://www.ledger.com/blog-why-your-treasury-needs-clear-signing); [Unchained (crypto media)](https://unchainedcrypto.com/ethereum-foundation-launches-clear-signing-standard-to-end-blind-signing-exploits/)
- **MPC theft may go undetected:** Fireblocks itself noted that key-extraction theft via BitForge "would be impossible to know until they move funds." Key compromise in MPC can be silent, with no on-chain or log signal until funds move. — [Blockworks](https://blockworks.co/news/crypto-wallets-patch-zero-day-vulnerabilities-to-safeguard-user-funds)
- **Enclave-anchored integrity:** Fireblocks anchors policy integrity in an Intel SGX enclave with quorum-signed rules (vendor claim). — [Fireblocks support](https://support.fireblocks.io/hc/en-us/articles/27117127096604-Policy-inspector-Transparent-transaction-diagnostics)
- **Turnkey's approach:** it is investing in "Verifiable Cloud" (secure compute), signaling that verifiability of signing infrastructure is an emerging vendor theme. — [CoinDesk](https://www.coindesk.com/business/2026/05/06/turnkey-raises-usd12-5-million-in-round-backed-by-circle-ventures-and-sequoia-capital)

### Inferences
- **Logs live with the vendor:** the customer can only prove "user X approved in the vendor UI at time T from IP Y" to the extent the vendor logs it. The logs sit in the vendor's database and are not hash-chained or anchored to an external timestamp, so the customer cannot independently verify them. In a dispute like Bybit vs. Safe, the party holding the logs is a potential defendant.
- **No WYSIWYS attestation:** no vendor found offers a signed record of "what the signer saw" (a display hash or rendered intent) alongside the signed payload hash, attested by the signing device. This is the specific evidence that would have shown the Bybit display/payload mismatch instantly.
- **Device integrity is not evidenced per approval:** device integrity (mobile app attestation, hardware-device firmware state, workstation EDR state) is not reported as part of the approval record anywhere in the sources found. That makes the approver's workstation, which was the Safe developer's macOS machine in Bybit, a blind spot.
- **White-space concept:** a vendor-neutral, append-only, externally anchored "signing ceremony ledger." It would capture approver identity, device attestation, IP/geolocation, displayed intent, payload hash and policy version for each approval. It could work across Fireblocks, Safe, BitGo and hardware wallets.

### Gaps
- BitGo, Anchorage, Coinbase and Copper audit-log specifications (fields, retention, immutability, export format) were not researched in-session.
- No vendor SOC 2 / ISAE 3402 report contents are public. Whether logs are WORM-stored is unknown.
- Whether Safe{Wallet} has since added signed frontend builds or reproducible-build attestation was not verified. **[PRIOR KNOWLEDGE – NOT RE-VERIFIED]:** Safe announced security improvements post-Bybit, including transaction-hash verification and partnerships with transaction-simulation vendors.

## 3. Known incidents and criticisms

### Takeaway
The largest custody-adjacent losses came from compromised *software supply chain or UI* (Safe{Wallet} → Bybit, ~$1.4–1.5B). Earlier events were cryptographic implementation flaws (BitForge) and a vendor business failure (Qredo). In none of these was the root cause an attacker breaking well-implemented cryptography.

### Cited Findings
- **Bybit (Feb 21, 2025), initial access:** Lazarus compromised a Safe{Wallet} developer's macOS workstation via social engineering on Feb 4, 2025, using the MythicC2 Poseidon agent.
- **Bybit, the payload:** malicious JS targeting Bybit's Ethereum multisig cold wallet was injected into Safe's frontend on AWS S3 on Feb 19. No compromise of Bybit's own infrastructure was found.
- **Bybit, the loss:** ~$1.4–1.5B. — [Sygnia case study](https://www.sygnia.co/case-study/bybit-heist-case-study/); [Elastic Security Labs](https://www.elastic.co/security-labs/threat-command/bit-bybit); [BleepingComputer](https://www.bleepingcomputer.com/news/security/lazarus-hacked-bybit-via-breached-safe-wallet-developer-machine/); [DL News](https://www.dlnews.com/articles/defi/safe-wallet-compromise-behind-bybit-hack/)
- **BitForge (disclosed Aug 2023 by Fireblocks), the flaws:** zero-days in GG18, GG20 and Lindell17 MPC implementations allowed full key extraction from a single compromised device (CVE-2023-33241 for GG18/20).
- **BitForge, who was affected:** Coinbase WaaS, Zengo and Binance's open-source TSS library were named; Fireblocks counted 16 affected providers and libraries.
- **BitForge, Fireblocks' position:** Fireblocks says its MPC-CMP is unaffected. Fireblocks runs a public BitForge Status Checker, and some vendors were still "Pending." — [Fireblocks press](https://www.fireblocks.com/press/fireblocks-researchers-uncover-vulnerabilities-impacting-dozens-of-major-wallet-providers); [The Record](https://therecord.media/multiple-vulnerabilities-affecting-crypto-platform-bitforge); [Fireblocks BitForge checker](https://fireblocks.com/BitForge)
- **Qredo (Feb 2024):** after a partial acquisition of "substantial" assets by Dan Tapiero's 10T Holdings and 1RoundTable Partners, the remainder of Qredo entered UK administration with 44 further layoffs. — [The Block](https://www.theblock.co/post/275779/crypto-qredo-administration-acquisition-10t-1rt)
- **Qredo afterwards:** Tapiero later described restructuring Qredo into **Zenrock**. — [CB Insights](https://www.cbinsights.com/company/qredo/financials)
- **Copper:** exited enterprise custody (2023) and abandoned IPO plans; reported for sale in 2026. — [CoinDesk](https://www.coindesk.com/business/2026/05/20/crypto-custody-firm-copper-is-looking-to-sale-the-company-for-usd500-million)
- **Zodia leadership change:** CEO Julian Sawyer stepped down Sept 2026; former CRO Richard Clark took over ahead of the StanChart absorption. — [The Block](https://www.theblock.co/news/business/2026-10-21-standard-chartered-signs-definitive-agreements-to-acquire-zodia-custody-421535)

### Inferences
- **Common-mode risk:** Bybit demonstrates single-vendor common-mode risk. Every Safe{Wallet} UI user was exposed to the same S3-hosted JS. Multisig on-chain did not help because all signers used the same compromised front end. The same pattern applies to any MPC platform where all co-signers run the same vendor app.
- **MPC is opaque:** BitForge shows MPC protocol risk is opaque to customers. They cannot independently verify which protocol version their vendor runs, and theft may be silent.

### Gaps
- **TSSHOCK** (Verichains, Black Hat Aug 2023, GG18/GG20 implementation flaws) did not surface in searches. **[PRIOR KNOWLEDGE – NOT RE-VERIFIED]**
- **Other incidents not verified in-session [PRIOR KNOWLEDGE – NOT RE-VERIFIED]:**
  - WazirX/Liminal (July 2024, ~$230M; Liminal disputed blame).
  - DMM Bitcoin (May 2024, ~$305M; linked to Ginco wallet-software compromise).
  - Radiant Capital (Oct 2024, Safe multisig plus device malware).
  - Coinbase customer-data insider breach (May 2025).
  - Any 2025–2026 MPC CVEs.
- Qredo customer-asset outcome (returned / transferred / lost) is not found in sources.

## 4. Market consolidation and M&A, 2023–2026

### Takeaway
Consolidation accelerated in 2025–2026:
- Ripple is building a bank-custody stack.
- Fireblocks is moving downstream to consumer wallets and is the subject of a denied Visa acquisition report (Oct 2026).
- Banks are internalizing custody (StanChart–Zodia).
- Weaker players are being sold (Copper).
- Analytics firms are buying runtime-security tools (Chainalysis–Hexagate).
- BitGo went public in Jan 2026.

### Cited Findings
- **Ripple–Palisade (Nov 2025):** terms undisclosed. It was Ripple's fourth acquisition of 2025 (after Hidden Road, Rail and GTreasury), and Ripple says it has invested ~$4B into the ecosystem. — [The Block](https://www.theblock.co/post/377368/ripples-crypto-investments-hit-4-billion-with-acquisition-of-wallet-tech-firm-palisade); [FinTech Futures](https://www.fintechfutures.com/m-a/ripple-bolsters-institutional-custody-capabilities-with-palisade-acquisition)
- **Fireblocks–Dynamic (announced Oct 23, 2025):** ~$90M. Dynamic had raised ~$21M from a16z and Founders Fund; ~30 employees joined. — [The Block](https://www.theblock.co/post/375939/fireblocks-crypto-authentication-dynamic-web3); [Dealroom](https://ai-startups.dealroom.co/news/feed/fireblocks-acquires-dynamic-for-90m)
- **Visa–Fireblocks report (Oct 22, 2026):** Axios reported Visa in late-stage talks to buy Fireblocks for ~$2.5B, ~69% below its $8B 2022 valuation. Fireblocks told The Block "at this time, it is not true"; Visa declined comment. **Unconfirmed / disputed.** — [crypto.news](https://crypto.news/visa-fireblocks-acquisition-talks-2-5-billion/); [Crypto Briefing](https://cryptobriefing.com/visa-talks-acquire-fireblocks-crypto-custody/)
- **Standard Chartered–Zodia Custody:**
  - Non-binding offer in May 2026; definitive agreements signed Oct 21, 2026. Completion is pending regulatory approval and terms are undisclosed.
  - Custody operations move into StanChart Securities Services.
  - The software and professional-services business spins out to "Zodia Solutions" under SC Ventures, backed by NAB Ventures, Northern Trust and SBI Ventures. — [The Block](https://www.theblock.co/news/business/2026-10-21-standard-chartered-signs-definitive-agreements-to-acquire-zodia-custody-421535); [Crowdfund Insider](https://www.crowdfundinsider.com/2026/10/319913-standard-chartered-advances-full-acquisition-of-zodia-custody-with-definitive-agreements/)
- **Copper sale process (May 2026):** exploring a sale at ~$500M with Cantor Fitzgerald advising. No buyer was reported as of the latest coverage found (May 2026). **Possibly stale.** — [CoinDesk](https://www.coindesk.com/business/2026/05/20/crypto-custody-firm-copper-is-looking-to-sale-the-company-for-usd500-million)
- **Chainalysis–Hexagate (Dec 2024):** ~$60M per Calcalist estimate. Hexagate is a real-time Web3 threat-prevention firm whose clients include Coinbase and Consensys. — [Calcalist](https://www.calcalistech.com/ctechnews/article/skfy4vehye); [Finovate](https://finovate.com/chainalysis-acquires-web3-security-company-hexagate/)
- **Qredo → 10T/1RT partial acquisition plus administration (Feb 2024).** — [The Block](https://www.theblock.co/post/275779/crypto-qredo-administration-acquisition-10t-1rt)
- **BitGo IPO:** NYSE: BTGO, Jan 2026 (see §5). — [SiliconANGLE](https://siliconangle.com/2026/01/21/bitgo-prices-ipo-above-range-ahead-stock-market-debut-seeking-2b-valuation/)

### Inferences
- **The middle is being squeezed:** stand-alone custodians without a bank charter or a distribution partner are under pressure (Copper sale, Zodia absorbed). Software layers are being separated from regulated custody (Zodia Solutions spin-out). This creates room for neutral security and verification tooling that is not owned by a custodian.

### Gaps
- **Earlier deals not verified in-session [PRIOR KNOWLEDGE – NOT RE-VERIFIED]:**
  - Ripple–Metaco (~$250M, May 2023); Metaco was rebranded Ripple Custody.
  - Ripple–Standard Custody & Trust (2024).
  - Coinbase–Deribit (~$2.9B, 2025) and other 2025 Coinbase deals (e.g., Liquifi, Echo). No custody-specific Coinbase acquisition was confirmed.
  - Fireblocks–BlockFence (2024).
  - Blockdaemon–Sepior (2022).
  - Any Ledger IPO plans.
- Final status of the Copper sale after May 2026 is unknown.

## 5. Funding, valuation, revenue

### Takeaway
- BitGo is the only public pure-play: ~$2.1–2.2B IPO valuation, tens of millions in net revenue, and widening losses.
- Anchorage is the most valuable private custodian disclosed in this session ($4.2B).
- Fireblocks' $8B (2022) mark looks badly stale against a reported $2.5B Visa price.
- The software challengers (Dfns, Utila, Fordefi, Turnkey) are small: $10–65M raised each.

### Cited Findings
- **BitGo IPO (NYSE: BTGO, Jan 2026):** priced at $18, above range. Sold 11.8M shares raising ~$213M at a ~$2.08–2.2B valuation. Goldman and Citi led. — [SiliconANGLE](https://siliconangle.com/2026/01/21/bitgo-prices-ipo-above-range-ahead-stock-market-debut-seeking-2b-valuation/); [Cointelegraph](https://cointelegraph.com/news/bitgo-ipo-price-18-shares-begin-trading-nyse-thursday); [Coin360](https://coin360.com/news/bitgo-ipo-raises-213m-nyse-valuation-2-2b)
- **BitGo 2025 revenue:** gross revenue ~$16.09B (Wikipedia: $16.152B), inflated by gross trade value. Digital-asset sales net of costs was just $34.7M. — [SiliconANGLE](https://siliconangle.com/2026/01/21/bitgo-prices-ipo-above-range-ahead-stock-market-debut-seeking-2b-valuation/); [Wikipedia](https://en.wikipedia.org/wiki/BitGo)
- **BitGo Q1 2026:** gross revenue $3.77B, of which $3.66B is digital-asset sales. Net loss widened to $60.7M. — [StockTitan 10-Q summary](https://www.stocktitan.net/sec-filings/BTGO/10-q-bitgo-holdings-inc-quarterly-earnings-report-4dea60cb6669.html)
- **BitGo target:** $400M revenue by 2028; the basis (gross or net) is unclear. — [Phemex](https://phemex.com/news/article/bitgo-completes-ipo-projects-400m-revenue-by-2028-55666)
- **Anchorage:** Tether invested $100M at a $4.2B valuation (Feb 5, 2026). No new primary capital otherwise; it ran an employee tender at the same price. Previous round: $3B (2021 Series D, $350M led by KKR). — [The Block](https://www.theblock.co/news/deals/2026-02-05-tether-deepens-ties-with-anchorage-digital-through-100m-equity-investment-at-4-2b-valuation-388639); [FF News](https://ffnews.com/news/anchorage-digital-lands-100m-tether-investment-at-4-2bn-valuation)
- **Fireblocks:** $8B valuation after a $550M Series E (Jan 2022). Reported Visa talks at ~$2.5B (denied). — [crypto.news](https://crypto.news/visa-fireblocks-acquisition-talks-2-5-billion/)
- **Copper:** seeking ~$500M valuation in a sale (May 2026). — [CoinDesk](https://www.coindesk.com/business/2026/05/20/crypto-custody-firm-copper-is-looking-to-sale-the-company-for-usd500-million)
- **Turnkey:**
  - $30M Series B (June 2025, led by Bain Capital Crypto; with Sequoia, Galaxy, Lightspeed Faction, Variant and Wintermute). — [FinTech Futures](https://www.fintechfutures.com/venture-capital-funding/turnkey-raises-30m-series-b)
  - $12.5M strategic round (May 2026; Archetype, Circle Ventures), bringing the total above $65M. — [CoinDesk](https://www.coindesk.com/business/2026/05/06/turnkey-raises-usd12-5-million-in-round-backed-by-circle-ventures-and-sequoia-capital)
- **Dfns:** $16M Series A (Jan 2025, led by Further Ventures) on top of a $13M seed (2022). — [Pulse 2.0](https://pulse2.com/dfns-16-million-series-a-raised-for-expanding-crypto-wallet-infrastructure/); [Dfns](https://dfns.co/article/dfns-secures-series-a-funding)
- **Utila:** $18M Series A (Mar 2025, led by Nyca; with Wing VC and NFX). Total ~$30–35M; sources differ. — [CoinDesk](https://www.coindesk.com/business/2025/03/19/crypto-wallet-provider-utila-raises-usd18m-as-institutional-demand-for-digital-asset-management-soars); [SiliconANGLE](https://siliconangle.com/2025/03/19/utila-raises-18m-meet-demand-institutional-digital-asset-mpc-wallets/)
- **Fordefi:** $10M seed extension (Feb 2024; Electric Capital, Paxos, Alchemy). No 2025–26 round found. — [CoinDesk](https://www.coindesk.com/business/2024/02/13/fordefi-raises-10m-to-make-crypto-safer-with-institutional-grade-wallet-to-retail-facing-platforms)
- **AnchorWatch:** seed led by Ten31 (amount and date not found). — [Bitcoin Insurance 2026](https://www.bitcoinproducts.com/blog/bitcoin-insurance-2026)

### Inferences
- **Fireblocks:** if the ~$2.5B Visa figure is accurate, MPC-platform multiples have compressed sharply since 2022. The "wallet infrastructure" category is commoditizing, so differentiated security and verification is where pricing power may remain.
- **BitGo:** net revenue tens of millions versus a ~$2B market cap. The market prices custody on future stablecoin and treasury flows, not current fees.

### Gaps
- No 2025–2026 funding data was found for: Fordefi, Cordial Systems, Casa, Unchained, Onramp, Nunchuk, Liminal, Cobo, Hex Trust, Komainu, Taurus, Ledger, or Fidelity Digital Assets.
- **[PRIOR KNOWLEDGE – NOT RE-VERIFIED]:**
  - Ledger was reported in 2025 to be considering a US IPO or raise at a multi-billion valuation.
  - Taurus raised a $65M Series B in 2023 led by Deutsche Bank.
  - Bitkey is not separately funded; it is part of Block.
- Fireblocks revenue is not public.

## 6. Pricing

### Takeaway
Custody is priced in AUC basis points with tiered step-downs and monthly minimums for qualified custodians, roughly 15–50 bps. MPC software vendors sell custom SaaS contracts, and few publish rate cards. Public pricing data is scarce and mostly second-hand.

### Cited Findings
- **Coinbase Custody:** reportedly 50 bps annualized with a $500K minimum balance and up to a $10K implementation fee. Large Prime contracts are negotiated separately. — [WalletInvestor review](https://walletinvestor.com/news/finance-news/coinbase-prime-review-the-benchmark-for-institutional-crypto-execution-and-custody/)
- **Anchorage:** SEC-filed custody agreements reportedly show 30 bps below $10M AUC, stepping down to 15 bps at $500M+, with a $3,000/month minimum. Fees are billed monthly at 1/12 of the annual rate. — [rfp.wiki](https://www.rfp.wiki/crypto/custody-security/institutional-custody-services/kraken-institutional/anchorage-digital)
- **Who publishes fees:** BNY, State Street, Anchorage and Fidelity do not publish fees, and large clients negotiate. Ripple's Standard Custody does not disclose fees or minimums. — [Hashlock](https://hashlock.com/blog/top-institutional-crypto-custody-providers-2026); [rfp.wiki](https://www.rfp.wiki/crypto/custody-security/institutional-custody-services/coinbase-custody/standard-custody)
- **Gemini:** publishes 0.4% or $30/month per asset, whichever is higher. — [21rates](https://21rates.com/custody)
- **General range:** one aggregator cites 4–150 bps annually depending on provider and AUM. — [21rates](https://21rates.com/custody)

### Inferences
- **AUC pricing penalizes BTC-heavy holders:** a Bitcoin treasury company holding $500M in BTC pays roughly $0.75–2.5M/yr at 15–50 bps for custody that is largely static cold storage. That gives a strong incentive to self-custody with a software or security overlay at flat SaaS pricing. This is a white-space wedge.

### Gaps
- No primary-source pricing was found for BitGo, Fireblocks (SaaS tiers), Dfns, Fordefi, Utila, Turnkey, Ledger Enterprise, Casa, Unchained, Onramp or AnchorWatch.
- **[PRIOR KNOWLEDGE – NOT RE-VERIFIED]:**
  - Fireblocks contracts are commonly reported at low-six to seven figures/yr plus transaction-volume components.
  - Casa publishes consumer tiers (~$250–$2,100/yr historically).
  - Unchained charges annual vault fees plus higher Private Client tiers.
  - AnchorWatch charges an insurance premium as a % of BTC insured.
  - All of these should be verified on vendor pricing pages.
- One aggregator's claim of "0.10–0.25 bps for a $1B account" looked implausible and was excluded.

## 7. Gaps and white space

### Takeaway
The clearest white space is:
1. **Independent, vendor-neutral signing forensics:** tamper-evident approval records with device attestation and "what the signer saw" evidence.
2. **Bitcoin-native institutional policy:** Miniscript/Taproot policy tooling with enterprise approvals for treasury companies, miners and family offices, between consumer-grade collaborative custody and EVM-centric MPC platforms.
3. **Common-mode-risk reduction:** independent second-channel transaction verification across vendors.
4. **Underserved geographies and mid-market exchanges** that cannot afford Fireblocks-tier contracts or AUC fees.

### Cited Findings
- **Single point of failure:** Bybit's own infrastructure was not compromised. A third-party wallet UI was, which Elastic summarizes as "Safe{Wallet} was the sole point of failure." — [Elastic Security Labs](https://www.elastic.co/security-labs/threat-command/bit-bybit); [Sygnia](https://www.sygnia.co/case-study/bybit-heist-case-study/)
- **No historical replay:** Fireblocks' simulation tool cannot replay historical policy state and supports only TRANSFER types. — [Fireblocks support](https://support.fireblocks.io/hc/en-us/articles/29211960021020-Policy-inspector-Transparent-transaction-diagnostics)
- **Clear signing is Ethereum-centric:** ERC-7730 is now under Ethereum Foundation stewardship, and the cited sources address no Bitcoin equivalent. — [Ledger](https://www.ledger.com/blog-ledger-clear-signing-ethereum-foundation)
- **Bitcoin collaborative custody is still legacy:** Casa and Unchained still use P2WSH (not Taproot) as of mid-2026. Only AnchorWatch is cited as Miniscript-based. — [Bitcoin Insurance 2026](https://www.bitcoinproducts.com/blog/bitcoin-insurance-2026)
- **Taproot adoption:** adoption for complex scripts remains minimal. — [Spark research](https://www.spark.money/research/bitcoin-mpc-vs-multisig-custody)
- **Runtime threat detection is being absorbed:** it is being folded into analytics incumbents (Chainalysis–Hexagate), primarily EVM-focused. — [Finovate](https://finovate.com/chainalysis-acquires-web3-security-company-hexagate/)
- **Vendor-stability risk:** Qredo administration; Copper exiting custody and for sale; Zodia leadership change and absorption. Customers face migration risk when vendors fail or are acquired. — [The Block](https://www.theblock.co/post/275779/crypto-qredo-administration-acquisition-10t-1rt); [CoinDesk](https://www.coindesk.com/business/2026/05/20/crypto-custody-firm-copper-is-looking-to-sale-the-company-for-usd500-million)
- **Concentration:** Coinbase alone holds ~13% of crypto market cap in custody. — [Forbes](https://www.forbes.com/sites/jasonbrett/2026/04/08/coinbase-wins-occ-nod-for-376-billion-institutional-custody-empire/)

### Inferences
- **Segments poorly served (synthesis):**
  - **Bitcoin treasury companies and miners:** they need enterprise approvals, SOC-ready audit trails and accounting exports on native BTC multisig. Today's choices are consumer-grade collaborative custody or MPC/qualified custodians charging AUC bps.
  - **Mid-size and emerging-market exchanges** (LatAm, Africa, South/Southeast Asia, Canada): they are priced out of Fireblocks/BitGo-tier contracts and have the greatest exposure to Lazarus-style social engineering, as with WazirX/Liminal and DMM [prior knowledge].
  - **Family offices:** served by Casa, Unchained and Onramp for BTC, but these lack multi-asset coverage and institutional forensic tooling.
  - **Canadian and Asian firms:** Zodia's exit to StanChart and Copper's sale reduce the independent options in Asia. No Canadian-specific vendor surfaced in searches (gap).
- **Vendor lock-in:** MPC key shares are vendor-protocol-specific (e.g., MPC-CMP). Migrating means moving funds to new addresses. Native multisig with standard descriptors/PSBT is portable.
- **Missing products (white-space list):**
  - (a) Cryptographic, append-only, externally anchored approval logs (hash-chained, timestamped, optionally on-chain anchored) that customers hold independently of the custody vendor.
  - (b) Per-approval device attestation (firmware version, secure-element attestation, mobile app integrity, workstation EDR posture) bound into the record.
  - (c) An independent "second-screen" verifier that decodes the payload on a separate trusted device and code base, with recorded display hashes. This is the direct Bybit counter.
  - (d) Policy-version snapshots so incidents can be replayed against the policy in force at that time.
  - (e) Bitcoin-specific clear signing and Miniscript policy visualization for institutions.
  - (f) Multi-vendor diversity: N-of-M across *different* vendors' stacks (e.g., one Ledger, one BitGo key, one in-house HSM) to remove common-mode failure.
  - (g) Incident-response packaging (chain tracing plus device forensics plus approval logs) for small exchanges that lack a Sygnia/Mandiant retainer.

### Gaps
- No market-sizing data was found by segment (number of BTC treasury companies, miners or mid-size exchanges, or their security spend).
- No independent analyst reports (Galaxy, Messari) on custody market share were retrieved in-session.
- No evidence was found either way on whether any vendor already offers externally anchored or hash-chained approval logs. A focused check of BitGo, Anchorage, Cordial, Taurus and Ripple Custody documentation is recommended before asserting the gap is fully unoccupied.
- HSM vendors (Thales, Entrust, Securosys, Utimaco, AWS CloudHSM): no in-session research. Their crypto-specific features (secp256k1/EdDSA support, BIP32 derivation, signed audit logs) need verification. **[PRIOR KNOWLEDGE – NOT RE-VERIFIED]:** Securosys markets crypto-specific HSM features (Primus with secp256k1, BIP32), and HSMs typically have signed or tamper-evident internal audit logs, which is a potential building block for (a).

# Attackers now steal signatures, not keys

The largest crypto thefts of 2023 through October 2026 were not caused by broken cryptography. Attackers took over the machinery that decides *what gets signed*. They usually got in through one engineer's or vendor's laptop, then had either a legitimate signer or an automated hot-wallet service approve a malicious transaction. The two largest thefts on record and the largest pure-Bitcoin theft of the period all follow this pattern, and all three are attributed to North Korea's TraderTraitor unit: **Binance on 29 October 2026 (~$6.3–6.43B, preliminary)**, **Bybit in February 2025 (~$1.5B)** and **DMM Bitcoin in May 2024 (4,502.9 BTC, ~$305M)**. Today's vendors protect keys well. Custodians, MPC platforms and hardware security modules do that job, and analytics firms trace stolen coins after the fact. Nobody independently protects or records the short gap between "someone asked for a transaction" and "a key signed it." That gap is why victims and their vendors still argue in public about *who, where, when and how* a breach happened, sometimes for years. The opportunity for an Ontario founder is a **vendor-neutral "signing flight recorder and veto"**. It would independently check every transaction before signature, enforce limits that a compromised insider cannot override, and keep a tamper-evident record built to the standard regulators, insurers and courts need. It would be Bitcoin-native in depth but work across chains. The right first customers are mid-tier regulated exchanges and custodians: Canadian CIRO dealers first, then about 380 EU MiCA-licensed firms. These firms run hot wallets, face incident-reporting deadlines measured in hours, and cannot afford tier-1 security teams. On the evidence available, the serviceable market is in the tens of millions to low hundreds of millions of dollars a year, not the multi-billion figures market-research firms quote. That supports a strong company and a likely acquisition outcome. Building a category-defining giant would require expanding beyond this first market. The biggest risk is that the product itself becomes the next attack path. Bitget's September 2026 loss was blamed on a third-party security product, so the design must ensure the product can only ever say "no."

## Nine-figure thefts now start on an engineer's laptop

### The same four-step pattern behind most of the money

The best-documented large losses follow a repeatable sequence:

1. **The attacker compromises a person's computer.** Typical lures are a fake recruiter, a malicious "coding test" or a booby-trapped software project.
2. **The attacker steals that person's logged-in sessions or cloud credentials.** This gets around passwords and two-factor codes.
3. **The attacker tampers with the system that builds or approves transactions.**
4. **A real signer or signing machine then signs a malicious payload it believes is routine.**

The industry statistic "private-key compromise" (43.8% of stolen value in 2024 per Chainalysis) is really a symptom label. In the clearest cases the key never left its secure hardware. The attacker controlled what that hardware was asked to sign ([Security Boulevard summarising Chainalysis](https://securityboulevard.com/2024/12/north-korean-hackers-stole-1-34-billion-in-crypto-in-2024)).

**Binance (29 Oct 2026, preliminary, figures still moving).** Estimates of the loss range from **$6.3B (Binance) to $6.36B (TRM), ~$6.4B (Chainalysis) and $6.43B (Elliptic)**. TRM says most of it left hot wallets across **ten blockchains in about 20 minutes**, which is more than $300M a minute ([TRM Labs](https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history); [Elliptic](https://www.elliptic.co/insights/binance-largest-hack-in-history/)). (A hot wallet is one whose keys are online so withdrawals can be automated.)

- **How it started.** Binance's preliminary account is that a compromised DevOps engineer's laptop gave a path to a service that could submit withdrawals, with no evidence a private key leaked ([Forbes](https://www.forbes.com/sites/digital-assets/2026/10/30/binances-63-billion-hack-started-with-one-engineers-laptop/)).
- **The account is already changing.** CEO Richard Teng has since said the attack was "more complex" ([The Hacker News](https://thehackernews.com/2026/10/binance-suffers-security-breach.html)). Reports say the attackers staged for at least 36 hours ([CNBC](https://www.cnbc.com/2026/10/30/binance-hack-stolen-crypto-recovery.html)).
- **What happened on Ethereum.** Blockaid traced that side of the theft to 50 "EIP-7702" authorizations. EIP-7702 is a feature that lets an ordinary Ethereum account delegate control to code. One report says the delegation turned the "Binance 14" hot wallet into a sweeper that emptied **167,464 ETH and 1.615B USDT in under four minutes**. That detail comes from a single report and should be treated as provisional ([crypto.news](https://crypto.news/binance-hack-eip-7702-wallet-attack/)).
- **Who did it.** TRM attributes the attack to TraderTraitor with high confidence. Chainalysis does too, because it watched the proceeds mix in real time with the September Bitget loot. Elliptic says attribution is "not yet certain" ([NPR](https://www.npr.org/2026/10/30/g-s1-150902/blockchain-intelligence-firms-link-north-korea-to-6-3b-hack-on-binance); [Chainalysis](https://www.chainalysis.com/blog/binance-exploit-latest-findings-and-response/)).
- **Recovery.** About **$3B is frozen**, mostly because Tether and Circle could freeze their stablecoins. Binance has set aside **$6.34B** to cover users ([CNBC](https://www.cnbc.com/2026/10/30/billions-in-crypto-frozen-in-binance-hack-heres-what-happens-next-.html); [CoinDesk](https://www.coindesk.com/business/2026/10/30/binance-arranges-usd6-34-billion-to-cover-losses-from-record-crypto-hack)).

**Bybit (Feb 2025).** This is the most fully reconstructed case.

- **Initial access.** On 4 February a developer at Safe{Wallet}, the multisig software vendor Bybit used, had their Mac compromised through social engineering.
- **Cloud access.** The attackers hijacked the developer's live Amazon Web Services session tokens. That got around multi-factor authentication even though Safe forced re-login every 12 hours.
- **The trap.** They planted malicious JavaScript in Safe's web interface that targeted only Bybit.
- **The theft.** On 21 February Bybit's signers approved what looked like a routine cold-to-warm transfer. It actually handed control of the wallet to the attacker. The attacker then wiped the malicious code ([Cointelegraph – Safe post-mortem](https://cointelegraph.com/news/safe-wallet-releases-bybit-hack-post-mortem); [Elastic Security Labs](https://www.elastic.co/security-labs/bit-bybit)).

Sygnia's summary is the sentence a founder should keep in mind: the interface "displayed legitimate transaction details to Bybit signers while malicious data was being signed and executed in the background" ([Sygnia](https://www.sygnia.co/case-study/bybit-heist-case-study/)).

**DMM Bitcoin (May 2024).** This was the largest pure-Bitcoin institutional theft of the period.

- **Initial access.** It began with a fake LinkedIn recruiter sending an employee of **Ginco**, DMM's wallet-software vendor, a malicious "pre-employment test."
- **Session theft.** About two months later, stolen session cookies let attackers impersonate that employee inside Ginco's communications system.
- **The theft.** They altered a legitimate transaction request so 4,502.9 BTC went to their wallets.
- **Aftermath.** DMM shut down. US and Japanese authorities did not formally attribute the attack until about seven months later ([BleepingComputer](https://www.bleepingcomputer.com/news/security/fbi-links-north-korean-hackers-to-308-million-crypto-heist); [The Record](https://therecord.media/fbi-largest-crypto-hack-2024-tradertraitor)).

### Five attack shapes a product has to cover

The incident record sorts into five distinct mechanisms. Each needs a different control, so a product built for only one will miss most of the money.

| Attack shape | Plain-English description | Representative incidents | Control that would have changed the outcome |
|---|---|---|---|
| Human signing ceremony subverted | People approve a transaction that was altered or misrepresented on their screen | Bybit 2025 (~$1.5B); DMM 2024 (~$305M); WazirX 2024 (~$230M, cause disputed) | Independent second-device decoding of the actual payload, plus a record of what each signer saw |
| Automated hot-wallet pipeline abused | Attacker reaches the service that submits withdrawals, so signing happens automatically | Binance 2026 (~$6.3B); Bitget 2026 (~$387.5M, vector disputed); Phemex, BtcTurk, Upbit, CoinEx, Stake | Velocity and destination limits enforced by an independent co-signer that the compromised channel cannot override |
| Admin or governance takeover | Social engineering and pre-signed transactions move administrative authority | Drift 2026 (~$285M, drained in ~12 minutes) | Hard blocks on authority transfers and on pre-signed or long-lived transactions |
| Infrastructure poisoning | Data sources the system trusts are corrupted | KelpDAO 2026 (~$290M via compromised RPC nodes and a 1-of-1 verifier); Mixin 2023 (~$200M via cloud database) | Independent data sources and no single verifier |
| Insider or outsourced staff | Bribed support staff leak data used for downstream fraud | Coinbase 2025 ($180–400M estimated cost, 69,461 people affected) | Least-privilege access and bulk-lookup anomaly detection |

Sources for the table: [Blocksec](https://blocksec.com/blog/bitget-387m-off-chain-breach); [hoge.gg](https://hoge.gg/12-minute-drain-halborn-drift-285m-hack-2026/); [bex.co](https://bex.co/blog/2026/04/22/april-606m-hack-spree-defi-protocol-upgrade-vulnerabilities-kelp-drift-resolv); [DL News](https://www.dlnews.com/articles/defi/check-out-the-10-biggest-crypto-hacks-of-2023/); [The Register](https://www.theregister.com/2025/05/21/coinbase_confirms_insider_breach_affects/); [Cointelegraph – WazirX](https://cointelegraph.com/news/wazir-x-finds-no-evidence-compromised-devices-preliminary-investigation).

Analysts described April 2026, the worst hack month before October at roughly **$606–625M**, as driven by operational and infrastructure failures rather than code bugs ([bex.co](https://bex.co/blog/2026/04/22/april-606m-hack-spree-defi-protocol-upgrade-vulnerabilities-kelp-drift-resolv)).

Flaws in MPC cryptography are a latent risk, not a demonstrated cause of large losses. (MPC, or multi-party computation, splits a key into shares held by different machines so no single machine holds the whole key.) The BitForge and TSSHOCK flaws disclosed in 2023 allowed full key extraction from vulnerable implementations, but no public theft has been tied to either ([CoinDesk](https://hotfix.coindesk.com/tech/2023/08/09/fireblocks-discloses-zero-day-vulnerabilities-impacting-leading-mpc-wallets); [Verichains](https://www.verichains.io/tsshock/)).

### A nation-state adversary that waits weeks and steals in minutes

The threat model is no longer "hackers." It is a patient, well-funded state service.

| Year | DPRK theft | Share of all crypto theft | Source |
|---|---|---|---|
| 2023 | $660.5M | ~39% | [Security Boulevard](https://securityboulevard.com/2024/12/north-korean-hackers-stole-1-34-billion-in-crypto-in-2024) |
| 2024 | $1.34B | 61% of $2.2B | [Security Boulevard](https://securityboulevard.com/2024/12/north-korean-hackers-stole-1-34-billion-in-crypto-in-2024) |
| 2025 | $2.02B | 59% of $3.4B | [The Record](https://therecord.media/over-3-billion-crypto-stolen-2025-north-korea) |
| 2026 to 29 Oct | ~$7.4B (TRM) | ~85% (TRM) to ~89% (Chainalysis) | [Cryptobriefing](https://cryptobriefing.com/chainalysis-north-korea-hacks-89-percent-losses/) |

Chainalysis puts the **average DPRK attack in 2026 at $185.65M**, against $50.65M in 2021: fewer attacks, much bigger targets ([Cryptobriefing](https://cryptobriefing.com/chainalysis-north-korea-hacks-89-percent-losses/)). The group also places fake IT workers inside crypto firms to gain privileged access ([The Record](https://therecord.media/over-3-billion-crypto-stolen-2025-north-korea)).

The timing profile defines the product requirement:

- **Long, quiet dwell before the theft.** Attackers sat inside for about **17–19 days at Safe/Bybit** and about **2.5 months at Ginco/DMM** ([Cybersecurity News](https://cybersecuritynews.com/bybit-hack-sophisticated-multi-stage-attack)).
- **Minutes to steal.** The drains themselves took **12–20 minutes**.

Two conclusions follow. First, the best chance of detection is during the weeks-long dwell, by spotting an engineer's device or identity behaving abnormally near signing systems. Second, prevention must happen *before* signature, because no human incident-response team can act inside a 20-minute window.

### Recovery is mostly an accident of which coin was stolen

Only about **8% of 2025's stolen funds were recovered or frozen** ([Yahoo Finance](https://finance.yahoo.com/news/2025-marks-worst-record-crypto-121306375.html)). By April 2025, about 3.84% of the Bybit loot had been frozen ([proofoftalk](https://proofoftalk.io/blog/stolen-crypto-tracing-freezing-recovery/)). Bitget recovered about 0.3% ([Quartz](https://qz.com/bitget-frozen-funds-crypto-hack-recovery-100226)).

Binance's ~45% recovery is the exception, and the reason matters. Tether froze more than 1.5B USDT and Circle more than 800M USDC, because stablecoins have a central issuer that can freeze them ([Al Jazeera](https://www.aljazeera.com/economy/2026/10/30/binance-says-2-54bn-in-crypto-funds-frozen-amid-potential-security-issue)). **Bitcoin has no issuer and no freeze button.** For BTC, prevention at the moment of signing is essentially the only control that saves money.

## Bitcoin's exposure is smaller, unfreezable and badly instrumented

### Institutional exposure

No source in the research isolates Bitcoin's share of stolen value. DMM is the only large pure-BTC institutional theft in the window, while Bybit, Binance's largest sweeps and most DeFi losses were in Ethereum-family assets and stablecoins ([The Record](https://therecord.media/fbi-largest-crypto-hack-2024-tradertraitor)).

The likely reason, which is inference rather than measurement, is that most institutional BTC sits in cold storage. Bitcoin also lacks the "upgrade the wallet's code" attack surface that Bybit and WazirX exploited on Ethereum.

This should shape positioning. A Bitcoin-*only* product addresses a smaller slice of realized losses. A Bitcoin-*first* product addresses the slice with the worst recovery odds and the least tooling. When Bitcoin is lost, it is lost through the same failure as everything else (DMM's altered transaction request), and it cannot be clawed back.

### The tooling gap is specific and documented

**Tracing and screening.** Chainalysis, TRM, Elliptic and Crystal all trace Bitcoin's coin-by-coin transaction history well after the fact. ("UTXO" is the technical name for these individual coin chunks.)

**Real-time prevention.** The products that simulate a transaction and block it before it executes are built around Ethereum smart contracts. These include Chainalysis's Hexagate, Hypernative and Blockaid. A 2026 survey found **no product that covers Bitcoin multisig, Lightning and CoinJoin with real-time security monitoring** ([Bitquery](https://bitquery.io/blog/best-blockchain-analysis-tools-and-software)).

**Clear signing.** This is the industry fix for "blind signing," where a hardware device approves something it cannot show a human in readable form. The standard (ERC-7730) is Ethereum-only. It moved to Ethereum Foundation stewardship in May 2026 ([Ledger](https://www.ledger.com/blog-ledger-clear-signing-ethereum-foundation)).

**On-chain policy.** Bitcoin can enforce spending policies directly in its own scripting language. That includes multi-key approval and time delays written with **Miniscript**, a structured way to write those rules. Yet commentary says use of Taproot for complex scripts "remains minimal" ([Spark](https://www.spark.money/research/bitcoin-mpc-vs-multisig-custody)). Casa and Unchained still use the older P2WSH multisig format. AnchorWatch is the only provider cited as Miniscript-based ([Bitcoin Insurance 2026](https://www.bitcoinproducts.com/blog/bitcoin-insurance-2026)).

**Where Bitcoin prevention has to live.** Because Bitcoin has no smart contract to simulate, prevention has to sit at two points:

- **The PSBT layer.** A PSBT (Partially Signed Bitcoin Transaction) is the standard file that carries an unsigned Bitcoin transaction between approvers and signers. The control is checking what the signer approved against what gets broadcast.
- **The mempool.** This is the public waiting room for unconfirmed transactions. The control is watching for unexpected spends from cold or multisig coins.

### Self-custody failures show seeds and supply chains are the weak points

The largest hardware-wallet failure to date surfaced in 2026.

- **The flaw.** A March 2021 Coldcard firmware change generated seeds with a software random-number generator instead of the hardware one.
- **The sweeps.** Since 30 July 2026, about **1,816 BTC (~$116M)** has been swept from 5,200+ addresses in waves ([TRM Labs](https://www.trmlabs.com/resources/blog/the-largest-hardware-wallet-exploit-of-2026-inside-the-usd-116-million-coldcard-hack); [No BS Bitcoin](https://www.nobsbitcoin.com/coldcard-disaster-weak-entropy-bug-enables-drain-of-funds-from-cold-storage-wallets/)).
- **Caveat.** No public report has matched a specific reconstructed seed to a drained address, so the link to the RNG flaw is strongly suspected but not formally proven ([Wublock](https://wublock.substack.com/p/coldcards-five-year-vulnerability)).
- **No firmware fix.** Affected seeds cannot be patched and must be migrated to new ones.

Earlier cases fit the same pattern. The 2023 "Milk Sad" flaw in Libbitcoin's `bx seed` command allowed only about 4 billion possible seeds and led to theft ([No BS Bitcoin](https://nobsbitcoin.com/milk-sad-vulnerability-disclosure)). In September 2025, compromised npm packages with about 2 billion weekly downloads silently swapped crypto addresses before signing ([Semgrep](https://semgrep.dev/blog/2025/chalk-debug-and-color-on-npm-compromised-in-new-supply-chain-attack/)).

For a commercial product, this argues for a **seed and firmware provenance register**: a record of which device, firmware version and entropy source produced each key in an institution's signing quorum, so that the next Coldcard-style disclosure triggers an instant "you are affected, rotate these" alert.

### Threats that are real but secondary for a first product

**Retail fraud.** This is the largest dollar pool. The FBI counted **$11.37B in crypto-related losses in 2025**, of which **$7.2B was investment fraud** and **$389M was crypto-ATM fraud** ([ASIS](https://www.asisonline.org/security-management-magazine/latest-news/today-in-security/2026/april/cryptocurrency-scams/)). But its buyers are consumers and exchange fraud teams, and Chainalysis's ~$150M Alterya acquisition shows incumbents moving there ([SiliconANGLE](https://siliconangle.com/2025/01/13/crypto-analysis-firm-chainalysis-acquires-ai-powered-fraud-detection-startup-alterya-150m/)).

**Physical "wrench" attacks.** These are kidnapping and coercion of holders. CertiK logged **72 verified incidents in 2025, up 75%**, and France is the epicentre. Leaked customer-identity (KYC) data is widely blamed for helping attackers pick targets, though no specific leak-to-attack chain is documented ([DL News](https://www.dlnews.com/articles/regulation/crypto-wrench-attacks-to-surge-following-a-violent-2025/)).

**Quantum computing.** A March 2026 Google Quantum AI paper cut the estimated cost of breaking Bitcoin's signature scheme by about 20x, to under 500,000 physical qubits. About **6.99M BTC** sit in addresses whose public keys are already exposed ([Forbes](https://www.forbes.com/sites/digital-assets/2026/03/31/google-finds-quantum-computers-could-break-bitcoin-sooner-than-expected/); [Forbes](https://www.forbes.com/sites/boazsobrado/2026/08/02/that-is-the-end-of-bitcoin-the-quantum-race-for-470-billion/)). No machine can attack Bitcoin today; Google's Willow chip has 105 qubits.

**Bitcoin Core node software.** In October 2026, AI-assisted research found three denial-of-service bugs, alongside a new policy of faster disclosure ([AIcybr](https://aicybr.com/blog/bitcoin-core-project-loupe-ai-found-vulnerabilities-october-2026); [Bitbase](https://www.bitbase.com/news/bitcoin-core-will-disclose-some-bugs-sooner-can-node-operators-update-in-time)).

All four are credible later modules: anti-coercion vault policies, quantum-exposure audits and node patch monitoring. None of them is where institutional money is being lost today.

## Vendors guard keys and trace coins but miss the signing seam

### What the existing market covers

The vendor market is crowded at both ends of a transaction and nearly empty in the middle.

| Layer | Main vendors | What it does well | What it misses |
|---|---|---|---|
| Qualified custodians | Coinbase Custody ($376B under custody), Anchorage, BitGo, Fidelity, Zodia | Regulated cold storage, insurance, audit | Customers cannot independently verify the custodian's internal signing path. Coinbase holds ~80–84% of US spot-BTC ETF assets, a single point of failure |
| MPC and policy platforms | Fireblocks, Dfns, Fordefi, Utila, Turnkey, Cobo, Liminal | Key sharding, approval workflows, APIs | Policy lives inside the vendor's software. On Bitcoin, MPC produces ordinary single-signature outputs with no on-chain policy. Logs are held by the vendor |
| Bitcoin-native collaborative custody | Unchained, Casa, Bitkey, Onramp, AnchorWatch, Nunchuk | Native multisig, portable keys | Built for consumers and high-net-worth clients. No enterprise forensics or SIEM integration |
| On-chain prevention | Hypernative, Blockaid, Chainalysis Hexagate | Simulate-and-block on Ethereum-family chains | EVM-centric. Blind to the endpoint, identity and cloud steps where attacks begin |
| Tracing and attribution | Chainalysis, TRM, Elliptic, Crystal | WHO (threat actor) within hours to days; freeze coordination | Cannot answer HOW or WHERE inside the victim |
| Incident response (DFIR) | Sygnia, Mandiant, Verichains | Laptop and cloud forensics | Retainer-priced, slow, and dependent on logs that may sit with a third party |

Sources for the table: [Forbes](https://www.forbes.com/sites/jasonbrett/2026/04/08/coinbase-wins-occ-nod-for-376-billion-institutional-custody-empire/); [Spark](https://www.spark.money/research/institutional-bitcoin-self-custody-shift); [Fireblocks support](https://support.fireblocks.io/hc/en-us/articles/27117127096604-Policy-inspector-Transparent-transaction-diagnostics); [Defimon](https://defimon.xyz/blog/defi-security-monitoring-tools-compared); [The Hacker News](https://thehackernews.com/2025/02/bybit-hack-traced-to-safewallet-supply.html). DFIR stands for digital forensics and incident response.

### Specific gaps visible in vendor documentation and incident records

**Audit logs are owned and held by the vendor.**

- **What exists.** Fireblocks lets admins export a non-expiring event log, with API endpoints for SIEM integration. (A SIEM is the central log-analysis system a security team uses.)
- **What is undocumented.** The research found no documentation that the log captures device identity or IP per approval, or that it is formally tamper-evident ([Fireblocks support](https://support.fireblocks.io/hc/en-us/articles/360015646820)).
- **No historical replay.** Fireblocks' Policy Inspector evaluates transactions only against the *current* policy, and only for transfer-type transactions. If the policy changed since an incident, it cannot show which rule actually let the bad transaction through ([Fireblocks support](https://support.fireblocks.io/hc/en-us/articles/29211960021020-Policy-inspector-Transparent-transaction-diagnostics)).

**MPC key theft can be invisible until the money moves.** Fireblocks itself said a BitForge-style key extraction "would be impossible to know until they move funds" ([Blockworks](https://blockworks.co/news/crypto-wallets-patch-zero-day-vulnerabilities-to-safeguard-user-funds)).

**One shared vendor can defeat multisig.** Bybit used multisig, but every signer used the same compromised Safe interface, so having multiple signers did not help. Elastic called Safe{Wallet} "the sole point of failure" ([Elastic](https://www.elastic.co/security-labs/threat-command/bit-bybit)). Engineers call this common-mode risk.

**Nobody fuses the off-chain and on-chain halves into one timeline.** In every major case, WHO came from on-chain analytics firms and the FBI, while WHERE and HOW came from separate incident-response firms examining laptops and cloud accounts. The research found:

- no native Splunk, Microsoft Sentinel or CrowdStrike connectors from Chainalysis, TRM or Hypernative;
- no product that joins endpoint, identity, signing and on-chain events into one timeline ([Splunkbase](https://splunkbase.splunk.com/app/6655); [TRM blog](https://www.trmlabs.com/resources/blog/trm-labs-and-hypernative-partner-to-deliver-pre-transaction-enforcement-and-on-chain-security-for-web3)).

The integrations that do exist link on-chain tools to other on-chain tools (TRM to Hypernative) or to compliance case management (Corsa).

### Why the missing evidence matters

When the evidence is missing, the root cause becomes a fight between counterparties.

**WazirX and Liminal (July 2024, ~$230M).** WazirX says it found no evidence its signers' machines were compromised. Liminal says three WazirX devices were. No conclusive public forensic report exists more than two years later ([Cointelegraph – Liminal](https://cointelegraph.com/news/liminal-blames-compromised-wazirx-devices-hack-claims-ui-not-responsible); [Cointelegraph – WazirX](https://cointelegraph.com/news/wazir-x-finds-no-evidence-compromised-devices-preliminary-investigation)).

**Bybit and Safe.** Bybit's own timeline describes phishing of its signers with a spoofed interface. Safe and Sygnia describe malicious code injected through Safe's own infrastructure. Sygnia said the biggest remaining forensic gap was activity inside **Safe's** cloud account, which Bybit did not control ([Calcalist](https://www.calcalistech.com/ctechnews/article/bjt11ar25kl); [Bybit timeline](https://www.bybit.com/en/learn/this-week-in-bybit/bybit-security-incident-timeline)).

**Bitget (September 2026).** Bitget has given three accounts of the same incident: a vulnerable third-party security product, legitimate credentials being used, and forged withdrawals carrying valid signatures ([Halborn](https://www.halborn.com/blog/post/bitget-hack-technical-analysis-september-2026)).

The lesson is that evidence held by a party who may be at fault is not evidence anyone trusts.

### Consolidation leaves room for a neutral player

- **Analytics firms are buying prevention, but only on-chain.** Chainalysis bought Hexagate and Alterya, and TRM partners with Hypernative ([Finovate](https://finovate.com/chainalysis-acquires-web3-security-company-hexagate/)).
- **Custody is being absorbed or sold.** Standard Chartered signed definitive agreements to absorb Zodia on 21 October 2026, and Copper was exploring a sale at ~$500M ([The Block](https://www.theblock.co/news/business/2026-10-21-standard-chartered-signs-definitive-agreements-to-acquire-zodia-custody-421535); [CoinDesk](https://www.coindesk.com/business/2026/05/20/crypto-custody-firm-copper-is-looking-to-sale-the-company-for-usd500-million)).
- **Wallet-infrastructure valuations are compressing.** Visa was reported to be in talks to buy Fireblocks at ~$2.5B against its $8B 2022 valuation. Fireblocks denied the report ([crypto.news](https://crypto.news/visa-fireblocks-acquisition-talks-2-5-billion/)).

The middle is being squeezed. No independent party owns the job of verifying that each signature matched its intent.

## Incident clocks and insurers create a 600-firm buyer pool

### Size the market bottom-up

Top-down market forecasts are unusable. Different research houses put "blockchain security" at anywhere from **~$14B to ~$110B by 2030**, and most of that definition is supply-chain and telecom blockchain, not crypto custody ([TechSci](https://www.techsciresearch.com/report/blockchain-security-market/30198.html); [MarketsandMarkets](https://www.marketsandmarkets.com/Market-Reports/blockchain-security-software-market-34559995.html)). A more relevant ceiling is the revenue custody providers earn, which one estimate puts at **$3.28B in 2025**. Security budgets are carved out of that ([GII/360iResearch](https://giiresearch.com/report/ires1600678-crypto-custody-provider-market-by-type-self.html)).

Counting the institutions that actually face mandates gives a defensible universe:

| Buyer group | Count | Source |
|---|---|---|
| EU MiCA-authorized crypto-asset service providers | 377–384 as of 29 Oct 2026 | [outrun.at](https://www.outrun.at/micar-dashboard) |
| Hong Kong licensed trading platforms | 13 | [Lyra Terminal](https://lyra-terminal.com/crypto-licenses/hong-kong-sfc) |
| US state trust companies specializing in crypto custody | ~19 (SEC estimate) | [King & Spalding](https://www.kslaw.com/insights/articles/sec-proposes-crypto-custody-framework-with-major-changes-to-the-advisers-act-custody-rule) |
| OCC national trust-charter approvals and applicants | Roughly 8–11 | [Banking Dive](https://www.bankingdive.com/news/occ-national-trust-bank-charter-approve-circle-paxos-ripple-bitgo-gould-crypto/807799/) |
| Listed Bitcoin-treasury companies | 173–180, holding ~1.30M BTC | [Trinity Insights](https://trinityinsights.io/en/bitcoin-treasuries) |
| US spot-Bitcoin ETFs | 12, holding ~1.29M BTC | [Bitbo](https://bitbo.io/treasuries/us-etfs/) |
| Canadian crypto dealers and their approved custodians | Not counted in the research; a small number | — |

That is roughly **600 named institutions**, before counting unregulated and emerging-market exchanges, miners and family offices. At a realistic **$50k–$250k average annual contract**, the regulated niche is worth roughly **$30M–$150M a year in recurring revenue**. That figure is my arithmetic, not a sourced estimate.

The total is attractive for a focused company. It also says the realistic outcome is a strong niche leader or an acquisition at the scale Chainalysis paid for Alterya (~$150M) ([Architect Partners](https://architectpartners.com/chainalysis-acquires-alterya-for-an-estimated-150m/)). It is not a standalone $10B company unless the product later expands to banks and tier-1 exchanges.

### Regulations that convert fear into purchase orders

The common thread across jurisdictions is **short incident-notification deadlines plus root-cause reports**. Those deadlines are impossible to meet without tamper-evident records that are ready before an incident.

| Jurisdiction | Rule | What it demands | Why it creates demand |
|---|---|---|---|
| Canada (home market) | CIRO Digital Asset Custody Framework, Feb 2026 | Dealers may self-custody at most 20% of client crypto, and internal setups must meet the Tier 4 baseline. Custodians must be approved, independent of trading, and tiered (Tier 4 may hold up to 40%) | A concentrated set of Canadian custodians and dealers must now *demonstrate* controls |
| Canada | CSA/IIROC Staff Notice 21-329 | Expectations on segregation, key and cold-storage controls, insurance and custodian due diligence | Same |
| EU | MiCA, transition ended 1 July 2026 | ~380 licensed firms | Each must meet EU operational-resilience rules |
| EU | DORA | Incident reporting, logging and third-party risk registers for financial entities including crypto firms | The exact notification deadlines were not verified against the regulation text in this research |
| US (New York) | NYDFS Part 500 | Notice within 72 hours of determining a cybersecurity incident; audit trails | Records must exist before the clock starts |
| Singapore | MAS FSM-N30 | Incident notification within reportedly 1 hour; root-cause report within 14 days | Same |
| Hong Kong | SFC trading-platform rules | ≥98% of client assets cold; insurance or compensation covering 50% of cold and 100% of hot assets | Insurance becomes effectively mandatory |
| Japan | FSA proposals after DMM (pending) | Registration of third-party wallet and system vendors; hack-liability reserves | A vendor serving Japanese exchanges may itself need to register: a barrier, then a moat |

Sources for the table: [CIRO](https://www.ciro.ca/newsroom/publications/notice-ciros-digital-asset-custody-framework); [Wealth Professional](https://www.wealthprofessional.ca/news/industry-news/ciro-rolls-out-tiered-custody-framework-for-crypto-platform-dealers/391925); [CryptoSlate](https://cryptoslate.com/crypto-laws/canada-csa-iiroc-staff-notice-21-329-crypto-platform-guidance/); [One Constellation](https://one-constellation.com/blog/mica-casp-authorisation-after-transition/); [InnReg](https://www.innreg.com/blog/nydfs-cybersecurity-rule); [MAS](https://www.mas.gov.sg/regulation/notices/fsm-n30-trm); [ChainUp](https://chainup.com/blog/singapore-mas-crypto-dtsp-regulations-may-2025/); [Fystack](https://fystack.io/blog/entering-hong-kongs-vasp-market-in-2026-what-the-sfcs-custody-requirements-mean-for-your-business); [Decrypt](https://decrypt.co/349929/japans-fsa-crypto-exchanges-hold-liability-reserves-hacks).

Compare those deadlines with reality:

- **Bybit** took about five days to get preliminary forensic reports ([Bybit timeline](https://www.bybit.com/en/learn/this-week-in-bybit/bybit-security-incident-timeline)).
- **DMM's** formal attribution took seven months.
- **WazirX's** root cause is still disputed.

A product that produces a defensible "what happened" draft within the first hour sells itself to compliance officers.

**United States outlook.** The US is opening custody to more players rather than imposing incident deadlines:

- SAB 122 removed the accounting barrier to bank custody in January 2025 ([National Law Review](https://natlawreview.com/article/sec-rescinds-sab-121)).
- The SEC proposed a crypto custody framework around 1 October 2026 that is not yet final ([A&O Shearman](https://www.aoshearman.com/en/insights/sec-proposes-crypto-asset-custody-framework-for-investment-advisers-and-regulated-funds)).
- The CLARITY Act stalled in the Senate in September 2026 ([CNBC](https://www.cnbc.com/2026/09/15/senate-cloture-vote-on-clarity-act-fails-dealing-regulatory-setback-to-crypto-industry.html)).

New bank and trust entrants will each face vendor-risk reviews. That is a later, larger and slower market.

### Insurers price on controls but lack a way to measure them

Crypto insurance is capacity-constrained and expensive, at roughly **0.4%–6% of insured value per year**. As one buyer's guide puts it, "carrier premiums are a function of your controls, not a rate card" ([web3wagmi](https://blog.web3wagmi.com/best-crypto-insurance)). Nexus Mutual reports that underwriters add large margin-of-safety loadings because the risk is hard to measure ([Nexus Mutual](https://nexusmutual.io/blog/the-state-of-crypto-insurance-q2-2026)).

AnchorWatch is the model to copy. It insures self-custodied Bitcoin for holders with $250k–$100M, from about 0.55% a year, and checks on-chain that insured coins stay within agreed security conditions ([cryptonewsbytes](https://cryptonewsbytes.com/best-crypto-insurance-providers-2026-compared/)).

Courts point the same way. In the Bitcoin Fog case (*US v. Sterlingov*), a US federal court admitted Chainalysis tracing evidence, but explicitly because off-chain evidence corroborated it ([Stout](https://www.stout.com/en/insights/article/judicial-scrutiny-chainalysis)). In New York, blockchain data is admissible as a business record only with an established chain of custody ([Daeryun Law](https://www.daeryunlaw.com/us/insights/insurance-defense-blockchain-defense-in-new-york)).

The research found **no published insurer standard** for proof of loss, and **no evidence yet that better forensics lowers premiums**. That is a hypothesis to validate with brokers and managing general agents (MGAs) in the first 90 days, not a fact to put in a pitch deck.

## Build an independent flight recorder and veto for every signature

### The concept in one sentence

Build a vendor-neutral layer that sits between "a transaction was requested" and "a key signed it." It should do three things: independently decode and check every transaction, hold a veto that a compromised insider cannot override, and write a tamper-evident record of who requested and approved it, from which device and location, when, what each approver saw, and which policy version allowed it. It should then join that record to endpoint, identity, cloud and on-chain events in one timeline. A working name is "Witness." The category label for buyers is a **signing-integrity and breach-evidence platform**.

### How it answers WHO, WHERE, WHEN and HOW

**WHO, inside the victim.** Each request and approval is bound to a named human identity from the company's login system, also called an identity provider (Okta or Microsoft Entra). It is also bound to the specific device used, and to any service account or automated process.

**WHO, the outside attacker.** Identifying the threat actor is a job for on-chain analytics. The product should not try to compete there. It should integrate with TRM, Chainalysis and Elliptic on a "bring your own API key" basis, the same way Hypernative calls TRM before a transaction executes ([TRM blog](https://www.trmlabs.com/resources/blog/trm-labs-and-hypernative-partner-to-deliver-pre-transaction-enforcement-and-on-chain-security-for-web3)). The product's contribution is the off-chain corroboration that courts and attribution teams lean on.

**WHERE.** The device and its security posture at the moment of approval, the network location, the cloud workload or vendor environment that created the request, and the wallet tier involved.

**WHEN.** A hash-chained log, meaning each entry contains a fingerprint of the previous one so any deletion or edit breaks the chain. The log is periodically "anchored" by publishing a fingerprint into a Bitcoin transaction, which proves the record existed at that time and was not rewritten later. Every entry is aligned to block times on-chain.

**HOW.** The origin of the request, the decoded payload, a fingerprint of what each signer's screen displayed next to a fingerprint of what was actually signed, the policy version in force, and which control passed or failed.

That "displayed versus signed" pair is exactly the evidence that would have settled the Bybit and WazirX disputes immediately. The research found **no vendor documenting it** today.

### Differentiated positioning

**"The independent witness for every signature."** The positioning rests on three claims incumbents structurally cannot make.

1. **Neutrality.** The vendor that holds your keys, or is a potential defendant, should not also hold the only evidence. Bybit vs. Safe and WazirX vs. Liminal make that argument for you.
2. **Off-chain plus on-chain fusion.** Analytics firms see coins. Incident-response firms see laptops. This product sees the bridge between them, which is where every major 2024–2026 theft crossed over.
3. **Bitcoin-native depth with multi-chain reach.** Customers get PSBT decoding, checks against wallet descriptors and Miniscript policies, and mempool watching for their Bitcoin. For Ethereum-family assets, the product integrates existing simulators such as Blockaid and Hypernative rather than rebuilding them. Exchanges hold many assets, as Binance's ten-chain drain showed. A Bitcoin-only tool would not get past their procurement.

### What the MVP includes

| MVP module | What it does in plain English | Incident it would have changed |
|---|---|---|
| Signing flight recorder | Append-only, hash-chained, Bitcoin-anchored log of every request, approval, device, location, policy version and displayed-versus-signed fingerprint. Exportable and held by the customer | WazirX/Liminal and Bybit/Safe root-cause disputes; Bitget's shifting accounts |
| Independent transaction verifier ("second screen") | Decodes the raw payload (PSBT, or EVM calldata via partners) on a separate code path and device from the one that built it, and checks it against a destination allowlist and expected amounts | Bybit, DMM/Ginco, WazirX |
| Veto-only policy co-signer and circuit breaker | Holds one key in the multisig, or a policy-approval hook on MPC platforms. Enforces value and velocity limits per wallet tier. Blocks contract upgrades, delegatecall, EIP-7702 delegation and admin-authority transfers. Requires out-of-band human confirmation above thresholds | Binance's 20-minute drain; Drift's admin takeover; Bitget's forged withdrawals |
| Dwell-window correlation | Ingests endpoint security alerts (EDR such as CrowdStrike or Defender), identity-provider and cloud logs. Flags when a device or identity that touched signing infrastructure behaves abnormally: new session tokens, odd hours, developer tooling reaching withdrawal services | The 17-day Bybit and 2.5-month DMM dwell periods; Binance's 36-hour staging |
| Policy snapshot and replay | Stores every policy version so any past transaction can be replayed against the rules in force at the time | Fireblocks' documented inability to replay historical policy |
| Incident pack generator | One-click drafts of a regulator notice (NYDFS, MAS, DORA, CIRO), an insurer proof-of-loss bundle, a law-enforcement package, and pre-filled freeze requests to stablecoin issuers and exchanges, with on-chain tracing handed off via the customer's analytics key | Bybit's 5-day lag to preliminary findings; recovery that depends on minutes |
| Key and firmware provenance register | Records device model, firmware and entropy source for every key in each quorum, and alerts when a disclosure such as Coldcard or Milk Sad affects one | Coldcard 2026 (~1,816 BTC) |

These map directly onto the controls the incident record says were missing ([Sygnia](https://www.sygnia.co/case-study/bybit-heist-case-study/); [Fireblocks support](https://support.fireblocks.io/hc/en-us/articles/29211960021020-Policy-inspector-Transparent-transaction-diagnostics); [TRM Labs](https://www.trmlabs.com/resources/blog/the-largest-hardware-wallet-exploit-of-2026-inside-the-usd-116-million-coldcard-hack)).

**Deliberately excluded from the MVP:**

- **A proprietary chain-analytics and attribution engine.** That field is commoditizing. Chainalysis's secondary-market valuation implies ~$1.55B against its $8.6B 2022 mark ([Forge](https://forgeglobal.com/insights/how-to-invest-in-chainalysis-stock-pre-ipo/)).
- **An EVM smart-contract simulation engine.** Hypernative, Blockaid and Hexagate are already well funded there.
- **An MPC wallet.** Wallet infrastructure is compressing in value, as noted above.
- **A consumer anti-scam app.**

**Later modules:**

- quarterly control attestations for Bitcoin-treasury boards and auditors;
- a Miniscript policy designer with time-delayed recovery paths and anti-coercion delays;
- a quantum-exposure audit of which coins have revealed public keys;
- Bitcoin Core and Lightning node patch monitoring.

### The design rule that makes it trustworthy

The product must be able to **refuse but never initiate**. It should hold no key that can move funds alone, and it needs a time-locked fallback so that an outage cannot freeze customer funds. Bitcoin script can do this natively. It should also be self-hostable inside the customer's environment and built so that the verifier code can be independently audited. This is not optional. Bitget blamed a vulnerability in an unnamed third-party security product, and Bybit fell through a trusted vendor's interface ([Halborn](https://www.halborn.com/blog/post/bitget-hack-technical-analysis-september-2026)).

The sales pitch must include proof that a full compromise of *your* product cannot cause a theft. That proof is also the strongest answer to the first question any security-literate buyer will ask.

## Start with mid-tier regulated exchanges, sell through insurers and platforms

### Beachhead customers, in order

**Design partners: three to five Canadian CIRO-registered dealers and approved custodians.**

- **Why them.** The February 2026 framework forces them to demonstrate controls now, they are reachable from Ontario, and the regulator is local.
- **What they provide.** The case studies, references and evidence formats that unlock everything else.
- **The limit.** Canada alone is too small to be the whole business.

**Primary beachhead: mid-tier regulated exchanges and custodians that operate their own hot wallets.** These are EU MiCA firms first (about 380), then Hong Kong, Singapore and Dubai platforms.

- **Hot wallets are where the money is lost.** Binance, Bitget, Phemex, BtcTurk, Upbit, CoinEx and Stake were all hot-wallet incidents.
- **Their deadlines are short.** They face incident-reporting clocks measured in hours.
- **They lack tier-1 resources.** They cannot field Coinbase- or Binance-scale in-house security teams or keep top incident-response firms on retainer.
- **They are the most exposed.** The research identifies mid-size and emerging-market exchanges as the firms most priced out of top-tier tooling and most exposed to DMM- and WazirX-style social engineering.

**Second segment: Bitcoin-treasury companies, Bitcoin-heavy funds and family offices.** There are 173–180 listed treasury companies holding about 1.30M BTC ([satsintel](https://www.satsintel.io/en)).

- **The buyer is the board.** Their pain is board, auditor and insurer assurance rather than running a security operations centre. Many outsource to custodians that charge **15–50 basis points of assets a year**. At those rates, custody of $500M of BTC costs $0.75–2.5M a year ([rfp.wiki](https://www.rfp.wiki/crypto/custody-security/institutional-custody-services/kraken-institutional/anchorage-digital); [WalletInvestor](https://walletinvestor.com/news/finance-news/coinbase-prime-review-the-benchmark-for-institutional-crypto-execution-and-custody/)).
- **The wedge.** A flat-priced self-custody overlay with attestation is a credible alternative to paying a percentage of assets.

**Not first: tier-1 exchanges, new OCC trust banks and ETF custodians.**

- **Tier-1 exchanges** build in-house and buy point solutions only once a product is proven. Alterya sold to Binance, Coinbase and Block before it was acquired ([Chainalysis](https://www.chainalysis.com/blog/chainalysis-alterya-announcement/)).
- **New OCC trust banks** will demand mature certifications and long vendor-risk reviews.
- **ETF custodians** fall in the same category.

### Go-to-market

**Lead with forensic education, timed to the moment.** Every exchange board is asking "could Binance happen to us?" this week. Publish rigorous reconstructions of Binance, Bybit, DMM and Bitget that show the exact minute each module would have fired or produced evidence. Then offer a free "signing-path exposure assessment" that maps a prospect's request-to-signature path and finds where a single laptop could reach it.

**Use three channels that shorten enterprise sales.**

1. **Insurers, MGAs and brokers.** Examples are Evertas (Lloyd's-backed) and AnchorWatch-style underwriters. Position the product as their control-verification and claims-evidence layer.
2. **Custody and wallet platforms.** Integrate with Fireblocks, BitGo and Safe. Safe already distributes Blockaid and Hypernative as add-ons, which shows the channel exists ([Forklog](https://forklog.com/exclusive/luchshie-nekastodialnye-kriptokoshelki-2026)).
3. **Incident-response firms and Big-4 auditors.** For DFIR firms, your logs make their investigations faster. For auditors, your records feed SOC 1 and SOC 2 reports and proof-of-reserves work.

**Certify early.** Start a SOC 2 Type II audit in the first year. Buyers' vendor-risk reviews treat SOC 2 and ISO 27001 as table stakes, even though no rule mandating them was found.

**Raise from cyber-specialist investors.** Hypernative's $40M Series B was co-led by cybersecurity specialists Ten Eleven and Ballistic Ventures ([The Block](https://www.theblock.co/post/357627/crypto-security-startup-hypernative-series-b)). Crypto venture funding overall recovered to more than $20B in 2025 but is concentrated in late-stage deals ([crypto.news](https://crypto.news/crypto-vc-funding-hits-5-68b-in-q2-galaxy-says/)).

### Pricing approach

Price on **signing surface and approval volume, not on assets under custody**. Percentage-of-assets pricing is what customers resent paying custodians, and it ties your revenue to Bitcoin's price. The anchors below are public:

- **Fireblocks:** custom annual plans from **$36,000 a year**, with a $999-a-month entry tier ([Breet](https://breet.io/business/research/reviews/fireblocks)).
- **Chainalysis:** custom pricing by segment on 1–3-year contracts ([Vendr](https://www.vendr.com/marketplace/chainalysis)).
- **Insurance premiums:** 0.4–6% of insured value.

| Tier | Buyer | Includes | Indicative annual price (recommendation) |
|---|---|---|---|
| Assurance | Treasury companies, funds, family offices | Recorder for their own approvals; key provenance register; quarterly attestation; insurer evidence pack | $15k–$40k |
| Core | Canadian dealers, small EU and Asian platforms | Recorder, verifier, veto co-signer, incident packs; limited wallets and integrations | $40k–$90k |
| Growth | Mid-tier exchanges and custodians | Adds dwell-window correlation, SIEM export, multi-platform coverage | $90k–$250k |
| Enterprise | Banks, trust companies, large exchanges | Self-hosted, HSM integration, custom policy, SLAs | $250k+ |
| Response retainer (add-on) | Any tier | Guaranteed response, evidence handling, regulator and insurer liaison, per-incident report fee | $25k–$75k plus per incident |

These figures are positioned against comparables, not sourced quotes. Test them with design partners. The economic argument for a buyer is straightforward:

- a single mid-size hot-wallet incident runs to tens of millions of dollars (BtcTurk ~$48–54M; CoinDCX ~$44M);
- Coinbase's insider breach cost an estimated $180–400M ([DL News](https://www.dlnews.com/articles/people-culture/coindcx-hacker-routes-46m-into-ethereum-lazarus-style-attack/); [The Register](https://www.theregister.com/2025/05/15/coinbase_extorted_for_20m_support/));
- DMM ceased to exist.

## The product must never become the next Bitget vector

### Key risks and mitigations

| Risk | Why it is real | Mitigation |
|---|---|---|
| Your product becomes the attack path | Bitget's loss was blamed on a third-party security product. Bybit's on a trusted vendor's interface | Veto-only design, no fund-moving keys, time-locked fallback, self-hosting, auditable verifier, reproducible builds, red-team before launch |
| Liability when a "verified" transaction is stolen anyway | Customers and insurers will look for someone to blame | Contracts that limit warranties to recording and policy enforcement; technology errors-and-omissions insurance; never market "guaranteed prevention" |
| Platforms bundle it or restrict APIs | Fireblocks, Safe and Chainalysis are expanding prevention features. Custody platforms control the hooks you need | Stay neutral across platforms; own the cross-vendor evidence record no single platform can offer; keep the native Bitcoin multisig co-signer path, which needs no platform permission |
| Bitcoin-only demand is too small | Large realized losses are mostly EVM and stablecoins; DMM is the main BTC case | Be Bitcoin-first, multi-chain capable; integrate EVM simulators |
| The insurance-discount thesis is unproven | No source shows premiums fall with better forensics, and no insurer evidence standard exists | Validate with two or three underwriters before building pricing around it; co-design the evidence format with them |
| Long enterprise sales cycles and certification costs | Regulated buyers run vendor-risk reviews | Canadian design partners first; SOC 2 early; insurer and platform channels |
| Founder credibility in a deeply technical market | Buyers are security engineers who will probe the cryptography | Recruit a technical co-founder with Bitcoin signing and DFIR depth; build an advisory bench of former incident responders. The founder owns buyers, regulators, insurers and capital |
| Privacy and employee-monitoring law | Recording device posture and location of staff touches Canadian and EU privacy rules | Data minimization, customer-held data, consent workflows, hashing personal data where possible |
| Regulatory flux | CLARITY stalled; SEC custody rule only proposed; Japan's vendor registration pending | Sell to mandates already in force (CIRO, MiCA, NYDFS, MAS, SFC). Treat US federal rules as upside |
| Nation-state targeting of your own staff | TraderTraitor specifically targets vendors' engineers (Ginco, Safe) | Apply your own product internally; hardware-key sign-in, device-bound sessions, no standing production access |

### Uncertainties the founder should keep visible

The research leaves several questions open:

- **Binance's figures and mechanism.** Two days after the event they are preliminary, and the CEO has already widened the explanation beyond a single laptop.
- **Bitget's vector** remains disputed.
- **Unverified absence of competitors.** No source confirmed that any custodian (BitGo, Anchorage, Cordial, Taurus, Ripple Custody) lacks hash-chained or device-attested approval logs. Check before claiming the space is empty.
- **Bitcoin's share of losses** is unmeasured.
- **Canadian dealer counts and DORA's exact deadlines** were not verified against primary sources.

Run a two-week competitive teardown of those custodians' documentation and ten buyer interviews before committing engineering spend.

## Conclusion

The past three years changed what "crypto security" means. The industry spent a decade hardening keys with cold storage, hardware security modules and MPC, and largely succeeded. Attackers responded by going around the key, corrupting the request, the screen or the automated pipeline that feeds it. The result is a paradox: billions are lost from systems whose cryptography worked perfectly, and afterwards nobody can prove which human, device or vendor failed. The scarce asset is therefore **trustworthy evidence about intent**, captured before signature by a party with no stake in the outcome. That is a different business from tracing coins, which is commoditizing, or holding keys, where valuations are compressing.

For an Ontario founder, the practical implication is that the Binance event, CIRO's new custody framework and the end of MiCA's transition period have opened a narrow window. Buyers now have both the fear and the obligation. Winning depends less on novel cryptography than on three disciplines: an architecture that provably cannot be turned into a theft path, an evidence format co-designed with insurers and regulators so it becomes the reference standard, and Bitcoin-native depth that the EVM-centric incumbents have left unbuilt. Getting those right could make the product the default record of what happened at the moment of signature across the institutional market, and therefore a strategic acquisition for any analytics, custody or insurance platform that lacks it.

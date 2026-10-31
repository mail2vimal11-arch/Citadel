# Crypto Threat Detection, Monitoring, Forensics, Attribution and IR Landscape (as of Oct 31, 2026) — WHO/WHERE/WHEN/HOW of breaches

> Research method note: ~19 web searches. Direct page fetches failed for fortune.com, cnbc.com, chainalysis.com and thehackernews.com, because those hosts are not allowed in this session's network settings. Most findings below therefore come from search-result summaries of the cited pages, not from full-page reads. Treat exact figures as "as reported" and verify against the primary page where it matters. The Binance hack of Oct 29, 2026 was 1–2 days old at the time of writing, so its figures and attribution are still moving.

## 1. What each product/vendor does (on-chain vs off-chain coverage)

### Takeaway
The market splits into five layers: (a) investigative tracing/attribution (Chainalysis Reactor, TRM Forensics, Elliptic, Crystal); (b) compliance screening/KYT; (c) pre-transaction simulation and real-time on-chain threat prevention (Hypernative, Blockaid, Chainalysis Hexagate); (d) freezing/recovery coalitions (T3 FCU, TRM Beacon Network, SEAL 911/Safe Harbor, stablecoin issuers); and (e) traditional DFIR firms (Sygnia, Mandiant, Verichains) that handle the off-chain side (developer laptops, cloud accounts). None of the sources show a vendor that covers both the off-chain forensics (endpoint/cloud/signing) and the on-chain tracing in one product. In the big cases, that work was always split across separate firms.

### Cited Findings
**Chainalysis (Reactor, KYT, Hexagate, Alterya)**
- Chainalysis acquired Hexagate, a Web3 security provider, in Dec 2024 (price undisclosed; one aggregator estimates ~$60M, unconfirmed). It acquired Alterya on Jan 13, 2025 for a reported ~$150M (Globes reported $160M). Alterya uses AI to prevent authorised-push-payment (APP) fraud and runs as an independent product line and Israeli R&D center with 28 staff. — [SiliconANGLE](https://siliconangle.com/2025/01/13/crypto-analysis-firm-chainalysis-acquires-ai-powered-fraud-detection-startup-alterya-150m/); [Globes](https://en.globes.co.il/en/article-1001499269); [PYMNTS](https://pymnts.com/acquisitions/2025/chainalysis-bolsters-fraud-detection-capabilities-with-alterya-acquisition)
- Chainalysis says the Alterya deal adds "proactive real-time fraud protection for payments and enhanced fraud detection during the KYC process". — [FinTech Futures](https://www.fintechfutures.com/m-a/chainalysis-acquires-ai-fraud-detection-solution-alterya)
- Hexagate is described as "adaptive, real-time security to detect key compromises, phishing attacks, and governance threats, powered by Chainalysis blockchain intelligence and ML models", sold within the Chainalysis suite. It is EVM-oriented. — [Defimon comparison (2026)](https://defimon.xyz/blog/defi-security-monitoring-tools-compared); [Bitquery](https://bitquery.io/blog/best-blockchain-analysis-tools-and-software)
- KYT does real-time transaction monitoring and alerting on suspicious transfers. — [Bitquery](https://bitquery.io/blog/best-blockchain-analysis-tools-and-software)
- Chainalysis attributed the Oct 29, 2026 Binance hack (~$6.4B by its count) to North Korea's TraderTraitor, because stolen funds were commingled with the prior month's Bitget theft. — [Chainalysis blog (via search summary)](https://www.chainalysis.com/blog/binance-exploit-latest-findings-and-response/); [Cointelegraph](https://cointelegraph.com/news/north-korea-linked-to-63b-binance-hack-by-crypto-investigators)

**TRM Labs (Forensics, Beacon Network, T3 FCU)**
- Beacon Network launched Aug 20, 2025 as a "real-time crypto crime response" network. It connects law enforcement with 70+ financial institutions said to cover ~3/4 of global crypto volume. The reach figures come from a secondary source. — [Yespress profile](https://yespress.io/trm-labs)
- TRM and Hypernative partnered on pre-transaction enforcement. Hypernative calls the TRM API before a transaction executes to score wallet and counterparty risk, then auto-approves, flags or blocks it against policy thresholds. Customers bring their own TRM API key. — [TRM blog](https://www.trmlabs.com/resources/blog/trm-labs-and-hypernative-partner-to-deliver-pre-transaction-enforcement-and-on-chain-security-for-web3)
- TRM attributed the Binance hack to North Korean actors "with high confidence". — [Cointelegraph live blog](https://cointelegraph.com/news/live-updates-binance-63b-hack-linked-to-north-koreas-tradertraitor)
- T3 FCU (Tether + TRON + TRM) has frozen >$450M since its 2024 launch (as of May 14, 2026), mostly USDT on TRON. It has worked with law enforcement in 23 jurisdictions. — [The Block](https://www.theblock.co/post/401252/tether-tron-trm-labs-freeze-over-450-million-in-illicit-crypto-assets); [Decrypt](https://decrypt.co/367874/tether-tron-trm-financial-crime-unit-frozen-450-million-crypto-funds)

**Elliptic, Crystal**
- Elliptic and TRM attributed Bybit to DPRK from wallet overlaps before the FBI did. The FBI then published 51 addresses. — [Max Avery blog (secondary)](https://www.maxavery.org/blog/bybit-the-largest-theft-in-the-asset-class-and-the-signing-interface-behind-it/)
- Crystal Intelligence published an analysis of the WazirX hack and covers tracing through Bitcoin and Ethereum. — [Crystal Intelligence](https://crystalintelligence.com/investigations/expert-analysis-wazirx-hack/); [Bitquery](https://bitquery.io/blog/best-blockchain-analysis-tools-and-software)
- A third-party review describes Elliptic's tool as "not cheap, but reliable, innovative, and far-reaching". — [Bitquery](https://bitquery.io/blog/best-blockchain-analysis-tools-and-software)

**Pre-transaction / real-time prevention (Hypernative, Blockaid)**
- Blockaid traced the Binance Ethereum-side attack to 50 EIP-7702 authorizations, one of which successfully targeted the "Binance 14" hot wallet. One report says the delegation turned the hot wallet into a sweeper contract that emptied 167,464 ETH and 1.615B USDT in under four minutes. — [crypto.news](https://crypto.news/binance-hack-eip-7702-wallet-attack/); [tech-insider](https://tech-insider.org/binance-20-minute-6-3b-heist-signing-infrastructure-dev-lessons-2026/)

**Off-chain DFIR firms (Sygnia, Mandiant, Verichains)**
- In Bybit, Sygnia and Verichains ran the off-chain forensics and concluded the root cause was malicious code from Safe{Wallet}'s infrastructure. Safe said the entry was a compromised developer machine, citing Mandiant's preliminary report. Sygnia noted that Mandiant had not independently confirmed this through forensics of Safe's infrastructure. — [The Hacker News](https://thehackernews.com/2025/02/bybit-hack-traced-to-safewallet-supply.html); [BleepingComputer](https://www.bleepingcomputer.com/news/security/lazarus-hacked-bybit-via-breached-safe-wallet-developer-machine/); [Calcalist](https://www.calcalistech.com/ctechnews/article/bjt11ar25kl)
- Elastic Security Labs published an emulation of the Bybit attack chain. EDR vendors treat this as endpoint detection content, separate from on-chain tracing. — [Elastic Security Labs](https://www.elastic.co/security-labs/threat-command/bit-bybit)

**Coalitions / white-hat (SEAL)**
- SEAL Whitehat Safe Harbor: the standard bounty is 10% of recovered funds, capped at $1M per incident. Lido raised its cap to $2M. Recovered funds must be returned within ~72 hours, with KYC/OFAC checks before payout. A whitehat cannot double-dip with a bug bounty for the same exploit. — [Aave governance](https://governance.aave.com/t/arfc-adopt-the-seal-safe-harbor-agreement/23059); [Phemex/Lido](https://phemex.com/news/article/lido-dao-adopts-seal-whitehat-safe-harbor-agreement-46770); [Inverse Finance docs](https://docs.inverse.finance/inverse-finance/inverse-finance/technical/safe-harbor-agreement)
- 29 large crypto organizations signed the Safe Harbor Agreement as of Oct 1, 2025. Another outlet claims the initiative protects ~$25B. — [Bitget news](https://www.bitget.com/news/detail/12560604995928); [Chainbull](https://chainbull.net/news/seals-safe-harbor-initiative-protects-25-billion-raises-crypto-security-standards/3/); [Cointelegraph](https://cointelegraph.com/news/white-hat-hackers-saved-billions-crypto-seal-safe-harbor)

**Case-management overlay**
- Corsa offers compliance case management with native integrations to Chainalysis (KYT, Reactor) and TRM (bi-directional). It is a compliance tool, not a SIEM. — [Corsa comparison](https://corsa.finance/compare/chainalysis-vs-trm-vs-elliptic)

### Inferences
- In every major case reviewed, the four questions were answered by different organizations. WHO came from on-chain analytics (Chainalysis, TRM, Elliptic) plus government (FBI). WHERE/HOW came from off-chain DFIR (Sygnia, Mandiant, Verichains). WHEN on-chain came from block timestamps, and WHEN off-chain came from host and cloud logs. No vendor in the evidence fuses the two layers into one timeline. That is the white space for the proposed product.
- The consolidation trend (Chainalysis buying Hexagate and Alterya; TRM partnering with Hypernative) pushes analytics firms toward real-time prevention, but only on the on-chain side. None has moved into endpoint, identity or signing-ceremony telemetry.

### Gaps
- I did not verify current product details for Merkle Science, Arkham, Nansen, Forta, Cyvers, Hacken, CertiK Skynet, Halborn, Trail of Bits, Zellic, OpenZeppelin Defender/Monitor, Webacy, Wallet Guard, Pocket Universe, Scam Sniffer, zeroShadow, Asymmetric Research, CrowdStrike, or the in-house Coinbase/Binance teams. I ran out of tool budget. Background knowledge, NOT verified in this session (confirm before use): Wallet Guard was acquired by Consensys/MetaMask (2024); Pocket Universe was acquired by Kerberus (2024); OpenZeppelin announced the sunset of Defender in favor of open-source Monitor/Relayer; Forta pivoted to "Firewall" pre-transaction screening; zeroShadow does incident response and fund-freezing coordination and is often a SEAL 911 responder.
- SEAL 911's operating model and response statistics were not found.

## 2. Bitcoin coverage depth (UTXO, multisig, Lightning, CoinJoin): is there a Bitcoin-native real-time threat detection gap?

### Takeaway
On Bitcoin, coverage is strong for forensic tracing and AML screening (Chainalysis, TRM, Elliptic, Crystal all trace UTXO chains). It is weak for real-time threat prevention. The pre-transaction simulation and anomaly-detection products (Hexagate, Hypernative, Blockaid, Forta, EIP-7702 detection) are built around EVM smart contracts. I found no tool that does Bitcoin-native real-time detection across multisig, PSBT signing, Lightning and CoinJoin.

### Cited Findings
- A survey of tools found no single product covering UTXO, multisig, Lightning and CoinJoin together with real-time security monitoring. Bitcoin coverage was mostly forensic tracing. — [Bitquery 2026 comparison](https://bitquery.io/blog/best-blockchain-analysis-tools-and-software); [CNC Intelligence](https://cncintel.com/crypto-transaction-monitoring-tools/)
- Bitquery's Coinpath API claims real-time tracking across EVM, UTXO and ledger-based networks. Crystal traces Bitcoin and Ethereum. — [Bitquery](https://bitquery.io/blog/best-blockchain-analysis-tools-and-software)
- Lightning transactions happen off-chain and are harder to trace. Multisig and timelocked transactions add complexity. — [Perun Consultants "Crypto Tracing 101: Bitcoin" (Jan 2026)](https://www.perunconsultants.com/en/blog/2026/1/8/crypto-tracing-101-bitcoin); [BlockSec](https://blocksec.com/blog/is-bitcoin-traceable)
- CoinJoin can be de-anonymized in some cases. Research finds that if a victim uses 3 rounds of CoinJoin and an adversary observes two of the victim's payments, linkage succeeds with ~98% accuracy. — [arXiv 1708.04748](https://arxiv.org/pdf/1708.04748)
- Wallet checkers such as OnChainRisk detect CoinJoin usage and analyze UTXO history, but they are lookup tools, not live monitors. — [OnChainRisk](https://onchainrisk.io/check-wallet/bitcoin/)
- DMM Bitcoin (May 2024, ~$308M in BTC) was a Bitcoin theft. The loss came from manipulating a legitimate transaction request inside wallet-software vendor Ginco, so it was an off-chain signing-workflow compromise, not a protocol exploit. — [BleepingComputer](https://www.bleepingcomputer.com/news/security/fbi-links-north-korean-hackers-to-308-million-crypto-heist/)
- The Binance Oct 2026 hack drained hot wallets across 10 blockchains in ~20 minutes. The detection narrative so far (e.g., Blockaid on EIP-7702) is EVM-specific. — [secure.com](https://www.secure.com/blog/cybersecurity/binance-hack-compromised-laptop); [crypto.news](https://crypto.news/binance-hack-eip-7702-wallet-attack/)

### Inferences
- Bitcoin has no smart-contract execution to simulate, so the EVM "simulate-then-block" model maps poorly onto it. Bitcoin-native prevention has to sit at the PSBT/signing-policy layer (what the signer approved vs. what was broadcast) and in the mempool (unexpected spends from cold or multisig UTXOs, fee-bump/RBF anomalies). That puts the leverage in off-chain signing telemetry, which is exactly what the proposed product would fuse.
- DMM (BTC) and WazirX/Bybit (multisig UI spoofing) share a root cause: the signer's interface showed something different from what was signed. A Bitcoin product that ties device integrity, the PSBT contents and the broadcast transaction together would address that pattern.

### Gaps
- I could not verify the current status of OXT.me or which mempool.space-based watchers or alerting services exist commercially. Unverified background: OXT went offline around the April 2024 Samourai Wallet arrests. mempool.space offers address and transaction notifications but is not a threat-detection product.
- I found no published Bitcoin-specific detection-latency benchmarks for any vendor.
- Vendor depth on Lightning channel monitoring, taproot/miniscript multisig policy analysis and Ark/statechain layers is undocumented in the sources found.

## 3. How attribution was actually done in big cases (data available, missing, time taken)

### Takeaway
On-chain attribution to DPRK is fast: hours to days, driven by address overlap and commingling with prior DPRK thefts. Root-cause (HOW/WHERE) depends on off-chain DFIR and is slower and often contested. Bybit had Safe vs. Bybit narratives, WazirX had WazirX vs. Liminal, and Binance first blamed a laptop, then said it was "more complex". The missing data is almost always off-chain: third-party cloud accounts, vendor developer machines, signer devices.

### Cited Findings
**Binance (Oct 29, 2026; ~$6.3B, largest crypto theft on record)**
- About $6.3B left Binance hot wallets across 10 chains in ~20 minutes on Oct 29, 2026. — [secure.com](https://www.secure.com/blog/cybersecurity/binance-hack-compromised-laptop); [CNBC](https://www.cnbc.com/2026/10/29/circle-tether-freeze-funds-impacted-by-potential-binance-security-issue.html)
- Binance's preliminary finding was a compromised DevOps engineer laptop, which gave a path to a service container that could submit withdrawals. It said there was no evidence of a leaked private key. CEO Richard Teng later said the attack was "more complex" than a single engineer's compromised laptop. — [Forbes](https://www.forbes.com/sites/digital-assets/2026/10/30/binances-63-billion-hack-started-with-one-engineers-laptop/); [cryptoticker](https://cryptoticker.io/en/binance-hack-cause-devops-laptop/); [The Hacker News](https://thehackernews.com/2026/10/binance-suffers-security-breach.html)
- Chainalysis (TraderTraitor, via commingling with the Bitget theft the month before) and TRM ("high confidence" DPRK) attributed the attack within ~1–2 days. Binance itself named no perpetrator and says it is working with law enforcement. — [Cointelegraph](https://cointelegraph.com/news/north-korea-linked-to-63b-binance-hack-by-crypto-investigators); [Chainalysis](https://www.chainalysis.com/blog/binance-exploit-latest-findings-and-response/)
- Binance reserved $6.34B of its own funds to cover losses. — [CoinDesk](https://www.coindesk.com/business/2026/10/30/binance-arranges-usd6-34-billion-to-cover-losses-from-record-crypto-hack)
- Bitget had separately lost ~$388M; it froze ~$1.1M. — [Quartz](https://qz.com/bitget-frozen-funds-crypto-hack-recovery-100226)

**Bybit (Feb 21, 2025; ~$1.4–1.5B ETH)**
- Attack Feb 21, 2025. Sygnia and Verichains preliminary reports came out Feb 26 (~5 days). Sygnia's March follow-up said the biggest remaining gap was a full investigation of activity inside Safe's AWS account. That data belonged to a third party and was not in Bybit's control. — [Bybit timeline](https://www.bybit.com/en/learn/this-week-in-bybit/bybit-security-incident-timeline); [Calcalist](https://www.calcalistech.com/ctechnews/article/bjt11ar25kl); [bit2me](https://news.bit2me.com/en/Forensic-analysis-reveals-how-hackers-stole-from-Bybit)
- The narratives conflict. Bybit's timeline describes phishing of cold-wallet multisig signers with a spoofed Safe UI. Safe/Sygnia say malicious JS was injected via Safe's infrastructure after a developer machine was compromised. — [Bybit timeline](https://www.bybit.com/en/learn/this-week-in-bybit/bybit-security-incident-timeline); [DL News](https://www.dlnews.com/articles/defi/safe-wallet-compromise-behind-bybit-hack/)
- The FBI attributed it to DPRK and published 51 addresses. Elliptic and TRM got there first through wallet overlaps. — [The Hacker News](https://thehackernews.com/2025/02/bybit-hack-traced-to-safewallet-supply.html); [Max Avery (secondary)](https://www.maxavery.org/blog/bybit-the-largest-theft-in-the-asset-class-and-the-signing-interface-behind-it/)

**DMM Bitcoin (May 2024; ~$308M BTC)**
- The FBI, DoD Cyber Crime Center and Japan NPA attributed it to TraderTraitor. The joint attribution came out in Dec 2024, ~7 months after the theft. Entry: in late March 2024, a fake LinkedIn recruiter sent a Ginco employee a "coding test" that compromised their computer. In mid-May the attackers used session cookies to impersonate the employee in Ginco's communications system and manipulated a legitimate transaction request. DMM later shut down, and its accounts moved to SBI VC Trade (Mar 2025). — [BleepingComputer](https://www.bleepingcomputer.com/news/security/fbi-links-north-korean-hackers-to-308-million-crypto-heist/); [Security Affairs](https://securityaffairs.com/172290/hacking/dmm-bitcoin-308m-theft-linked-north-korea.html); [iTiger](https://www.itiger.com/news/2494816430)

**WazirX (Jul 18, 2024; ~$230–235M)**
- The multisig was 4-of-6: three WazirX keys plus one from custodian Liminal. WazirX blamed a discrepancy between the Liminal UI and the actual transaction. Liminal said its system was not compromised and pointed to three WazirX devices. ZachXBT flagged Lazarus markings early. A formal government attribution is claimed only in secondary or opinion sources. Victims are reportedly still not fully repaid. — [Wikipedia](https://en.wikipedia.org/wiki/2024_WazirX_hack); [Mudit Gupta blog](https://mudit.blog/wazirx-liminal-hacked-by-north-koreans/); [Unchained](https://unchainedcrypto.com/230-million-wazirx-hack-potentially-linked-to-lazarus-group-say-blockchain-researchers/); [Crypto Times](https://www.cryptotimes.io/opinion/wazirx-sponsors-2-crypto-events-in-1-week-235m-hack-victims-still-haven-t-been-paid/)

**Bitfinex 2016 (~119,756 BTC stolen; ~94,6xx BTC recovered in Feb 2022)**
- Recovery took ~5.5 years. The decisive break was off-chain, not on-chain. A search warrant on Lichtenstein's cloud storage yielded an encrypted file, which once decrypted held 2,000+ addresses and private keys. On-chain tracing alone had followed the funds but could not seize them. DOJ recommended the coins be returned to Bitfinex. I could not verify the date of the actual transfer. — [Wikipedia](https://en.wikipedia.org/wiki/2016_Bitfinex_hack); [SlowMist analysis](https://slowmist.medium.com/analysis-of-the-3-6-billion-recovered-by-the-u-s-government-from-the-2016-bitifnex-hack-46abc296342d); [parameter.io](https://parameter.io/federal-authorities-transfer-bitcoin-from-2016-bitfinex-breach-to-coinbase-prime/)

**Coinbase (disclosed May 2025; insider data breach, not an on-chain theft)**
- Criminals bribed overseas support agents to pull customer data for social engineering, then demanded a $20M extortion payment. Coinbase refused and offered a $20M bounty instead. Estimated costs were $180M–$400M. A Maine AG filing reports 69,461 customers affected. Reports say the agents were contracted through TaskUs, which I did not confirm from a primary source. — [Coinbase blog](https://www.coinbase.com/blog/protecting-our-customers-standing-up-to-extortionists); [The Register](https://www.theregister.com/2025/05/15/coinbase_extorted_for_20m_support/); [aurpay](https://aurpay.net/aurspace/coinbase-customer-data-leak-security-lessons/)

### Inferences
- In all six cases, HOW and WHERE was an off-chain identity, endpoint or signing-workflow compromise: a developer laptop (Binance, Safe/Bybit), a fake-recruiter malware test plus session-cookie theft (DMM/Ginco), signer UI mismatch (WazirX), insider bribery (Coinbase), or cloud-stored keys (Bitfinex recovery). On-chain tools answered WHO quickly but could not answer HOW. Root-cause disputes between counterparties (Bybit vs. Safe, WazirX vs. Liminal) suggest that neither side had tamper-evident, jointly trusted signing logs.
- WHEN gap: the on-chain WHEN is precise to the block. The off-chain WHEN (initial access, e.g. late March 2024 at DMM vs. a mid-May theft) came weeks or months later and only after government forensics.

### Gaps
- Detailed public timelines of when Binance's internal detection fired vs. when external parties (issuers, Blockaid, ZachXBT) flagged it are not yet available.
- I found no public Mandiant final report for Bybit/Safe.

## 4. Integration with enterprise security stacks (Splunk, Sentinel, CrowdStrike, SIEM/SOAR) and unified timelines

### Takeaway
I found no evidence of native Splunk, Sentinel or CrowdStrike connectors from Chainalysis/Hexagate, TRM or Hypernative, and no product that correlates endpoint, device and identity telemetry with signing events and on-chain movements in one timeline. Integrations that do exist are on-chain to on-chain (TRM to Hypernative) or compliance case management (Corsa). EDR vendors publish attack emulations (Elastic on Bybit), but nothing that maps those attacks to on-chain outcomes.

### Cited Findings
- A search for SIEM/SOAR integrations surfaced no crypto-vendor connectors. The only Splunkbase hit was a generic Splunk SOAR to Microsoft Sentinel app. — [Splunkbase app 6655](https://splunkbase.splunk.com/app/6655)
- The TRM–Hypernative integration is API-to-API with bring-your-own-key, for pre-transaction policy enforcement. — [TRM blog](https://www.trmlabs.com/resources/blog/trm-labs-and-hypernative-partner-to-deliver-pre-transaction-enforcement-and-on-chain-security-for-web3)
- Corsa integrates with Chainalysis KYT/Reactor and TRM for compliance case management. — [Corsa](https://corsa.finance/compare/chainalysis-vs-trm-vs-elliptic)
- Elastic Security Labs emulated the Bybit DPRK attack chain as endpoint detection content. — [Elastic](https://www.elastic.co/security-labs/threat-command/bit-bybit)
- Binance's initial account (an engineer device reaching a withdrawal-submitting service container) is exactly the chain that correlated EDR, identity and signing telemetry would show. Public reporting does not say whether such correlation existed internally. — [cryptoticker](https://cryptoticker.io/en/binance-hack-cause-devops-laptop/); [DEV Community](https://dev.to/suraj_nandan/binances-63b-breach-started-on-one-devops-laptop-what-developers-should-take-from-it-4073)

### Inferences
- The likely integration path today is custom: pull vendor alerts through webhooks or APIs and push them into a Splunk HEC or Sentinel data collector. Analysts then join them by hand to EDR and IdP logs. A product that ships this correlation natively, joining device to identity to signing request to broadcast tx to on-chain flow, would occupy a currently empty category.
- Large exchanges (Binance, Coinbase) almost certainly run in-house SIEM correlation, but nothing public describes it. The mid-market (funds, custodians, treasuries, smaller exchanges) is the plausible beachhead.

### Gaps
- I did not verify vendor API, webhook or syslog export docs (Hypernative, Hexagate, Blockaid, Cyvers, Forta) or any CrowdStrike/Mandiant crypto-specific offerings.
- In-house Coinbase and Binance security tooling is not publicly documented in the sources found.

## 5. Recovery and freezing rates; the role of speed

### Takeaway
Recovery is typically single-digit percent. About 8% of 2025 thefts were recovered or frozen, and only 0.4% of Q1 2025 hack losses. Binance 2026 is the major exception, with ~40–48% frozen within ~1 day. That happened because a large share of the loot was stablecoins that Tether and Circle could freeze immediately. Speed and asset type (freezable stablecoin vs. ETH/BTC) dominate outcomes.

### Cited Findings
- 2025 theft totaled $4.04B (PeckShield). Recovered or frozen: $334.9M (~8%), down from $488.5M in 2024. — [Yahoo Finance](https://finance.yahoo.com/news/2025-marks-worst-record-crypto-121306375.html)
- Q1 2025 recovery was $6.5M, or 0.4% of $1.64B lost (Immunefi; includes Bybit). — [proofoftalk](https://proofoftalk.io/blog/stolen-crypto-tracing-freezing-recovery/)
- Bybit: Tether froze $181K USDT on Feb 22. $42.89M was frozen by Feb 23. mETH recovered ~$43M of cmETH. By April 2025, 3.84% was frozen. — [Bybit timeline](https://www.bybit.com/en/learn/this-week-in-bybit/bybit-security-incident-timeline); [proofoftalk](https://proofoftalk.io/blog/stolen-crypto-tracing-freezing-recovery/)
- Binance 2026: frozen assets rose from $2.54B to ~$3B as verified by Binance. Tether froze >1.5B USDT (with 1.615B USDT taken from one hot wallet alone) and Circle froze >800M USDC. — [Al Jazeera](https://www.aljazeera.com/economy/2026/10/30/binance-says-2-54bn-in-crypto-funds-frozen-amid-potential-security-issue); [CNBC](https://www.cnbc.com/2026/10/30/billions-in-crypto-frozen-in-binance-hack-heres-what-happens-next-.html); [crypto.news](https://crypto.news/binance-hack-eip-7702-wallet-attack/)
- Bitget froze ~$1.1M of ~$388M stolen (~0.3%). — [Quartz](https://qz.com/bitget-frozen-funds-crypto-hack-recovery-100226)
- The FBI IC3 Recovery Asset Team froze $679,013,183 in 2025 (held for legal process, not yet returned). — [CoinLaw](https://coinlaw.io/crypto-scam-recovery-success-statistics/)
- T3 FCU frozen total: $100M (early milestone), $300M (Oct 2025), >$450M (May 2026). It went from $300M to $450M in under 7 months. Tether separately froze $344M USDT on TRON in April 2026, which is not counted in T3's total. — [The Block](https://www.theblock.co/post/401252/tether-tron-trm-labs-freeze-over-450-million-in-illicit-crypto-assets); [Cointelegraph](https://cointelegraph.com/news/tethers-t3-crime-unit-frozen-450m-in-suspected-illicit-crypto); [TRM blog](https://www.trmlabs.com/resources/blog/t3-financial-crime-unit-marks-enforcement-victory-100-million-in-criminal-assets-frozen-across-five-continents)
- TRM estimates illicit crypto flows hit a record $158B in 2025. — [The Block](https://www.theblock.co/post/401252/tether-tron-trm-labs-freeze-over-450-million-in-illicit-crypto-assets)
- The 2026 Sui/Cetus case recovered $157M after on-chain validator action. — [iTiger](https://www.itiger.com/news/2540734155)

### Inferences
- The Binance drain took ~20 minutes, and the Bybit and Binance hot-wallet sweeps finished in under 4 minutes. That means freezing depends on detection within minutes and on whether the asset has a central issuer. BTC and ETH cannot be frozen at issuance, so for Bitcoin losses the only levers are prevention at signing and fast exchange or OTC blocklisting. This strengthens the case for pre-broadcast, signing-layer detection on Bitcoin.
- Figures from different trackers (PeckShield, Immunefi, Chainalysis, TRM) use different methods and are not directly comparable.

### Gaps
- I found no systematic study linking time-to-detection with recovery percentage across incidents.
- I did not obtain Chainalysis's 2025 or mid-2026 crypto crime/hacks report figures, because the fetch to chainalysis.com was blocked.

## 6. Pricing, contract sizes, funding and revenue (2023–2026)

### Takeaway
TRM reached unicorn status in Feb 2026 ($70M Series C at $1B). Chainalysis's last primary valuation is still the May 2022 $8.6B round, while secondary-market data implies ~$1.55B in early 2026. Hypernative raised a $40M Series B (Jun 2025) and Blockaid a $50M Series B (Feb 2025). Public pricing is essentially non-existent; all are enterprise and sales-led.

### Cited Findings
- **TRM Labs:** $70M Series C at a $1B valuation, announced Feb 4, 2026 and led by Blockchain Capital, bringing total raised to ~$220M (Tracxn). Blockchain Capital cites ~50% annual revenue growth over four years. A less reliable profile claims a 150%+ revenue CAGR. Its Series B is reported as $60M (Blockworks) or $70M (iq.wiki). A Fortune article dated Sep 9, 2026 titled "trmlabs-valuation" suggests a newer valuation event, but I could not fetch it. FLAG: this may supersede the $1B figure. — [Fortune Feb 2026](https://fortune.com/2026/02/04/trm-labs-blockchain-analytics-funding-round-series-c-unicorn-goldman/); [Cointelegraph](https://cointelegraph.com/news/trm-labs-70m-investment-1b-crypto-unicorn); [Fortune Sep 2026 (unread)](https://fortune.com/2026/09/09/trmlabs-valuation/); [Blockworks](https://blockworks.co/news/trm-labs-lands-60-million-series-b-round)
- **Chainalysis:** The last reported primary valuation is $8.6B (May 2022), with ~$538M total raised over 11 rounds. Forge secondary data in early 2026 implies ~$1.55B. It had two rounds of layoffs totaling nearly 20% in 2023. Revenue estimates range from $87M (Latka) to $250M (2024) to $420M ARR, all unverified. Headcount estimates range from 797 to 994 in 2026. One unreliable brief claims a $300M Series F in Dec 2025, which is uncorroborated. — [Forge](https://forgeglobal.com/insights/how-to-invest-in-chainalysis-stock-pre-ipo/); [Tracxn](https://tracxn.com/d/companies/chainalysis/__GCLhkjeR0IhOaDoFfbCJLrCP7B-rPwSf_e3iGOFgOnI); [tokenizationcompliance (low reliability)](https://tokenizationcompliance.com/briefs/chainalysis-series-f-funding-round/)
- **Chainalysis M&A:** Alterya ~$150M (Jan 2025); Hexagate undisclosed (Dec 2024). — [SiliconANGLE](https://siliconangle.com/2025/01/13/crypto-analysis-firm-chainalysis-acquires-ai-powered-fraud-detection-startup-alterya-150m/)
- **Hypernative:** $40M Series B (Jun 2025), co-led by Ten Eleven and Ballistic Ventures. Its $16M Series A (Sep 2024) brought total funding to $27M before the B, so ~$67M after it. — [The Block](https://www.theblock.co/post/357627/crypto-security-startup-hypernative-series-b); [fintech.global](https://fintech.global/?p=173268)
- **Blockaid:** $50M Series B (Feb 18, 2025); ~$83M total over 4 rounds (CB Insights). I found no 2026 rounds for Blockaid or Hypernative. — [PYMNTS](https://www.pymnts.com/?p=2489604); [CB Insights](https://www.cbinsights.com/company/blockaid/financials)

### Inferences
- The Chainalysis down-round signal (secondary at ~18% of its 2022 mark) and TRM's $1B mark suggest that pure-play analytics multiples have compressed. Growth capital is going to real-time prevention (Hypernative, Blockaid) and response networks (Beacon, T3). That supports positioning a new entrant as prevention plus evidence rather than as another tracing tool.

### Gaps
- Elliptic's funding and revenue for 2023–2026 were not found. Background, unverified: Series C of $60M in 2022.
- I found no reliable public pricing or ACV data for Reactor, KYT, TRM, Elliptic, Hypernative or Blockaid. Industry anecdote puts enterprise analytics contracts at five to low-six figures per year, but I found no citable source.
- The contents of the Sep 2026 TRM valuation article could not be read.

## 7. Evidentiary standards: chain of custody, court admissibility, insurer requirements

### Takeaway
US courts have accepted Chainalysis Reactor tracing under Daubert (US v. Sterlingov / Bitcoin Fog). The D.C. Circuit reportedly affirmed without requiring disclosure of the source code. However, the rulings leaned on corroborating off-chain evidence, and critics note that error rates have not been peer-reviewed. For insurance, evidence must tie on-chain artifacts (tx hashes, block heights) to off-chain logs (logins, withdrawal approvals) with a verifiable chain of custody. I found no insurer-published standard.

### Cited Findings
- Judge Randolph Moss admitted Reactor-based testimony (from an FBI analyst and a Chainalysis employee) under Daubert. The pretrial opinion (704 F. Supp. 3d 176) called Reactor's methods "highly reliable, and if anything, conservative". The court stressed that Reactor's reliability was corroborated by other evidence: materials in Sterlingov's possession, forum posts, IP analyses and traditional tracing. — [Stout](https://www.stout.com/en/insights/article/judicial-scrutiny-chainalysis); [CourtListener filings](https://storage.courtlistener.com/recap/gov.uscourts.dcd.232431/gov.uscourts.dcd.232431.259.0_2.pdf); [Norton Rose Fulbright](https://nortonrosefulbright.com/-/media/files/nrf/nrfweb/knowledge-pdfs/us_59864_reprint--when-blockchain-analytics-meet-the-daubert-test_r3.pdf)
- On appeal (D.C. Cir. No. 24-3161), Sterlingov challenged both the Daubert ruling and the denial of access to Reactor's source code. A ChainArgos amicus brief was filed. Secondary reports say the conviction was upheld and the court found he had not shown why the source code was material. The decision is reportedly dated Sep 25 and described as case-specific. A Crowdfund Insider item dated Jul 2026 also covers the ruling. I did not read the opinion itself. — [CourtListener appellate docket](https://storage.courtlistener.com/recap/gov.uscourts.cadc.41492/gov.uscourts.cadc.41492.01208825487.0.pdf); [CryptoSlate](https://cryptoslate.com/bitcoin-fog-appeal-upheld-wallet-tracing-without-requiring-its-source-code/); [Crowdfund Insider](https://www.crowdfundinsider.com/2026/07/291575-chainalysis-reactor-satisfies-daubert-standard-for-expert-testimony-in-bitcoin-fog-case/)
- Critics argue that Reactor's code and error rates were not peer-reviewed and that clustering heuristics are proprietary trade secrets. — [criminal defense blog](https://criminaldefenseattorneytampa.com/?p=63804); [The Rage (Tornado Cash trial)](https://www.therage.co/tornado-cash-trial-blockchain-surveillance-reliability/)
- In New York, blockchain data is admissible as a business record only if the proponent establishes the chain of custody and the reliability of the maintaining system. — [Daeryun Law](https://www.daeryunlaw.com/us/insights/insurance-defense-blockchain-defense-in-new-york)
- Practitioner guidance for crypto claims: screenshots and exports are insufficient without tx hashes, block heights, timestamps and the retrieval/validation method. Off-chain records (KYC, login logs, withdrawal confirmations) are also needed. Per-evidence custody logs with integrity hashes are recommended, citing ISO/IEC 27037 and NIST SP 800-86. LOW RELIABILITY: these pages sit under an "elliptic.co/corpus/..." path that looks like auto-generated SEO content, with unrelated paths such as "climate-change-in-alberta". Treat as indicative only. — [Elliptic corpus: crypto theft coverage](https://www.elliptic.co/corpus/gen-3413/cyber-insurance/crypto-theft-and-cyber-extortion-coverage-using-blockchain-analytics-to-support-claims-and-recovery.html); [Elliptic corpus: underwriting](https://www.elliptic.co/corpus/gen-3413/cyber-insurance/underwriting-cyber-insurance-for-crypto-businesses-control-evidence-on-chain-loss-scenarios-and-premium-drivers.html); [knogin](https://knogin.com/en/developers/blockchain-forensic-reporting)
- The same sources claim that custody model drives premiums and terms, and that a missing verifiable chain of custody is a primary reason claims are denied. These are vendor claims, unverified. — [Elliptic corpus](https://www.elliptic.co/corpus/gen-3413/cyber-insurance/underwriting-cyber-insurance-for-crypto-businesses-control-evidence-on-chain-loss-scenarios-and-premium-drivers.html)

### Inferences
- Sterlingov shows that courts accept heuristic on-chain attribution when off-chain evidence corroborates it. A product that captures off-chain telemetry tamper-evidently (hash-chained, timestamped, possibly anchored on-chain) and links it to on-chain events would produce exactly the corroboration package that courts and insurers lean on. It would also ease the counterparty root-cause disputes seen in Bybit/Safe and WazirX/Liminal.

### Gaps
- I found no insurer-published proof-of-loss form or underwriting questionnaire (Lloyd's syndicates, Coincover, Evertas, Marsh, Aon) for digital-asset theft.
- The full text of the D.C. Circuit Sterlingov opinion was not reviewed, and its date is uncertain (Jul vs. Sep 2026 across sources).
- I found no ruling outside the US (UK, EU, Japan, India) on the admissibility of blockchain analytics.

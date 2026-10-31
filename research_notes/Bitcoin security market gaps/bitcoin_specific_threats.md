# Bitcoin-Specific and Emerging Security Threats (2023 - Oct 2026)

Method note: research was done Oct 31, 2026 using web search. Direct page fetches failed for dlnews.com, coindesk.com and trmlabs.com because those domains are blocked in this session's network settings. Many figures below therefore come from search-result snippets and secondary coverage, not from full primary documents. Confidence is flagged where it matters. "Confirmed" means a real-world incident was reported. "Theoretical" means a demonstrated or proposed attack with no confirmed real-world exploitation found.

## 1. Physical coercion / "wrench attacks" and KYC data leaks

### Takeaway
2025 was the worst year on record for wrench attacks. Counts run from about 55 to more than 70 depending on the tracker, up roughly 75% on 2024. France is the epicenter. 2026 is on pace to match or exceed 2025, with 41-47 kidnappings counted by mid/late 2026. Leaked KYC and customer data, including the 2025 Coinbase insider leak, is widely blamed for helping attackers pick targets. A documented causal chain from a specific leak to a specific physical attack was not found in this session.

### Cited Findings
- 2025 was a record year. Jameson Lopp's database reportedly logged more than 70 attacks in 2025. CertiK logged 72 verified physical coercion incidents globally, +75% vs 2024. TRM Labs counted about 55. Reported 2025 losses were about $41M. The trackers use different definitions — [DL News](https://www.dlnews.com/articles/regulation/crypto-wrench-attacks-to-surge-following-a-violent-2025/); [Yahoo/News: "$41M in Losses as Crypto Wrench Attacks Hit Record High in 2025"](https://www.yahoo.com/news/articles/41m-losses-crypto-wrench-attacks-140102565.html)
- By mid-2025, France had seen its 10th wrench attack of the year, out of at least 32 worldwide at that point — [The Block](https://www.theblock.co/post/359010/france-hit-by-10th-crypto-wrench-attack-of-2025-as-kidnappers-target-23-year-old-near-paris)
- France: a national anti-organized-crime police unit reportedly counted 18 incidents in 2024 and 67 in 2025. CertiK counted 19 verified French cases, the most in Europe. The large gap points to different definitions, such as including attempts and extortion — [KuCoin News (France epicenter)](https://www.kucoin.com/news/flash/france-emerges-as-epicenter-of-crypto-wrench-attacks-amid-kyc-and-data-leak-concerns); [TradeBlock](https://tradeblock.com/news/france-crypto-wrench-attacks/)
- Signature case: in January 2025, Ledger co-founder David Balland and his wife were kidnapped in France. A finger was severed and the kidnappers demanded €10M in crypto. A 48-hour manhunt led to 10 arrests — [DL News](https://www.dlnews.com/articles/regulation/crypto-wrench-attacks-to-surge-following-a-violent-2025/)
- Law-enforcement response: about 80-88 suspects were charged in France by about April 2026, including minors. The 88 figure is from a secondary source and was not verified — [Bitcoin Foundation news](https://bitcoinfoundation.org/news/crimes-and-fraud-news/france-vs-crypto-kidnappers/). French police arrested 6 people over the crypto-ransom kidnapping of a magistrate — [CT](https://ct.com/news/french-police-arrest-six-suspects-over-crypto-ransom-kidnapping-of-magistrate)
- 2026 year to date: Joe Nakamoto's tally reportedly counts 41 crypto-linked kidnappings, and another tracker counts 47. Both are provisional, from search-result summaries — [DL News](https://www.dlnews.com/articles/regulation/crypto-wrench-attacks-to-surge-following-a-violent-2025/)
- Data leaks as a targeting input: a French tax-authority data breach affecting hundreds of thousands of people prompted warnings to Bitcoiners about wrench-attack targeting — [CryptoRank](https://cryptorank.io/news/feed/64596-bitcoiners-warned-of-wrench-attacks). Commentary ties France's attack wave to KYC and data-leak concerns — [KuCoin News](https://www.kucoin.com/news/flash/france-emerges-as-epicenter-of-crypto-wrench-attacks-amid-kyc-and-data-leak-concerns)
- Coinbase 2025 insider leak: 69,461 individuals were affected (Maine AG filing). The breach ran from Dec 26, 2024 to May 11, 2025. Overseas support contractors in India were bribed. Data taken included names, home addresses, phone numbers, emails, last 4 digits of SSNs, masked bank details, government ID images and account balances/history. Attackers demanded a $20M ransom, which Coinbase refused and instead set up a $20M bounty. Coinbase projected $180-400M in costs. The data was used for social-engineering impersonation of Coinbase — [The Register](https://www.theregister.com/2025/05/21/coinbase_confirms_insider_breach_affects/); [Help Net Security](https://www.helpnetsecurity.com/2025/05/15/coinbase-suffers-data-breach-gets-extorted/); [The Hacker News](https://thehackernews.com/2025/05/coinbase-agents-bribed-data-of-1-users.html)
- No search results documented physical attacks traced specifically to the Coinbase leak. The "will lead to people dying" claim was an opinion posted on X — [Engadget](https://www.engadget.com/cybersecurity/extortionists-bribed-coinbase-employees-to-give-them-customer-data-174713732.html)

### Inferences
- Wrench attacks have shifted from rare celebrity-targeted events to an organized-crime business line, especially in France, with youth recruitment and outsourced violence. Their growth (+75% YoY) outpaces most digital theft categories.
- Home addresses plus balance data from exchange leaks (Coinbase 2025, Ledger 2020) and government leaks are a target list. KYC databases have become a physical-security liability for holders.
- Market gap: products that reduce coercion payoff are niche. These include time-locked or vault spending with delays, decoy wallets, geographically distributed multisig keys, duress PINs, privacy-preserving address and identity hygiene services, and executive-protection-style services for mid-tier holders. Mainstream hardware wallets offer little beyond passphrase "hidden wallets". Insurers rarely cover kidnap-for-crypto explicitly. No mainstream product removes a holder's own ability to sign under duress while keeping usability.

### Gaps
- Lopp's GitHub tracker (github.com/jlopp/physical-bitcoin-attacks) could not be fetched directly, so exact yearly counts for 2023 and 2024 (often cited as roughly 20-40 a year) are unverified here.
- No 2026 full-year US case count was found. US cases, such as home invasions and the 2025 New York townhouse kidnapping/torture case, were not verified in this session.
- Dollar losses per incident and the share of attacks linked to leaked KYC data are not systematically measured by any source found.

## 2. Address poisoning, clipboard malware, infostealers, SIM-swap, drainers, pig butchering, Bitcoin ATM scams

### Takeaway
Losses from fraud and social engineering against individuals now exceed technical hacks for retail and high-net-worth holders. The FBI IC3 recorded $11.37B in crypto-related losses in 2025, +22%. Of that, $7.2B was crypto investment fraud ("pig butchering") and $389M came from crypto ATM fraud (+58%). Chainalysis shows personal-wallet compromises as a rising share of theft. Infostealer malware such as Lumma persists despite takedowns.

### Cited Findings
- FBI IC3 2025 report: 181,565 crypto-related complaints (+21%) with losses of $11.367B (+22%), a record. Crypto investment fraud accounted for 61,559 complaints and about $7.228B in losses (complaints +48%, losses +25%). Crypto ATM/kiosk losses were about $389M (+58%) from about 13,460 complaints (+23%). Recovery scams drew about 10,500 complaints and about $1.4B in losses. People aged 60+ lost $7.7B across all categories. Total internet-crime losses were $20.9B — [ASIS Security Management](https://www.asisonline.org/security-management-magazine/latest-news/today-in-security/2026/april/cryptocurrency-scams/); [TheStreet](https://www.thestreet.com/crypto/markets/fbi-reports-22-rise-in-crypto-fraud-losses-in-2025); [AARP](https://www.aarp.org/money/scams-fraud/fbi-ftc-report-2025-losses/); [Adams and Reese](https://www.adamsandreese.com/the-ledger/fbi-releases-2025-internet-crime-report-key-takeaways-for-the-payments-industry)
- Chainalysis put total crypto theft at about $3.4B in 2025, through early December — [The Block](https://www.theblock.co/post/382477/crypto-hack-2025-chainalysis)
- Personal-wallet compromises grew from 7.3% of stolen value in 2022 to 44% in 2024. They were 23.35% of stolen funds in H1 2025, because the $1.5B Bybit hack inflated the denominator — [The Block](https://www.theblock.co/post/382477/crypto-hack-2025-chainalysis); [Chainalysis mid-year 2025](https://www.chainalysis.com/blog/2025-crypto-crime-mid-year-update/)
- 2025 personal-wallet compromises reached about 158,000 incidents with at least 80,000 unique victims — [The Block](https://www.theblock.co/post/382477/crypto-hack-2025-chainalysis). A secondary source puts 2025 personal-wallet losses at $713M, down from $1.5B in 2024. This is unverified against Chainalysis — [CoinLaw](https://coinlaw.io/crypto-wallet-ecosystem-statistics/)
- Chainalysis noted that funds stolen from personal wallets increasingly stay on-chain in attacker addresses rather than being laundered immediately — [Chainalysis mid-year 2025](https://www.chainalysis.com/blog/2025-crypto-crime-mid-year-update/)
- Address poisoning: attempts reportedly rose from 628K in Nov 2025 to 3.4M in Jan 2026 (5.5x), per Blockaid data. The source is secondary and has dating problems, so treat as low confidence — [Web3FuturePro](https://web3futurepro.com/crypto-wallet-security-2027/). There is also an academic analysis of address-poisoning funding and laundering on Ethereum — [arXiv 2609.23405](https://arxiv.org/pdf/2609.23405)
- Lumma Stealer: in May 2025, Microsoft's Digital Crimes Unit, Europol and partners seized about 2,300 domains. Lumma had infected about 394,000 Windows PCs between Mar 16 and May 16, 2025. It targets crypto wallets including Electrum, MetaMask and Binance, and includes clipboard-hijack ("clipper") functionality — [ITPro](https://www.itpro.com/business/394-000-windows-devices-have-been-infected-with-lumma-stealer-malware-now-microsoft-is-hitting-back); [Nextgov](https://www.nextgov.com/cybersecurity/2025/05/us-international-and-industry-partners-topple-infrastructure-popular-info-stealer-malware/405466); [CPO Magazine](https://cpomagazine.com/cyber-security/raid-on-lumma-infostealer-malware-results-in-seizure-of-control-panel-2300-domains)
- Lumma rebounded after the takedown. Trend Micro reportedly saw pre-takedown targeting volumes again by July 2025. In 2026 it was being distributed via fake pirated movie downloads, per Bitdefender. The rebound sources are secondary — [Crypto Briefing](https://cryptobriefing.com/lumma-stealer-malware-odyssey-crypto-wallets/); [Tech-Insider](https://tech-insider.org/?p=12008)

### Inferences
- For individuals, the dominant loss vectors by dollar value are social engineering (investment and romance fraud, impersonation, recovery scams), not cryptographic breaks. Elderly holders and ATM channels are disproportionately hit.
- Address poisoning and clipboard swapping exploit the fact that humans verify only the first and last characters of an address. Wallets have only partial defenses, such as address books, poisoning warnings and human-readable names like BIP-353 DNS payment instructions.
- Market gap: there is no widely deployed "transaction firewall" or co-signer for Bitcoin self-custody that screens destinations against poisoning or scam clusters and enforces cooling-off delays, comparable to bank fraud controls. EVM wallets have more simulation and screening tools (Blockaid and similar). Bitcoin wallets lag. Family "trusted contact" and elder-protection features are almost absent.

### Gaps
- No Bitcoin-specific breakdown was found. FBI and Chainalysis figures mix BTC, ETH and stablecoins, and pig butchering increasingly uses USDT.
- No reliable 2025-2026 SIM-swap loss figures were found. The FBI IC3 SIM-swap category was not retrieved.
- No quantified losses from fake wallet apps, such as fake Ledger Live/Electrum apps in app stores, were found in this session.
- Chainalysis's 2026 Crypto Crime Report and any 2026 mid-year update were not retrieved directly.

## 3. Hardware wallet and supply-chain risks

### Takeaway
2026 brought the largest confirmed hardware-wallet failure to date. A Coldcard random-number-generation flaw introduced in a March 2021 firmware change has been linked to about 1,816 BTC (about $116M) swept from 5,200 to 7,700+ addresses in waves starting July 30, 2026. Together with Milk Sad (2023) and the Sept 2025 npm address-swap compromise, it shows that entropy (seed randomness) and software supply chains are the weak points of self-custody. Seeds made with affected firmware cannot be fixed by an update and must be migrated to new ones.

### Cited Findings
- Coldcard flaw (confirmed, 2026): a March 2021 firmware change routed seed generation through a software PRNG instead of the hardware RNG. It affects Mk2/Mk3 on firmware 4.0.0-4.1.9 and reportedly all production firmware on Mk4, Mk5 and Q — [Ryder: Coldcard entropy incident explained](https://ryder.id/blogs/post/coldcard-entropy-incident-explained); [No BS Bitcoin](https://www.nobsbitcoin.com/coldcard-disaster-weak-entropy-bug-enables-drain-of-funds-from-cold-storage-wallets/); [Noqta](https://noqta.tn/en/news/coldcard-rng-firmware-flaw-bitcoin-theft-2026)
- Sweeps began July 30, 2026. One wave swept 1,196 addresses in 41 minutes, moving 1,082.65 BTC. Galaxy Research initially linked 3 waves, about 1,367 BTC (about $88.6M) and 4,585 addresses. The later running tally from TRM and Galaxy was about 1,816 BTC (about $116M) from 5,200+ addresses across 4 waves. Other reports cite 7,300-7,700+ addresses, and estimates range up to $130M — [TRM Labs](https://www.trmlabs.com/resources/blog/the-largest-hardware-wallet-exploit-of-2026-inside-the-usd-116-million-coldcard-hack); [KuCoin blog](https://www.kucoin.com/blog/coldcard-seed-generation-flaw-bitcoin-security); [BingX flash](https://bingx.com/en/flash-news/post/coldcard-seed-generation-bug-tied-to-up-to-m-bitcoin-drain-as-btc-moved-across-addresses); [Bitcoin Well (cites $38M at an earlier point)](https://bitcoinwell.com/blog/the-coldcard-hack-a-timeline-of-the-dollar38m-entropy-failure-and-how-to-keep-it-from-happening-to-you); [Crystal Intelligence tracing](https://crystalintelligence.com/investigations/coldcard-exploit-tracing-stolen-bitcoin/)
- Caveat: one analysis notes that no public report has shown end-to-end reconstruction of a specific victim's mnemonic matched to a drained address, so attribution to the RNG flaw is strongly suspected but not formally proven. A firmware update fixes only new seeds — [Wublock Substack](https://wublock.substack.com/p/coldcards-five-year-vulnerability); [KuCoin blog](https://www.kucoin.com/blog/coldcard-seed-generation-flaw-bitcoin-security)
- Milk Sad (confirmed, 2023): Libbitcoin Explorer 3.x `bx seed` used a Mersenne Twister PRNG seeded with 32 bits of system time, so only about 4 billion seeds were possible. A theft on July 12, 2023 took about 30 BTC (about $850K, often reported as "$900K"). Distrust disclosed it on Aug 7-8, 2023. Libbitcoin called it "reckless wallet development", not a bug — [Milk Sad disclosure via No BS Bitcoin](https://nobsbitcoin.com/milk-sad-vulnerability-disclosure); [crypto.news](https://crypto.news/libbitcoin-vulnerability-leads-to-900k-theft-from-bitcoin-wallets); [Cointelegraph](https://cointelegraph.com/news/newly-discovered-bitcoin-wallet-loophole-let-hackers-steal-funds-slow-mist); [milksad.info mirror](https://git.distrust.co/milksad/website-public/src/commit/b5084bb9b55c3ffadcd0f4ae13699d248a1f9374/index.md)
- npm compromise (confirmed, Sept 8, 2025): a maintainer was phished, including a live TOTP code. 18 to 20+ packages were trojanized, including chalk, debug, ansi-styles and strip-ansi, which together see about 2B weekly downloads. The browser payload swapped crypto addresses for lookalike attacker addresses before signing. It spread to DuckDB packages on Sept 9. Vercel found 70 teams and 76 projects with builds containing the bad versions — [Semgrep](https://semgrep.dev/blog/2025/chalk-debug-and-color-on-npm-compromised-in-new-supply-chain-attack/); [Vercel](https://vercel.com/blog/critical-npm-supply-chain-attack-response-september-8-2025); [Qualys](https://blog.qualys.com/vulnerabilities-threat-research/2025/09/10/when-dependencies-turn-dangerous-responding-to-the-npm-supply-chain-attack); [StepSecurity](https://www.stepsecurity.io/blog/20-popular-npm-packages-compromised-chalk-debug-strip-ansi-color-convert-wrap-ansi); [OPSWAT](https://www.opswat.com/blog/2-billion-npm-downloads-at-risk-from-crypto-malware-a-wake-up-call-for-open-source-supply-chain-security)

### Inferences
- Users cannot audit entropy. Single-vendor seed generation is a systemic risk even for the most trusted "Bitcoin-only" devices. The Coldcard incident is likely to push demand toward multi-vendor multisig, user-supplied entropy such as dice rolls, and independent entropy-verification tools.
- Malicious-firmware nonce exfiltration ("Dark Skippy", see Gaps) is theoretical. It shows that one compromised signer can leak a seed through ordinary signatures. Anti-exfil signing protocols exist on only a few devices, such as BitBox02 and Blockstream Jade.
- Market gap: independent attestation and auditing of hardware-wallet RNG and firmware, seed-provenance verification ("was this seed generated on vulnerable firmware?"), and easy, guided seed-rotation and migration services for affected users.

### Gaps
- Dark Skippy: background knowledge, not verified in this session's searches, says it was disclosed in Aug 2024 by Lloyd Fournier, Nick Farrow and Robin Linus. Malicious signer firmware embeds seed data in low-entropy nonces, letting an attacker recover a 12-word seed from about 2 signatures. No real-world exploitation is known. A primary source is needed before citing (likely darkskippy.com).
- Ledger Connect Kit compromise (Dec 14, 2023, roughly $600K drained via a malicious npm release after a former employee was phished): background knowledge only, not verified via sources in this session.
- Trust Wallet's 2023 WebAssembly entropy flaw: not verified in this session.
- The Ledger 2020 customer database leak (about 270K physical addresses) was not re-sourced here.

## 4. Miner and mining-pool threats

### Takeaway
Pool concentration remains high. Foundry has 24-37% depending on the time window, and Foundry plus AntPool produce about half of blocks. Stratum V2, which lets individual miners choose the transactions in their blocks, has broad pool sign-on (7 pools with about 75% of hashrate joined the working group in May 2026), but production use is only about 3-5% of hashrate (some estimates go up to 15-20%). Stratum V2 helps against transaction censorship and hashrate hijacking, but it does not reduce pool concentration.

### Cited Findings
- Foundry's share is about 24% (Sept 2026 comparison), about 34% (May 2026 Hashrate Index) and about 37% (early 2026, per one source). Foundry plus AntPool are about 51% of blocks. AntPool may operate as a "pool of pools", which would understate its effective share — [SimpleMining](https://www.simplemining.io/insights/post/best-bitcoin-mining-pools); [bestinfocrypto](https://bestinfocrypto.com/news/2026/05/seven-mining-pools-controlling-75-of-bitcoin-hashrate-back-stratum-v2/); [Blofin](https://blofin.com/en/academy/education/bitcoin/what-are-bitcoin-mining-pools); [OneMiners](https://oneminers.com/blogs/news/bitcoin-mining-pool-centralization-stratum-v2-2026); [Spark](https://www.spark.money/research/bitcoin-mining-centralization-pool-risks)
- In May 2026, Foundry, AntPool, F2Pool, SpiderPool, MARA Pool, Block Inc. and DMND, about 75% of hashrate together, joined the Stratum V2 working group — [cryptonews](https://cryptonews.net/news/mining/32839834/)
- Production Job Declaration use is about 3-5% of hashrate (Braiins, DMND). As of Oct 2026, no public native SV2 support was confirmed at Foundry or AntPool. Spark estimates 15-20% of hashrate uses SV2 "in some form" — [OneMiners](https://oneminers.com/blogs/news/bitcoin-mining-pool-centralization-stratum-v2-2026); [Shattered](https://shattered.io/stratum-v2-mining-setup-2026/); [Spark pool comparison](https://www.spark.money/tools/bitcoin-mining-pool-comparison)

### Inferences
- Stratum V1 sends traffic unencrypted. That leaves hashrate exposed to man-in-the-middle and BGP-hijack redirection, where an attacker steals the hashrate. Stratum V2's encryption and authentication address this, but adoption lags, so most hashrate is still exposed in principle.
- Concentration in 2-3 pools, many tied to a few jurisdictions and to US-listed miners subject to OFAC, creates censorship and regulatory-coercion risk rather than classic 51% theft risk.
- Market gap: ASIC firmware integrity (attested boot and signed firmware for third-party firmware), monitoring of pool connections against hijacking, and turnkey SV2 Job Declaration for mid-size miners.

### Gaps
- No 2023-2026 incident data was found on BGP hijacks of mining pools or on ASIC firmware malware. Earlier known cases (2014 BGP hashrate theft, Antbleed 2017) are outside the date range and were not re-sourced.
- No quantified figures were found on ransomware or physical theft affecting mining sites.

## 5. Lightning Network vulnerabilities

### Takeaway
The replacement cycling attack, disclosed by Antoine Riard in Oct 2023, was mitigated in all major implementations (CVE-2023-40231 to 40234) through monitoring and aggressive rebroadcasting. Riard considered the fixes incomplete. As of mid-2026, no verified theft using it had been reported. Channel jamming remains a known, largely unsolved denial-of-service problem. Hot-wallet key exposure is the dominant practical risk for node operators.

### Cited Findings
- Replacement cycling was disclosed in Oct 2023. Patches shipped in LDK, Eclair, LND and Core Lightning (CVE-2023-40231 to CVE-2023-40234). Riard doubted the mitigations' completeness against advanced variants and stepped back from Lightning development — [The Block](https://www.theblock.co/post/258871/developer-exposed-potential-security-issue-on-the-lightning-network); [bitcoindev mailing list](https://mirror.b10c.me/lists/bitcoindev/CALZpt+FSn6ox9cnDVuWX0pjR-R_mxQCRTORR_XiPDEOVkx9YsA@mail.gmail.com); [Bitcoin Magazine postmortem](https://bitcoinmagazine.com/technical/postmortem-on-the-lightning-replacement-cycling-attack)
- As of mid-2026, no verified replacement-cycling theft had been publicly reported. TRUC/v3 transactions (Bitcoin Core 28.0) and anchor outputs reduce pinning but do not directly address replacement cycling. The source is a vendor glossary — [Spark glossary](https://www.spark.money/glossary/replacement-cycling)

### Inferences
- Lightning routing nodes must keep keys hot and online, so node compromise means immediate loss of channel funds. Watchtower and remote-signer setups, such as VLS (Validating Lightning Signer), are not yet mainstream.
- Market gap: managed security for Lightning nodes (remote and HSM signing, watchtower-as-a-service, jamming-resistant routing reputation), especially for businesses using Lightning for payments.

### Gaps
- No 2025-2026 reporting was found on channel-jamming mitigations such as HTLC endorsement/reputation, upfront fees or their deployment status.
- No aggregate data was found on losses from Lightning node hot-wallet compromises.

## 6. Bitcoin node / network: eclipse attacks, Core CVEs, BIP-324

### Takeaway
Bitcoin Core has adopted a regular disclosure policy, and in October 2026 it disclosed three LLM-discovered denial-of-service and memory vulnerabilities, fixed in 29.5, 30.4, 31.2 and 32.1. These were node-crash bugs, not consensus or theft bugs. The use of AI to find vulnerabilities is an emerging dynamic that will likely speed up disclosures, and attackers could use the same tools.

### Cited Findings
- On Oct 28-30, 2026, Bitcoin Core disclosed three vulnerabilities found by an LLM-assisted project. The coverage refers to it as "Project Loupe". All are fixed in 29.5, 30.4, 31.2 and 32.1 — [AIcybr](https://aicybr.com/blog/bitcoin-core-project-loupe-ai-found-vulnerabilities-october-2026)
  - CVE-2026-117350: a peer can exhaust memory and crash nodes on Windows, macOS or BSD. Linux is not affected. CVSS 5.3 — [VulDB](https://vuldb.com/vuln/429118); [Strix](https://www.strix.ai/cve/CVE-2026-117350)
  - CVE-2026-117349: an out-of-memory issue involving pre-BIP31 or paused peers that accumulate outbound messages — [OffSeq Radar](https://radar.offseq.com/threat/cve-2026-117349-bitcoin-core-prior-to-295-304-312-and-321-is-vulnerable-to-an-oom-issue-f3827d53050daaed)
  - CVE-2026-117346: descriptions conflict. One calls it DoS through unbounded undo files, another a 32-bit type overflow — [Strix](https://www.strix.ai/cve/CVE-2026-117346); [cve.imfht mirror](https://cve.imfht.com/intel/886663)
- A policy change merged Oct 22, 2026 allows earlier disclosure of "readily discovered" vulnerabilities alongside fixes for each maintained version. This raises patch-lag risk for node operators — [Bitbase](https://www.bitbase.com/news/bitcoin-core-will-disclose-some-bugs-sooner-can-node-operators-update-in-time)
- A remote-crash DoS in Bitcoin Core has also been reported — [SecurityOnline](https://securityonline.info/bitcoin-core-dos-vulnerability/)

### Inferences
- Faster disclosure combined with AI-assisted bug finding shortens the window between disclosure and exploitation. Businesses running nodes (exchanges, custodians, Lightning operators) need patch processes. Many self-hosted node users and node-in-a-box products update slowly.
- BIP-324 (encrypted v2 P2P transport, enabled by default since Core 27.0 per background knowledge) makes passive surveillance and tampering by internet providers harder. It does not prevent eclipse attacks.

### Gaps
- Earlier 2024-2025 Core advisories (the 2024 batch of disclosures for versions before 25.0 and similar) and the BIP-324 adoption rate were not retrieved in this session.
- No new academic eclipse-attack results from 2023-2026 were found.

## 7. Quantum computing threat

### Takeaway
2026 sharply tightened quantum timelines. A March 2026 Google Quantum AI paper (with the Ethereum Foundation and Stanford) estimated that breaking secp256k1 needs about 1,200-1,450 logical qubits and fewer than 500K physical qubits, roughly 20x fewer than earlier estimates. Later papers (Caltech/Oratomic, Georgia Tech) push estimates lower still. About 6.99M BTC (Project Eleven) sit in addresses whose public keys are already exposed. BIP-360 (P2MR) was merged into the BIP repository in Feb 2026 but is not activated. BIP-361 (Apr 2026) proposes freezing vulnerable coins and is highly contentious. No quantum computer can attack Bitcoin today; Google's Willow chip has 105 qubits.

### Cited Findings
- Google Quantum AI (arXiv 2603.28846, Mar 2026): secp256k1 ECDLP fits in ≤1,200 logical qubits and 90M Toffoli gates, or ≤1,450 logical qubits and 70M Toffoli gates. That translates to fewer than 500,000 physical superconducting qubits at a 10^-3 error rate, about 20x below prior estimates. Some coverage cites runtimes of minutes (a "9 minutes" scenario) under conditional assumptions — [alphaXiv: 2603.28846](https://www.alphaxiv.org/abs/2603.28846v1); [Forbes, Mar 31 2026](https://www.forbes.com/sites/digital-assets/2026/03/31/google-finds-quantum-computers-could-break-bitcoin-sooner-than-expected/); [Safeheron analysis](https://safeheron.com/blog/google-quantum-whitepaper/); [PostQuantumSecurity.org](https://www.postquantumsecurity.org/publications/google_ai_ecc_whitepaper.html)
- Willow, Google's most advanced chip, has 105 qubits, so no device can run the attack today — [Safeheron](https://safeheron.com/blog/google-quantum-whitepaper/); [QubitChain](https://qubitchain.io/blog/how-many-qubits-to-break-bitcoin-ecdsa-2026)
- A Caltech/Oratomic paper suggests as few as about 10,000 neutral-atom qubits using qLDPC codes. A Georgia Tech paper (Sept 2026) reports further reductions for P-256 and secp256k1 — [TechTimes](https://www.techtimes.com/articles/327545/20260915/elliptic-curve-encryptions-quantum-attack-cost-falls-two-fronts-georgia-tech-paper.htm); [Quantum Zeitgeist](https://quantumzeitgeist.com/google-quantum-attack-bitcoin-estimates-closer/)
- Exposure: Project Eleven's scan found about 6.99M BTC in addresses with exposed public keys. BIP-361 authors put exposure above one-third of supply. Satoshi-era coins (about 1.1M BTC) sit in P2PK outputs — [Forbes, Aug 2 2026](https://www.forbes.com/sites/boazsobrado/2026/08/02/that-is-the-end-of-bitcoin-the-quantum-race-for-470-billion/); [CoinDesk, Jul 19 2026](https://www.coindesk.com/tech/2026/07/19/bitcoin-s-quantum-problem-gets-a-recovery-tool-but-not-for-satoshi-s-1-1-million-coin); [Shattered (claims about 7M)](https://shattered.io/bitcoin-quantum-risk-bip-360-2026/)
- BIP-360 began as P2QRH (Hunter Beast; later co-authors Ethan Heilman and Isabel Foxen Duke) and was renamed P2MR (Pay-to-Merkle-Root). It removes Taproot's key-path spend so outputs commit only to a script Merkle root. It was merged into the BIP repository around Feb 11, 2026. It has no activation timeline, and it does not add post-quantum signatures itself — [Cointelegraph](https://cointelegraph.com/news/bitcoin-s-quantum-upgrade-path-what-bip-360-changes-and-what-it-does-not); [Ledger Academy](https://www.ledger.com/academy/glossary/bip-360-pay-to-merkle-root-p2mr); [crypto.jobs](https://crypto.jobs/news/bitcoin-protocol-teams-advance-quantum-resistance-work-with-bip-360-proposal); [crypto.news](https://crypto.news/bitcoin-is-going-quantum-proof-inside-bip-360-and-the-migration/)
- BIP-361 (Apr 2026, draft) would block new deposits to vulnerable address types after 3 years and freeze remaining vulnerable coins after 5 years. It depends on BIP-360. Critics call it "confiscation, full stop" — [KuCoin blog](https://www.kucoin.com/blog/bip-361-explained-bitcoin-new-plan-to-survive-quantum-computing); [CoinDesk](https://www.coindesk.com/tech/2026/07/19/bitcoin-s-quantum-problem-gets-a-recovery-tool-but-not-for-satoshi-s-1-1-million-coin)
- Project Eleven and Jim Posen built a zero-knowledge proof that lets owners prove seed-phrase ownership and recover frozen coins under BIP-361. It is unaudited and incomplete, and it cannot help P2PK coins without seeds, such as Satoshi's — [CoinDesk](https://www.coindesk.com/tech/2026/07/19/bitcoin-s-quantum-problem-gets-a-recovery-tool-but-not-for-satoshi-s-1-1-million-coin); [BeInCrypto](https://beincrypto.com/bitcoin-quantum-freeze-recovery-proof/)

### Inferences
- The threat is theoretical today but now has a credible engineering path. The risk for holders is twofold. First, reused-address and Taproot key-path exposure ("long exposure"). Second, policy risk: a contentious freeze or soft fork could make coins unspendable or split the network. Large holders and corporate treasuries (Strategy and others) face disclosure and fiduciary questions about quantum readiness.
- Market gap: there are few quantum-exposure audit tools for portfolios (checking which UTXOs have revealed public keys), migration-readiness services for custodians, or quantum-risk disclosure frameworks for public treasury companies. Hardware wallets will need PQ-signature support once a soft fork exists.

### Gaps
- No direct sources were retrieved on NIST PQC standards (FIPS 203/204/205 finalized Aug 2024; HQC selected 2025) or on IBM roadmap updates (Starling, about 200 logical qubits targeted by 2029). Both are background knowledge, not verified here.
- No consensus expert timeline was found. Estimates vary widely, and surveys such as the Global Risk Institute's were not retrieved.
- The precise exposed-BTC breakdown (P2PK vs reused P2PKH/P2WPKH vs P2TR) was not retrieved. River and other estimates may differ from Project Eleven's.
- An Oct 2026 feld.com post about a "$6.3B Binance hack" appeared in results. Its title ("Life Imitates Art") suggests fiction, so it was excluded.

## 8. Corporate treasury and Bitcoin ETF custody concentration

### Takeaway
Coinbase Custody holds roughly 80-84% of US spot Bitcoin ETF assets (custodian for 9 of 12 funds), a widely noted single point of failure. Public companies hold more than 1.13M BTC (about 5.4% of supply). Governance controls (custody diversity, key-person risk, insurance, leverage) vary widely and are weakly standardized.

### Cited Findings
- Coinbase Custody held about 84% of US spot BTC ETF assets in early 2026 (about $77B of $91.7B), and about 80.8% (about $74B) in April 2026. It is custodian for 9 of 12 US spot BTC ETFs. Analysts call it a "choke point" — [Spark research](https://www.spark.money/research/institutional-bitcoin-self-custody-shift); [GitHub market update (aggregator)](https://github.com/Ricosworks1/blockchain-payment-flow-analysis/releases/tag/market-update-bitcoin-custody-concentration-two-choke-points-sept-2026)
- An iShares filing (S-1/A, 2026) confirms the trust depends on Coinbase Custody as custodian and Coinbase Inc. as Prime Execution Agent, and flags SEC enforcement history as a risk factor — [SEC S-1/A](https://www.sec.gov/Archives/edgar/data/2089969/000143774926010792/bitp20260331_s1a.htm)
- BlackRock reportedly added Anchorage Digital as a custodian in 2025, but most IBIT assets are still assumed to be at Coinbase — [Ryder](https://ryder.id/blogs/post/bitcoin-etf-inflows-in-2026-the-numbers-behind-ibits-lead)
- Public companies held more than 1.13M BTC (about 5.4% of supply) as of Mar 2026. Forbes lists layered risks: governance, leverage, dilution, dependence on capital markets and management execution — [Forbes, Mar 18 2026](https://www.forbes.com/sites/digital-assets/2026/03/18/the-structural-risks-of-bitcoin-treasury-companies/)
- About 40% of listed BTC treasuries trade below the value of their bitcoin holdings (NAV), and smaller ones trade 10-75% below. A single custodian, thin insurance and unclear controls are cited as added risks — [TradingKey](https://www.tradingkey.com/analysis/cryptocurrencies/btc/261750568-crypto-bitcoin-btc-treasury-miners-ai-nva-usd-tiot-hpc-macroeconomic-tradingkey); [Smart-Money governance checklist](https://smart-money.live/crypto-corporate-treasuries-governance-checklist-after-the-s)

### Inferences
- An operational, legal or cyber event at Coinbase Custody would hit most US ETF BTC at the same time. Combined with the 2025 insider-bribery breach, this shows the human and insider layer of a dominant custodian is attackable.
- Smaller treasury companies often lack mature key ceremonies, multi-institution custody, segregation of duties and transparent proof of reserves. Executives at these companies are also wrench-attack targets because their holdings are public.
- Market gap: multi-institution and collaborative custody built for mid-cap public companies, board-level Bitcoin security audit and attestation standards, quantum-readiness disclosure, and executive personal-security programs tied to public BTC disclosures.

### Gaps
- No specific security incidents at Bitcoin treasury companies (2023-2026) were found in this session.
- Strategy (MicroStrategy)'s custody arrangement (reportedly multiple custodians, not disclosed in detail) was not verified.
- Insurance coverage levels for ETF custodians relative to assets under custody were not retrieved.

## 9. Inheritance and key loss as a security problem

### Takeaway
No new 2023-2026 quantitative sources were retrieved this session. Key loss remains a large but poorly measured risk, and it trades off directly against theft and coercion defenses: more redundancy means less loss risk but more attack surface.

### Cited Findings
- No 2023-2026 primary sources on key-loss or inheritance statistics were retrieved in this session.

### Inferences
- The Coldcard incident (section 3) adds a new failure mode: heirs and families holding long-term "set and forget" seeds that are silently compromised and need active migration. Inheritance plans rarely include re-key procedures.
- Market gap: inheritance products that combine time-locked recovery paths (miniscript and timelock-based decaying multisig), periodic proof-of-access checks and coercion resistance. Collaborative-custody providers offer parts of this, but uptake among high-net-worth holders and family offices is limited.

### Gaps
- Commonly cited figures (Chainalysis's 2020 estimate of about 3.7M BTC lost; Unchained/Casa inheritance survey data) were not re-verified in this session and should not be quoted without a source.
- No data was found on how many holders have a documented inheritance plan.

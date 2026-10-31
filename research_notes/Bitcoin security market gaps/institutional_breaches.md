# Institutional Crypto Breaches and Attack Vectors, Jan 2023 – Oct 2026

Research note scope: how exchanges, custodians, wallet providers, payment firms and the institutional-grade infrastructure behind them actually lost crypto from 2023 through 31 Oct 2026. Goal: root causes, so a founder can design a security product.

Method note: WebFetch could not reach trmlabs.com, wikipedia.org or crypto.news from this session (network allowlist). These notes therefore rely on search-engine summaries of those pages plus other outlets. Figures from the 29 Oct 2026 Binance incident are 1–2 days old and will change. Labels used: **[CONFIRMED]** = victim, government or primary forensic firm statement; **[ALLEGED]** = analytics-firm assessment or single-source claim; **[DISPUTED]** = sources conflict.

---

## Q1. Largest incidents 2023–2026 and their root causes

### Takeaway
The biggest institutional losses almost never come from broken cryptography or smart-contract bugs. They come from a compromised human endpoint (a developer or ops laptop, often reached through a fake recruiter or fake project), which then lets the attacker change what the signing system is asked to sign or what the signer sees. Three of the four largest thefts ever (Binance Oct 2026 ~$6.3–6.4B, Bybit Feb 2025 ~$1.5B, DMM May 2024 ~$305M) follow that pattern, and all three are attributed to North Korea's TraderTraitor.

### Cited Findings

**2026 incidents**

- **Binance, 29 Oct 2026, ~$6.3–6.43B, the largest crypto theft ever.**
  - Amount: estimates are $6.3B (Binance), ~$6.4B (Chainalysis) and $6.43B (Elliptic), taken from hot wallets across multiple blockchains — [Elliptic](https://www.elliptic.co/insights/binance-largest-hack-in-history/); [Chainalysis](https://www.chainalysis.com/blog/binance-exploit-latest-findings-and-response/); [CNBC](https://www.cnbc.com/2026/10/30/billions-in-crypto-frozen-in-binance-hack-heres-what-happens-next-.html).
  - Speed: TRM says the funds left across ten blockchains, mostly within about 20 minutes — [TRM Labs](https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history) (via search summary; TRM's figure is $6.36B).
  - Initial access [CONFIRMED by victim, preliminary]: Binance said a compromised software engineer's laptop was used to make unauthorized withdrawals. Reports say other issues were found later, and that the attackers prepared at least 36 hours in advance — [Wikipedia: 2026 Binance hack](https://en.wikipedia.org/wiki/2026_Binance_hack) (search summary); [CNBC](https://www.cnbc.com/2026/10/30/binance-hack-stolen-crypto-recovery.html).
  - Mechanism [ALLEGED]: TRM points to a compromise of Binance's hot-wallet signing infrastructure. One summary mentions reaching a "service container" and submitting withdrawals, but that detail is not corroborated — [TRM Labs](https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history); [CoinDesk](https://www.coindesk.com/business/2026/10/29/potential-multi-billion-binance-hack-hitting-crypto-markets).
  - Attribution: TRM says TraderTraitor with high confidence, and the FBI is reported to have named DPRK/TraderTraitor [reported, the FBI statement text was not seen]. Chainalysis's basis is that it watched Binance proceeds commingle in real time with proceeds from the September Bitget theft. Elliptic says attribution is "not yet certain" — [NPR](https://www.npr.org/2026/10/30/g-s1-150902/blockchain-intelligence-firms-link-north-korea-to-6-3b-hack-on-binance); [Chainalysis](https://www.chainalysis.com/blog/binance-exploit-latest-findings-and-response/); [Elliptic](https://www.elliptic.co/insights/binance-largest-hack-in-history/); [CNN](https://www.cnn.com/2026/10/30/tech/binance-crypto-heist-hnk-intl).
  - Recovery: ~$2.7–3B frozen (Binance says ~$3B, Chainalysis ~$2.8B), and TRM says the attacker still holds ~$2.4B. As of 30 Oct the stolen funds had not been converted to fiat. Binance suspended deposits and withdrawals and says it will cover all losses — [CNBC](https://www.cnbc.com/2026/10/30/binance-hack-stolen-crypto-recovery.html); [NBC](https://www.nbcnews.com/business/markets/binance-hack-tether-circle-stablecoins-rcna606445); [Bloomberg](https://www.bloomberg.com/news/articles/2026-10-29/binance-founder-says-possible-hack-of-exchange-bitcoin-falls).
- **Bitget, Sept 2026, ~$387.5M** (revised; one outlier says $351.6M). Funds came from hot and warm operational wallets, and cold wallets were reportedly untouched — [Blocksec](https://blocksec.com/blog/bitget-387m-off-chain-breach); [Wikipedia: Bitget](https://en.wikipedia.org/wiki/Bitget); [tech-insider](https://tech-insider.org/bitget-hack-351-million-north-korea-2026/).
  - Vector [DISPUTED]. Bitget blames a vulnerability in an unnamed third-party security product and says private keys were not compromised. Blocksec says forged withdrawals carried valid signatures. Nominis says a backend was breached and spoofed transaction data was pushed through the approval process. Halborn cites the CEO as saying legitimate credentials were used. Rescana (lower quality) claims a zero-day and a web shell — [Halborn](https://www.halborn.com/blog/post/bitget-hack-technical-analysis-september-2026); [Nominis](https://www.nominis.io/insights/nominis-monthly-report-crypto-exploits-and-attacks-in-september-2026); [Rescana](https://www.rescana.com/post/bitget-cryptocurrency-exchange-breach-387-5m-stolen-via-zero-day-exploit-in-third-party-security-products).
  - Attribution [ALLEGED]: Elliptic says DPRK is "highly likely", and TRM says "likely" without a definitive attribution. Bitget's CEO said the techniques were consistent with DPRK. Specter linked stolen XRP to a July 2026 AFX Trade attack attributed to TraderTraitor. There is no government attribution as of early October — [Cryptoticker](https://cryptoticker.io/en/bitget-hack-north-korea-attribution/).
- **Drift Protocol (Solana DeFi; included because the vector is admin/ops-key compromise, not code), 1 Apr 2026, ~$285M.** The root cause was governance and authorization failure: social engineering, then pre-signed transactions (reportedly via Solana durable nonces) that moved admin authority to the attacker. The drain reportedly took about 12 minutes. DPRK is suspected [ALLEGED] — [Blocksec April newsletter](https://blocksec.com/blog/newsletter-april-2026); [hoge.gg](https://hoge.gg/12-minute-drain-halborn-drift-285m-hack-2026/); [TheStreet](https://www.thestreet.com/crypto/markets/major-defi-hack-becomes-the-largest-of-2026-yet).
- **KelpDAO rsETH bridge, 18 Apr 2026, ~$290–293M.** The attacker compromised two internal RPC nodes so they reported false chain data, then DDoSed external nodes, which pushed a 1-of-1 LayerZero DVN verifier onto the poisoned infrastructure. The verifier then attested to a fabricated cross-chain message. This is an infrastructure compromise, not a contract bug. DPRK is suspected [ALLEGED] — [bex.co](https://bex.co/blog/2026/04/22/april-606m-hack-spree-defi-protocol-upgrade-vulnerabilities-kelp-drift-resolv); [TRM Labs](https://www.trmlabs.com/resources/blog/north-korea-stole-76-of-all-crypto-hack-value-in-2026-with-just-two-attacks).
- **AFX Trade, July 2026:** attributed to TraderTraitor via Specter. The amount was not found — [Cryptoticker](https://cryptoticker.io/en/bitget-hack-north-korea-attribution/).

**2025 incidents**

- **Bybit, 21 Feb 2025, ~$1.4–1.5B (ETH), the largest theft until Binance 2026.**
  - Initial access [CONFIRMED by Safe/Mandiant post-mortem]: On 4 Feb, a Safe{Wallet} developer's ("Developer1") macOS workstation was compromised through social engineering. One report says the vector was a Docker project posing as a stock-investment simulator.
  - Cloud access: The attackers hijacked that developer's live AWS session tokens to get around MFA. Their attempt to register their own MFA device failed, and Safe forced re-authentication every 12 hours, so they rode the active sessions. They operated inside Safe's AWS from 5 to 17 Feb.
  - Theft: On 17 Feb they injected malicious JavaScript into the Safe{Wallet} frontend served from AWS, targeting Bybit specifically. On 21 Feb Bybit's signers approved what appeared to be a routine cold-to-warm transfer. The transaction actually swapped in a malicious implementation contract, and the attacker then scrubbed the frontend.
  - Dwell time: about 17–19 days.
  - Attribution [CONFIRMED]: The FBI named TraderTraitor (DPRK). Mandiant (tracks it as UNC4899) confirmed, and Sygnia and Verichains reached the same conclusion for Bybit.
  - Sources — [The Hacker News](https://thehackernews.com/2025/03/safewallet-confirms-north-korean.html); [Cointelegraph – Safe post-mortem](https://cointelegraph.com/news/safe-wallet-releases-bybit-hack-post-mortem); [Elastic Security Labs](https://www.elastic.co/security-labs/bit-bybit); [Cybersecurity News](https://cybersecuritynews.com/bybit-hack-sophisticated-multi-stage-attack); [rekt.news](https://rekt.news/not-so-safe).
- **Coinbase, disclosed 15 May 2025 (8-K): insider bribery, data breach and extortion. No crypto was stolen directly from Coinbase.**
  - Discovery [CONFIRMED]: On 11 May an actor emailed Coinbase claiming to hold customer data and demanded $20M.
  - Access: The actor had paid overseas support contractors or employees to pull data from internal systems.
  - Data taken: names, addresses, phones, emails, masked SSNs and bank numbers, government-ID images, and account data. No passwords, private keys, 2FA codes, Prime accounts or funds were reached.
  - Response: Coinbase refused to pay, posted a $20M bounty and fired the insiders.
  - Cost: the 8-K estimated $180–400M, covering remediation and voluntary reimbursement of customers who were then socially engineered.
  - Affected: fewer than 1% of monthly transacting users, which WSJ estimated at up to ~97,000.
  - Sources — [The Register](https://www.theregister.com/2025/05/15/coinbase_extorted_for_20m_support/); [Sumsub](https://sumsub.com/media/news/coinbase-confirms-personal-data-breach-and-20m-extortion-attempt/); [DataBreaches.net](https://databreaches.net/2025/05/15/coinbase-says-hackers-bribed-staff-to-steal-customer-data-and-are-demanding-20-million-ransom).
  - A reported later arrest of an India-based former agent was not independently confirmed — [guptadeepak scam-atlas](https://guptadeepak.com/scam-atlas/case/coinbase-insider-bribery-2025/).
- **Phemex, Jan 2025, ~$29M–$85M** (sources differ): hot wallets drained across many chains in 125+ transactions. One list calls it a "hot wallet private key leak." On-chain analysts later saw the funds consolidated with Bybit-hacker wallets, so DPRK is [ALLEGED] on-chain only — [Cointelegraph](https://cointelegraph.com/news/lazarus-group-consolidates-bybit-phemex-hacker-wallet); [Bitget News list](https://www.bitget.com/news/detail/12560605127002).
- **CoinDCX (India), July 2025, ~$44M:** an internal operational account used for liquidity on a partner exchange was compromised, attributed to compromised internal credentials. Customer funds were untouched. Cyvers said it was "Lazarus-style" [ALLEGED, similarity only] — [DL News](https://www.dlnews.com/articles/people-culture/coindcx-hacker-routes-46m-into-ethereum-lazarus-style-attack/).
- **BigONE, 16 July 2025, ~$27M:** described as a supply-chain attack in which malicious code was injected into third-party tooling [ALLEGED, specifics unverified] — [CCN list](https://www.ccn.com/education/crypto/crypto-hacks-exploits-full-list-scams-vulnerabilities/); [bitcoin.com](https://news.bitcoin.com/ai-phishing-supply-chains-and-3-5b-lost-cryptos-brutal-2025/).
- **BtcTurk (Turkey), 14 Aug 2025, ~$48–54M:** hot-wallet key compromise. The exchange restored balances from insurance and corporate funds and resumed within 5 days. No Lazarus attribution was found — [Bitget News](https://www.bitget.com/news/detail/12560605128592).
- **Upbit (Korea), 27 Nov 2025, ~$30–37M:** Solana-ecosystem tokens drained from a hot wallet. Some sources attribute it to DPRK [ALLEGED]. Customers were made whole from reserves — [crypto-corner list](https://crypto-corner.com/2026/09/26/hacked-crypto-exchanges/).
- Nobitex (Iran), June 2025: hot-wallet keys compromised, listed together with Phemex and BtcTurk as key-leak incidents — [Bitget News](https://www.bitget.com/news/detail/12560605128592). Amount and the politically motivated attribution are not verified this session (see Gaps).

**2024 incidents**

- **DMM Bitcoin (Japan), 31 May 2024, 4,502.9 BTC (~$305–308M at the time), the largest pure-Bitcoin institutional theft of the period.**
  - Initial access: In March 2024, TraderTraitor posed as a LinkedIn recruiter and approached an employee of **Ginco**, the Japanese enterprise wallet vendor that handled DMM's deposits and withdrawals. The employee was sent a malicious "pre-employment test" (a Python script on GitHub).
  - Session hijack: After mid-May, the actors used stolen session cookies to impersonate the employee and access Ginco's unencrypted communications system.
  - Theft: In late May they altered a legitimate transaction request so the BTC went to attacker wallets.
  - Dwell time: about 2.5 months from first contact to theft.
  - Attribution [CONFIRMED]: a joint FBI / Japan NPA / DoD Cyber Crime Center statement on 23–24 Dec 2024, about 7 months after the theft.
  - Aftermath: DMM Bitcoin shut down, and its accounts were transferred to SBI VC Trade.
  - Sources — [BleepingComputer](https://www.bleepingcomputer.com/news/security/fbi-links-north-korean-hackers-to-308-million-crypto-heist); [The Record](https://therecord.media/fbi-largest-crypto-hack-2024-tradertraitor); [The Hacker News](https://thehackernews.com/2024/12/north-korean-hackers-pull-off-308m.html); [Trend Micro JP](https://trendmicro.com/ja_jp/jp-security/24/l/breaking-securitynews-20241226-02.html).
  - Detail [ALLEGED]: one analysis says malware gave remote control of the terminal and let the attackers manipulate requests. That source flags this as inference — [paymentnavi](https://paymentnavi.com/?p=155153).
- **WazirX (India), 18 July 2024, ~$230–235M.** A Liminal-custodied Ethereum Safe multisig had 6 keys (5 WazirX, 1 Liminal HSM). A malicious transaction upgraded the multisig contract and handed control to the attacker.
  - Root cause [DISPUTED and never resolved publicly]. Liminal says three WazirX devices were compromised and its UI was not at fault. WazirX says it found no evidence its signers' machines were compromised and suggests a Liminal-side breach. QuillAudits' secondary analysis describes two signers compromised directly plus a fake Liminal UI tricking the rest. No conclusive public forensic report was found.
  - Sources — [Cointelegraph – Liminal](https://cointelegraph.com/news/liminal-blames-compromised-wazirx-devices-hack-claims-ui-not-responsible); [Cointelegraph – WazirX](https://cointelegraph.com/news/wazir-x-finds-no-evidence-compromised-devices-preliminary-investigation); [QuillAudits](https://quillaudits.com/blog/hack-analysis/wazirx-235m-hack); [BusinessWorld](https://businessworld.in/article/what-happened-at-wazirx-liminal-custody-provides-inside-details-526685).
- Chainalysis characterises DMM as potentially "private key mismanagement or lack of adequate security", which is more hedged than the FBI's account — [Nairametrics summarising Chainalysis](https://nairametrics.com/2024/12/19/hackers-steal-2-2-billion-from-crypto-platforms-in-2024-report/).

**2023 incidents**

- **Mixin Network, Sept 2023, ~$200M:** the attack targeted Mixin's cloud service provider database. Critics said Mixin was more centralized than it claimed — [DL News top-10 2023](https://www.dlnews.com/articles/defi/check-out-the-10-biggest-crypto-hacks-of-2023/); [The Block](https://www.theblock.co/news/ecosystems/2024-01-01-the-10-largest-crypto-hacks-and-exploits-of-2023-268831).
- **Poloniex, Nov 2023, ~$100–126M:** private keys suspected obtained (an "advanced persistent threat"). Lazarus is suspected [ALLEGED] — [Decrypt](https://decrypt.co/210802/biggest-crypto-hacks-of-2023); [The Block](https://www.theblock.co/news/ecosystems/2024-01-01-the-10-largest-crypto-hacks-and-exploits-of-2023-268831).
- **HTX / Heco Bridge, Nov 2023:** reported losses range from $12M to $110M depending on source and on whether the HTX hot wallet and the Heco bridge are combined [DISPUTED] — [DL News](https://www.dlnews.com/articles/defi/check-out-the-10-biggest-crypto-hacks-of-2023/).
- **CoinEx, Sept 2023, ~$54–70M:** compromised hot-wallet private keys suspected. Attributed to Lazarus by Elliptic and others — [Cointelegraph](https://cointelegraph.com/news/exclusive-hackers-selling-stolen-tokens-coinex-stake); [Elliptic](https://www.elliptic.co/insights/how-the-lazarus-group-is-stepping-up-crypto-hacks-and-changing-its-tactics/).
- **Stake.com, Sept 2023, ~$41M:** hot wallets. The FBI attributed it to Lazarus [CONFIRMED] — [Decrypt](https://decrypt.co/210802/biggest-crypto-hacks-of-2023).
- **Atomic Wallet (June 2023), CoinsPaid (July 2023), Alphapo (July 2023):** all credited to Lazarus. CoinsPaid hot wallets were reached via social engineering, and the FBI confirmed attribution — [Hacken](https://hacken.io/discover/lazarus-group/); [Elliptic](https://www.elliptic.co/insights/how-the-lazarus-group-is-stepping-up-crypto-hacks-and-changing-its-tactics/).

### Inferences

**Pattern behind the largest losses.** The dominant root-cause chain is: compromise a person's device (fake recruiter, fake test or project, Telegram or LinkedIn lure), then hijack sessions or cloud credentials, then tamper with the transaction-construction or approval layer (Safe frontend, Ginco transaction request, Bitget approval flow, Binance hot-wallet service), then get a legitimate signer or HSM to sign a malicious payload.

**Controls that would have stopped specific incidents:**
- **Bybit, WazirX, DMM, Bitget.** The key control is independent transaction verification on a separate trusted device. That means decoding the raw calldata or PSBT and checking it against a policy on a different code path from the one that built the request. Policy should hard-block `delegatecall` and contract-upgrade operations on treasury multisigs. Clear signing, rather than blind signing, on hardware is part of this.
- **Binance, DMM.** The main controls are strict isolation of developer and engineering endpoints from production signing paths, device-bound and short-lived sessions resistant to cookie or token theft, and no standing human access to hot-wallet services. A velocity or amount circuit-breaker with out-of-band human confirmation would have capped a 20-minute, $6B outflow.
- **Coinbase.** The relevant controls are least-privilege, just-in-time access to customer PII for BPO staff; bulk-lookup anomaly detection; and the premise that support staff can be bribed.
- **Drift.** Controls should block admin-authority transfers and treat pre-signed or durable-nonce transactions as dangerous.
- **KelpDAO.** The fix is to avoid 1-of-1 verifiers and to rely on independent RPC and attestation diversity.

**Bitcoin-specific exposure.** DMM is the clearest pure-BTC institutional loss. The largest EVM losses (Bybit, WazirX) relied on Safe smart-contract semantics (`delegatecall` and upgrade) that do not exist in Bitcoin. Bitcoin custody does share the same weak point: PSBT construction and approval software, and session or endpoint compromise at the wallet vendor (Ginco), are both points where a request can be altered.

### Gaps

- Binance 2026: we lack a breakdown by asset (how much BTC versus ETH and stablecoins), the official post-mortem, the exact FBI statement text and date, and whether "service container" or HSM misuse is accurate. TRM and Wikipedia pages could not be fetched.
- Bitget 2026: the third-party product and the exact mechanism are still undisclosed by the victim.
- WazirX: no final independent forensic report was found. Whether the cause was device compromise, a Liminal UI or backend compromise, or both remains unresolved publicly.
- The following came from analyst background knowledge and were **not verified in this session**. They need checking before use:
  - Orbit Bridge (1 Jan 2024, ~$81.5M, 7-of-10 multisig keys compromised, DPRK suspected).
  - BingX (Sept 2024, ~$43–52M hot wallet).
  - Radiant Capital (Oct 2024, ~$50M; malware via a Telegram-delivered zip from a fake ex-contractor; hardware-wallet blind signing; Mandiant attribution to UNC4736/DPRK).
  - Nobitex (June 2025, ~$90M, claimed by the Israel-linked group Predatory Sparrow and burned rather than stolen).
  - SwissBorg (Sept 2025, ~$41M via a staking-partner API).
  - Ledger Connect Kit npm supply-chain compromise (Dec 2023).
  - Atomic Wallet amount (~$100M+).
  - The US DOJ forfeiture of ~127,271 BTC linked to the LuBian / Prince Group weak-key case (Oct 2025).
- No reliable 2026 incidents found for ETF custodians (Coinbase Custody, BitGo, Anchorage, Fidelity) or OTC desks. Absence of evidence ≠ no incidents.

---

## Q2. Breakdown of losses by attack vector

### Takeaway
Losses come from key and operational compromise, not code. "Private key / wallet compromise" was the largest category in 2024 (Chainalysis: 43.8%) and in H1 2026 (CertiK: wallet compromise $444M+ in 33 incidents). Underneath that label sit social-engineered developer endpoints, signing-flow manipulation, supply chain, bribed insiders and cloud or RPC infrastructure compromise. MPC protocol flaws (BitForge, TSSHOCK) were serious but have no publicly confirmed large theft attributed to them.

### Cited Findings

- **Private key compromise:**
  - 2024: 43.8% of stolen crypto, the largest category. Chainalysis also flagged a shift from DeFi to centralized services — [Security Boulevard summarising Chainalysis](https://securityboulevard.com/2024/12/north-korean-hackers-stole-1-34-billion-in-crypto-in-2024); [Nairametrics](https://nairametrics.com/2024/12/19/hackers-steal-2-2-billion-from-crypto-platforms-in-2024-report/).
  - 2025: the Phemex, Nobitex and BtcTurk incidents all involved compromised hot-wallet keys — [Bitget News](https://www.bitget.com/news/detail/12560605128592).
- **Wallet compromise and phishing, H1 2026:** wallet compromise was the largest category at >$444M across 33 incidents, driven by Drift and KelpDAO. Four incidents made up ~85% of phishing losses — [CertiK Hack3d H1 2026](https://www.certik.com/skynet-report/certik-hack3d-h1-2026-report); [GlobeNewswire](https://www.globenewswire.com/news-release/2026/07/08/3324276/0/en/certik-hack3d-h1-2026-report-reveals-over-1-31-billion-lost-to-web3-security-incidents-in-the-first-half-of-2026.html). August 2026 phishing alone was $41.5M — [Crypto Times](https://www.cryptotimes.io/2026/08/31/crypto-losses-hit-215-million-in-august-2026-defi-exploits-certik/).
- **"Not about smart contracts":** analysts characterised April 2026, the worst hack month at ~$606–625M, as driven by operational and infrastructure failures rather than code bugs — [bex.co](https://bex.co/blog/2026/04/22/april-606m-hack-spree-defi-protocol-upgrade-vulnerabilities-kelp-drift-resolv); [Agentic Tribune](https://agentictribune.com/article/20260430-april-2026-was-the-most-hacked-month-for-crypto-as-drift-and-kelpdao-thefts-top-625-million); [hoge.gg](https://hoge.gg/private-key-compromise-2026-stolen-keys-beat-code/).
- **Signing-UI and blind-signing manipulation:**
  - Bybit: a malicious JavaScript frontend at Safe{Wallet} [CONFIRMED] — [The Hacker News](https://thehackernews.com/2025/02/bybit-hack-traced-to-safewallet-supply.html).
  - WazirX: a "misleading transaction" was shown to signers [DISPUTED] — [Cointelegraph](https://cointelegraph.com/news/liminal-blames-compromised-wazirx-devices-hack-claims-ui-not-responsible).
  - DMM / Ginco: a legitimate transaction request was altered [CONFIRMED by FBI/NPA] — [BleepingComputer](https://www.bleepingcomputer.com/news/security/fbi-links-north-korean-hackers-to-308-million-crypto-heist).
  - Bitget: spoofed transaction data pushed through approval, and/or forged withdrawals with valid signatures [DISPUTED] — [Nominis](https://www.nominis.io/insights/nominis-monthly-report-crypto-exploits-and-attacks-in-september-2026); [Blocksec](https://blocksec.com/blog/bitget-387m-off-chain-breach).
- **Supply chain / developer machine:**
  - Safe developer Mac compromised by a malicious Docker project, which led to an AWS token hijack — [Cybersecurity News](https://cybersecuritynews.com/bybit-hack-sophisticated-multi-stage-attack); [Elastic](https://www.elastic.co/security-labs/bit-bybit).
  - Binance engineer laptop — [Wikipedia: 2026 Binance hack](https://en.wikipedia.org/wiki/2026_Binance_hack).
  - BigONE third-party tooling [ALLEGED] — [CCN](https://www.ccn.com/education/crypto/crypto-hacks-exploits-full-list-scams-vulnerabilities/).
  - Bitget third-party security product — [Halborn](https://www.halborn.com/blog/post/bitget-hack-technical-analysis-september-2026).
  - Supply chains and AI phishing are a 2025 headline theme — [bitcoin.com](https://news.bitcoin.com/ai-phishing-supply-chains-and-3-5b-lost-cryptos-brutal-2025/).
- **Social engineering, fake recruiters and fake IT workers:**
  - DMM via a LinkedIn fake recruiter at Ginco — [The Record](https://therecord.media/fbi-largest-crypto-hack-2024-tradertraitor).
  - CoinsPaid via social engineering — [Hacken](https://hacken.io/discover/lazarus-group/).
  - Chainalysis 2025: DPRK increasingly embeds IT workers inside crypto services to gain privileged access — [The Record](https://therecord.media/over-3-billion-crypto-stolen-2025-north-korea).
  - Drift: social engineering plus pre-signed admin transactions — [Blocksec](https://blocksec.com/blog/newsletter-april-2026).
- **Insider threat:** Coinbase's bribed overseas support staff produced a $180–400M cost estimate with no on-chain theft from Coinbase. The loss came through downstream social engineering of customers — [The Register](https://www.theregister.com/2025/05/15/coinbase_extorted_for_20m_support/).
- **Cloud and infrastructure compromise:**
  - Mixin's cloud provider database (~$200M) — [DL News](https://www.dlnews.com/articles/defi/check-out-the-10-biggest-crypto-hacks-of-2023/).
  - Safe AWS — [Cointelegraph](https://cointelegraph.com/news/safe-wallet-releases-bybit-hack-post-mortem).
  - KelpDAO internal RPC nodes — [bex.co](https://bex.co/blog/2026/04/22/april-606m-hack-spree-defi-protocol-upgrade-vulnerabilities-kelp-drift-resolv).
- **MPC / threshold-signature implementation flaws:**
  - **BitForge** (Fireblocks, Aug 2023): zero-days in GG-18, GG-20 and Lindell17 implementations. A missing zero-knowledge proof allowed full private-key extraction. Affected providers included Coinbase (WaaS), Zengo and Binance, which patched after a 90-day disclosure — [CoinDesk](https://hotfix.coindesk.com/tech/2023/08/09/fireblocks-discloses-zero-day-vulnerabilities-impacting-leading-mpc-wallets); [The Record](https://therecord.media/multiple-vulnerabilities-affecting-crypto-platform-bitforge); [Blockworks](https://blockworks.co/news/crypto-wallets-patch-zero-day-vulnerabilities-to-safeguard-user-funds).
  - **TSSHOCK** (Verichains): three key-extraction attacks on GG18, GG20 and CGGMP21 implementations. They exploit faulty dlnproof range proofs and injected bad Pedersen parameters — [Verichains](https://www.verichains.io/tsshock/); [Threshold Network](https://www.threshold.network/blog/bitforge-and-tsshock).
  - Fireblocks, Para, tBTC and Web3Auth said they were not affected — [Fireblocks support](https://support.fireblocks.io/hc/en-us/articles/9686867357212-Regarding-Verichains-MPC-vulnerability-discovery-aka-TSSHOCK); [Para](https://blog.getpara.com/vulnerability-disclosure-aug2023/); [Web3Auth](https://blog.web3auth.io/web3auths-response-to-recent-attacks-on-mpc-protocols-tsshock-bitforge/).
  - Disclosure dates conflict: TSSHOCK is variously dated March vs August 2023.

### Inferences

- "Private key compromise" in the industry statistics is a symptom category, not a root cause. In the best-documented cases the key material was never extracted from the HSM or MPC cluster. Instead the attacker controlled what got signed: Bybit, DMM, likely Bitget, and per Binance's preliminary account, Binance. Product implication: protecting keys is necessary but no longer sufficient. The gap is the integrity of the transaction intent between request creation and signature.
- MPC cryptographic flaws are a latent, not demonstrated, loss vector. They matter for vendor due diligence, but a security product built around endpoint, session and signing-intent integrity addresses far more realized dollars.

### Gaps

- No source in this session gave a clean dollar breakdown by vector for 2025 or 2026 YTD (TRM, Chainalysis or Immunefi taxonomy tables could not be fetched).
- No CVE numbers for BitForge or TSSHOCK were found. No public theft has been tied to either.
- No confirmed malicious-npm incident at an institutional custodian 2023–2026 was verified this session. The Ledger Connect Kit Dec 2023 case is unverified here.

---

## Q3. North Korea / Lazarus / TraderTraitor: share, tactics, laundering

### Takeaway
DPRK went from ~$660M in 2023 (~39% share) to $1.34B in 2024 (61%) to $2.02B in 2025 (59%). In 2026 YTD it accounts for roughly 85–89% of hack losses, about $7.4B per TRM, before all of Binance is counted. It achieves this with fewer but much larger attacks on centralized operators, and it launders by splitting across chains within minutes and cashing out in multi-week waves.

### Cited Findings

- **2023:** DPRK stole $660.5M across 20 incidents — [Security Boulevard / Chainalysis](https://securityboulevard.com/2024/12/north-korean-hackers-stole-1-34-billion-in-crypto-in-2024). Five major 2023 attacks were ascribed to Lazarus: Atomic Wallet, CoinsPaid, Alphapo, Stake.com and CoinEx — [Elliptic](https://www.elliptic.co/insights/how-the-lazarus-group-is-stepping-up-crypto-hacks-and-changing-its-tactics/).
- **2024:** $1.34B across 47 incidents, 61% of the $2.2B total — [Security Boulevard](https://securityboulevard.com/2024/12/north-korean-hackers-stole-1-34-billion-in-crypto-in-2024); [BankInfoSecurity](https://www.bankinfosecurity.com/north-korean-hackers-tied-to-13b-in-stolen-crypto-in-2024-a-27129).
- **2025:** $2.02B (record, +51% YoY), 59% of the $3.4B total. DPRK incident count fell 74% while the value per incident rose. Cumulative DPRK theft since 2022 is $6.75B — [The Record](https://therecord.media/over-3-billion-crypto-stolen-2025-north-korea); [Decrypt](https://decrypt.co/352775/north-korean-hackers-stolen-2-billion-crypto-2025-report). Some outlets report an inconsistent 2024 baseline [DISPUTED arithmetic].
- **2026 YTD:**
  - Through April: TRM put DPRK at ~$577M, ~76% of hack value, mostly from Drift and KelpDAO — [TRM Labs](https://www.trmlabs.com/resources/blog/north-korea-stole-76-of-all-crypto-hack-value-in-2026-with-just-two-attacks).
  - Through 29 Oct (Chainalysis): DPRK-suspected attacks were ~89% of reported 2026 hack losses. Average loss per attack was $185.65M in 2026, versus $50.65M in 2021. Over 2021–Oct 2026, total reported losses were $22.34B, of which $13.24B (59%) was DPRK — [Cryptobriefing](https://cryptobriefing.com/chainalysis-north-korea-hacks-89-percent-losses/); [Seoul Economic Daily](https://en.sedaily.com/finance/2026/10/31/chainalysis-says-north-korea-behind-89-percent-of-2026).
  - TRM's YTD figure is ~85%, about $7.4B — [KuCoin news](https://www.kucoin.com/news/flash/chainalysis-north-korea-linked-hacks-account-for-89-of-2026-crypto-hack-losses) (summary citing TRM).
  - Chainalysis and TRM differ on methodology.
- **Tactics:**
  - Fake recruiters on LinkedIn with malicious coding tests (DMM/Ginco) — [The Record](https://therecord.media/fbi-largest-crypto-hack-2024-tradertraitor).
  - Social-engineered developer workstation, malicious Docker project, AWS session-token theft, supply-chain injection into a wallet vendor's frontend (Bybit/Safe) — [Elastic](https://www.elastic.co/security-labs/bit-bybit); [The Hacker News](https://thehackernews.com/2025/03/safewallet-confirms-north-korean.html).
  - Embedded fake IT workers who gain privileged access (Chainalysis 2025) — [The Record](https://therecord.media/over-3-billion-crypto-stolen-2025-north-korea).
  - Engineer-laptop compromise of hot-wallet signing (Binance 2026) — [NPR](https://www.npr.org/2026/10/30/g-s1-150902/blockchain-intelligence-firms-link-north-korea-to-6-3b-hack-on-binance).
  - Mandiant tracks TraderTraitor as UNC4899 — [The Hacker News](https://thehackernews.com/2025/03/safewallet-confirms-north-korean.html).
- **Laundering pattern and speed:**
  - Chainalysis 2025 describes DPRK laundering using cross-chain bridges and mixers in roughly 45-day laundering waves — [Whale Alert summary of Chainalysis](https://whale-alert.io/stories/cf6e926a27b7/Chainalysis-DPRK-linked-hackers-stole-202B-in-crypto-in-2025-using-crosschain-bridges-mixers-and-45day-laundering-waves).
  - Binance: funds were split across ten chains within ~20 minutes and commingled in real time with Bitget proceeds — [TRM Labs](https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history); [Chainalysis](https://www.chainalysis.com/blog/binance-exploit-latest-findings-and-response/).
  - CoinDCX: proceeds routed into ETH — [DL News](https://www.dlnews.com/articles/people-culture/coindcx-hacker-routes-46m-into-ethereum-lazarus-style-attack/).
  - Phemex: funds consolidated into the Bybit-hacker wallet — [Cointelegraph](https://cointelegraph.com/news/lazarus-group-consolidates-bybit-phemex-hacker-wallet).
  - Some 2023 CoinEx and Stake proceeds were sold as discounted tokens via OTC-like brokers — [Cointelegraph](https://cointelegraph.com/news/exclusive-hackers-selling-stolen-tokens-coinex-stake).
- **How attribution is established:**
  1. On-chain clustering: wallet overlap and commingling with prior DPRK proceeds (Phemex→Bybit, Binance↔Bitget, Bitget XRP→AFX Trade).
  2. Forensic firm endpoint and cloud investigation: Mandiant, Sygnia and Verichains for Bybit.
  3. Government statement, typically FBI PSA or joint statement. For Bybit this came within days. For DMM it took about 7 months (joint FBI/NPA/DC3).
  - Sources — [BleepingComputer](https://www.bleepingcomputer.com/news/security/fbi-links-north-korean-hackers-to-308-million-crypto-heist); [Cryptoticker](https://cryptoticker.io/en/bitget-hack-north-korea-attribution/); [Netlas – OSINT attribution of Bybit](https://netlas.io/blog/bybit_hack/).

### Inferences

- Chainalysis's 89% figure appears to be through 29 Oct, so it probably includes the Binance event. Combined with TRM's ~$577M through April, this implies 2026 DPRK theft of roughly $7B+ is dominated by two events (Bitget, Binance) at centralized exchanges. The threat model for institutional custody in 2026 is effectively "a well-resourced nation-state with months of patience targeting your engineers and vendors."
- Laundering speed (minutes to split across chains) means detection or prevention has to happen before or at signing. Post-hoc tracing recovers a fraction. Binance recovered ~45% only because stablecoin and exchange freezes were available, and BTC has no issuer-freeze equivalent.

### Gaps

- The share of THORChain, eXch, Wasabi, Tornado and OTC desks in 2025–2026 DPRK laundering was not verified this session. Bybit's THORChain usage is widely reported but unverified here.
- The FBI PSA text for Binance 2026 was not retrieved, and its attribution date and wording are unconfirmed.

---

## Q4. Annual loss statistics 2023–2026 YTD, and the Bitcoin share

### Takeaway
Reported theft rose from ~$1.7B (2023) to $2.2B (2024) to $3.4B (2025). 2026 had ~$1.31B in H1 (CertiK), then Bitget (~$0.39B) and Binance (~$6.3–6.4B gross), putting 2026 YTD gross on the order of $8B+. Netting freezes changes this materially. No reliable source isolated Bitcoin-specific losses. Most large 2025–2026 losses were EVM, Solana and stablecoin assets; DMM is the standout BTC loss.

### Cited Findings

| Year | Total stolen (source) | DPRK | Notes |
|---|---|---|---|
| 2023 | ~$1.7B — [DL News](https://www.dlnews.com/articles/defi/check-out-the-10-biggest-crypto-hacks-of-2023/) | $660.5M / 20 incidents — [Security Boulevard](https://securityboulevard.com/2024/12/north-korean-hackers-stole-1-34-billion-in-crypto-in-2024) | Q3 2023 alone ~$900M as Lazarus resurfaced in Sept — [Coolbitx](https://medium.com/@coolbitx/q3-2023-crypto-crimes-surge-with-900-million-stolen-as-lazarus-group-resurfaces-in-september-20b1fe29044c) |
| 2024 | $2.2B / 303 incidents (+21%) — [Nairametrics / Chainalysis](https://nairametrics.com/2024/12/19/hackers-steal-2-2-billion-from-crypto-platforms-in-2024-report/) | $1.34B (61%) / 47 incidents | Private keys 43.8% |
| 2025 | $3.4B — [The Record](https://therecord.media/over-3-billion-crypto-stolen-2025-north-korea); [PYMNTS](https://www.pymnts.com/?p=3323980) | $2.02B (59%) | Bybit ~$1.5B; H1 2025 $2.17B — [Changelly](https://changelly.com/blog/crypto-crime-midyear-2025-2-17b-stolen-and-counting/); bitcoin.com says ~$3.5B — [bitcoin.com](https://news.bitcoin.com/ai-phishing-supply-chains-and-3-5b-lost-cryptos-brutal-2025/) |
| 2026 H1 | $1.31–1.32B gross / 344 incidents, ~$1.2B net (CertiK) — [CertiK](https://www.certik.com/skynet-report/certik-hack3d-h1-2026-report); [The Defiant](https://thedefiant.io/news/security/certik-says-h1-2026-web3-losses-topped-1-31b-up-28-excluding-bybit-baseline) | ~$577M through April (TRM, 76%) | Down 46.8% YoY headline, but +28% excluding Bybit (H1 2025 ex-Bybit ~$1.03B) |
| 2026 YTD (to 29 Oct) | Not published as a single figure. Add Bitget ~$387.5M (Sept), Binance ~$6.3–6.43B (Oct), Aug 2026 $215M (CertiK) — [Crypto Times](https://www.cryptotimes.io/2026/08/31/crypto-losses-hit-215-million-in-august-2026-defi-exploits-certik/) | ~89% (Chainalysis) / ~85%, ~$7.4B (TRM) — [Cryptobriefing](https://cryptobriefing.com/chainalysis-north-korea-hacks-89-percent-losses/) | Avg DPRK attack $185.65M |

- Physical "wrench" attacks are a separate category. Chainalysis counts ~$30M across 46 incidents in H1 2026, against a 2025 peak of $58M. CertiK counts $124M in H1 2026, so the methodologies diverge — [Chainalysis](https://www.chainalysis.com/blog/violent-crypto-wrench-attacks-2026/); [CertiK via GlobeNewswire](https://www.globenewswire.com/news-release/2026/07/25/3333162/0/en/CertiK-Intel3D-H1-2026-Wrench-Attacks-Report-Reveals-33-Surge-in-Physical-Crypto-Crime-Estimated-Losses-Top-124-Million.html).
- Chainalysis 2026 Crypto Crime Report: $154B illicit volume, and sanctioned-entity flows up 694% — [Chainalysis on X](https://x.com/chainalysis/status/2029539952128622847).
- Bitcoin-specific data point: DMM lost 4,502.9 BTC, the largest BTC-denominated institutional theft in the window — [The Record](https://therecord.media/fbi-largest-crypto-hack-2024-tradertraitor). Bybit was ETH — [Decrypt](https://decrypt.co/309018).

### Inferences

- 2026 is on track to be the worst year on record by a wide margin, about 2–3x 2025 gross. That is driven by one event, so median or ex-outlier trends (CertiK's +28% ex-Bybit) are the better indicator of baseline risk.
- Bitcoin's share of stolen value appears small relative to its share of institutional custody value. A plausible explanation is that BTC sits mostly in cold storage, and its script semantics lack the upgrade and `delegatecall` attack surface. That is inference, not measured. When BTC is lost (DMM), it is through the same signing-request integrity failure as everything else, and it cannot be frozen.

### Gaps

- No source in this session gave a Bitcoin-vs-other-chain loss breakdown for any year. This needs Chainalysis or TRM chain-level data.
- No consolidated 2026 YTD total from Chainalysis, TRM, Immunefi, Hacken or SlowMist was retrieved. Immunefi, Hacken and SlowMist annual figures for 2023–2025 were not retrieved either, so cross-source variance is not quantified.
- The Binance amount is gross. Net loss depends on freezes (~$2.7–3B), which shifts annual statistics substantially depending on whether a tracker reports gross or net.

---

## Q5. Common failure patterns in detection and incident response

### Takeaway
Attackers typically dwell for weeks to months on a developer or vendor endpoint undetected, then drain in minutes. Victims frequently cannot prove which signer, device or system was compromised, and the WazirX/Liminal dispute was never publicly resolved. Third-party vendors (Safe, Ginco, Liminal, Bitget's security product, Coinbase's BPO staff) are the recurring blind spot.

### Cited Findings

- **Dwell time before theft:**
  - Bybit/Safe: about 17–19 days (compromise 4 Feb, theft 21 Feb) — [Cybersecurity News](https://cybersecuritynews.com/bybit-hack-sophisticated-multi-stage-attack); [heise](https://heise.de/-10317026).
  - DMM/Ginco: about 2.5 months (March contact, mid-May session-cookie use, late-May theft) — [BleepingComputer](https://www.bleepingcomputer.com/news/security/fbi-links-north-korean-hackers-to-308-million-crypto-heist).
  - Binance: at least 36 hours of staging — [Wikipedia: 2026 Binance hack](https://en.wikipedia.org/wiki/2026_Binance_hack).
- **Execution speed:** Binance outflows took about 20 minutes, and Drift drained in about 12 minutes — [TRM Labs](https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history); [hoge.gg](https://hoge.gg/12-minute-drain-halborn-drift-285m-hack-2026/).
- **Evidence destruction:** the Bybit attacker scrubbed the malicious Safe frontend JavaScript after execution — [The Hacker News](https://thehackernews.com/2025/02/bybit-hack-traced-to-safewallet-supply.html).
- **Inability to attribute the compromised signer or device:**
  - WazirX: Liminal says three WazirX devices were compromised, while WazirX says it found no evidence of compromise on its signers' machines. Both are awaiting or claiming forensic results, and no public resolution was found — [Cointelegraph](https://cointelegraph.com/news/wazir-x-finds-no-evidence-compromised-devices-preliminary-investigation); [Cointelegraph](https://cointelegraph.com/news/liminal-blames-compromised-wazirx-devices-hack-claims-ui-not-responsible).
  - Bitget gave inconsistent public accounts (third-party product vulnerability vs legitimate credentials vs forged signatures) — [Halborn](https://www.halborn.com/blog/post/bitget-hack-technical-analysis-september-2026); [Blocksec](https://blocksec.com/blog/bitget-387m-off-chain-breach).
  - Binance's initial "compromised laptop" account was followed by findings of "other issues" — [Wikipedia: 2026 Binance hack](https://en.wikipedia.org/wiki/2026_Binance_hack).
- **Insider detection lag:** Coinbase learned of the breach from the extortion email (11 May 2025), not from its own detection of the bulk data pulls — [The Register](https://www.theregister.com/2025/05/15/coinbase_extorted_for_20m_support/).
- **Session controls bypassed:** Safe enforced 12-hour AWS re-authentication and the attacker's MFA registration failed, yet session-token hijacking still worked. At DMM, stolen session cookies gave access to an unencrypted communications system — [Cointelegraph](https://cointelegraph.com/news/safe-wallet-releases-bybit-hack-post-mortem); [BleepingComputer](https://www.bleepingcomputer.com/news/security/fbi-links-north-korean-hackers-to-308-million-crypto-heist).
- **Time to authoritative attribution:** Bybit got an FBI attribution within days. DMM took about 7 months (May→Dec 2024). Bitget had no government attribution weeks later — [The Record](https://therecord.media/fbi-largest-crypto-hack-2024-tradertraitor); [Cryptoticker](https://cryptoticker.io/en/bitget-hack-north-korea-attribution/).
- **Business impact:** DMM Bitcoin shut down — [GIGAZINE](https://wbgsv0a.gigazine.net/gsc_news/en/20241225-dmm-bitcoin-north-korea). BtcTurk reopened after 5 days by using insurance and corporate funds — [Bitget News](https://www.bitget.com/news/detail/12560605128592). Coinbase faces a $180–400M cost — [The Register](https://www.theregister.com/2025/05/15/coinbase_extorted_for_20m_support/).

### Inferences

**Product gaps a founder could target:**
1. **Tamper-evident signing provenance.** A cryptographically logged chain from the request origin (who or what service created it, from which device) through every approval to the final signature. This would answer "which signer or device was compromised" (WazirX, Bitget) and survive frontend scrubbing (Bybit).
2. **Independent intent verification.** A second, separately built decoder and policy engine sits outside the vendor UI and the request pipeline, and must agree before an HSM or MPC node signs. It covers Bybit, DMM, WazirX and Bitget. For Bitcoin, this means PSBT verification of outputs, change and fees against an allowlist on an isolated device.
3. **Developer and vendor endpoint isolation plus session binding.** Device-bound tokens (not bearer cookies or AWS session tokens), and no path from engineering laptops to signing services. This addresses Binance, Bybit/Safe and DMM.
4. **Pre-signature anomaly detection with automatic circuit-breakers.** Value and velocity limits per wallet tier that cannot be overridden from the same compromised channel. Given 12–20 minute drains, human-in-the-loop response after signing is too late.
5. **Third-party and vendor risk telemetry.** Recurring losses originate at wallet-infrastructure vendors (Safe, Ginco, Liminal, Bitget's "third-party security product") and BPO support (Coinbase).

### Gaps

- No source gave a systematic dataset of time-to-detect or time-to-disclose across incidents. The figures above are per-incident.
- No public detailed post-mortem from Binance (2026), Bitget (2026), WazirX (final) or Ginco/DMM (technical) was found.
- Whether institutions retained enough endpoint and cloud logs to reconstruct attacks is only evidenced for Bybit/Safe (Mandiant was able to reconstruct the AWS timeline). For others this is undocumented.

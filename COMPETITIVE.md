# Competitive Map — Citadel vs Superhuman Mail

> Superhuman is the bar for "premium AI email." This file maps its feature
> surface against Citadel so we build deliberately — matching what matters,
> skipping what doesn't, and pressing our wedge.
>
> **The wedge:** data **residency** + data **minimization** + **provable
> forgetting**, sold broadly and proven to a regulated-professional standard.
> The punchline below: the features Superhuman charges **enterprises** for
> (CMEK/BYOK, DLP, audit logging, provable deletion, sensitivity labels) are
> Citadel's **default core**.

_Grammar/autocorrect is intentionally **out of scope** — if the AI drafts and
rewrites, a separate grammar engine is redundant._

## Legend
✅ have · 🟡 partial · 🔜 planned (see `BUILD_PLAN.md`) · 🚫 won't build ·
🆚 our differentiator

---

## Core email & speed
| Superhuman feature | Tier | Citadel | Notes |
|---|---|---|---|
| Works on Gmail | Starter | ✅ | Read-only Gmail API + OAuth shipped |
| Works on Outlook / M365 (incl. personal) | Starter | ✅ | Read-only Microsoft Graph (`Mail.Read`) + OAuth on `/common` shipped |
| Keyboard-first + 100+ shortcuts | Starter | 🔜 | P11 |
| Cmd+K command palette | Starter | 🔜 | P11 |
| Inbox Zero workflow | Starter | 🟡 | process/forget loop exists; needs list UX |

## Triage & organization
| Superhuman feature | Tier | Citadel | Notes |
|---|---|---|---|
| Priority/triage labels | Starter | ✅ | AI triage (Urgent/Action/FYI/Low + label) |
| Split Inbox (lanes: VIP/tool/rule) | Starter | ✅ | lane routing by priority/label + VIP senders (P6) |
| Auto Labels | Starter | 🟡 | per-item label today; custom labels P6 |
| Custom Auto Labels | Business | 🔜 | P6 |
| Snooze | Starter | 🔜 | P9 |
| Unsubscribe / spam clearing | Starter | 🔜 | later |

## AI
| Superhuman feature | Tier | Citadel | Notes |
|---|---|---|---|
| AI runs **locally / on infra you control** | — | 🆚 | Apertus via Ollama; no US cloud |
| Write with AI (draft from a prompt) | Starter | ✅ | `/api/compose` + reading-pane box, local model |
| Auto Drafts (proactive replies in your tone) | Business | ✅ | tone-aware auto-draft on every processed email 🆚 (local) |
| Ask AI (Q&A over inbox) | Business | 🔜 | P8 (RAG over derived data) |
| Auto Summarize / TLDR | Starter | ✅ | one-line summaries today |
| Tone & Voice / self-personalization | Starter | ✅ | per-user tone profile folded into every prompt (local) |
| Semantic search | Starter | ✅ | in-memory embeddings, never persisted 🆚 |
| Agentic workflows / outbound agent | Business+ | 🔜 | P17 (optional, late) |
| AI Knowledge Base / MCP connectors | Business+ | 🔜 | P17 |

## Productivity
| Superhuman feature | Tier | Citadel | Notes |
|---|---|---|---|
| Snippets (shareable) | Starter | 🔜 | P9 |
| Send Later | Starter | 🔜 | P9 |
| Follow-up Reminders | Starter | 🔜 | P9 |
| Read statuses (open tracking) | Starter | 🚫/🟡 | conflicts with privacy brand; if built, **opt-in only** |

## Calendar
| Superhuman feature | Tier | Citadel | Notes |
|---|---|---|---|
| See Your Day / inline availability | Starter | 🔜 | P12 (optional) |
| Create Event from email | Starter | 🔜 | P12 |
| Share Availability | Starter | 🔜 | P12 |

## Collaboration / team
| Superhuman feature | Tier | Citadel | Notes |
|---|---|---|---|
| Share & Comment on a thread | Team | 🔜 | P14 (team tier) |
| Team Read Statuses | Team | 🚫/🔜 | privacy-nuanced; opt-in |
| Team Reply Indicators | Team | 🔜 | P14 |
| Shared Snippets | Team | 🔜 | P14 |

## Platforms
| Superhuman feature | Tier | Citadel | Notes |
|---|---|---|---|
| macOS / Windows desktop apps | Starter | 🔜 | web first; native later |
| iOS / Android apps | Starter | 🔜 | web first |
| Mobile voice compose | Starter | 🚫 | low priority |

## Integrations
| Superhuman feature | Tier | Citadel | Notes |
|---|---|---|---|
| CRM (HubSpot/Salesforce/Pipedrive) | Business | 🔜 | later, pro tier |
| Tool splits (Docs/Notion/Asana) | Starter | 🔜 | with Split Inbox P6 |

---

## Enterprise-only in Superhuman — **core in Citadel** 🆚
| Superhuman (enterprise add-on) | Citadel |
|---|---|
| BYOK / CMEK encryption | ✅ per-item keys via envelope encryption (KMS seam, BUILD_PLAN P2); keys live apart from data 🆚 |
| Data Loss Prevention / sensitivity labels | 🔜 P16, but minimization is default |
| Audit logging | ✅ content-free audit log today 🆚 |
| Provable data deletion / retention | ✅ crypto-shredding + "prove unrecoverable" 🆚 |
| Encryption in transit & at rest | ✅ AES-256-GCM at rest; TLS in transit |
| SOC 2 / ISO 27001 / GDPR / PIPEDA | 🔜 P16 (compliance pack) |
| SSO (Google/Microsoft/Okta/SAML) | 🔜 P15 |
| SCIM provisioning | 🔜 P15 |
| Admin console / roles / team AI governance | 🔜 P15 |
| Dedicated support | 🔜 later |

**Takeaway:** Superhuman sells privacy/control as a premium upsell. Citadel makes
it the product, then layers the same productivity/AI features on top. We don't
need feature parity to win — we need the **sovereign core** + enough of the
**daily-driver email + AI** to make switching painless. That ordering is exactly
what `BUILD_PLAN.md` sequences.

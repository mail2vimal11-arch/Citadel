import type { RawEmail } from "@/lib/types";

// =============================================================================
// SYNTHETIC SAMPLE DATA — 100% FAKE.
//
// Every name, firm, matter, email address, and detail below is invented for
// demonstration. There is NO real, privileged, or personal information here.
// This is the only data the prototype ever processes.
//
// TODO(production): delete this file. Real messages come from a live mailbox
// connector (Gmail / Microsoft Graph), read-only, over an authorized OAuth
// connection — and must be processed on Canadian-controlled infrastructure.
// =============================================================================

const NOW = Date.UTC(2026, 5, 15, 14, 0, 0); // 2026-06-15 14:00 UTC, fixed for stable demos
const minutesAgo = (m: number) => new Date(NOW - m * 60_000).toISOString();

export const SAMPLE_EMAILS: RawEmail[] = [
  {
    id: "msg-001",
    from: "Priya Anand <priya.anand@maplecrestclients.example>",
    to: "you@yourfirm.example",
    subject: "Re: Anand v. Northstar — settlement offer received",
    receivedAt: minutesAgo(12),
    body:
      "Hi, opposing counsel sent over a settlement figure of $45,000 this morning. " +
      "They want a response by Friday. Can we book 30 minutes tomorrow to talk through " +
      "whether we counter? I'd like your read before I tell them anything.",
  },
  {
    id: "msg-002",
    from: "Dr. Helen Osei <reception@brightpathclinic.example>",
    to: "you@yourfirm.example",
    subject: "Referral letter for new patient intake",
    receivedAt: minutesAgo(40),
    body:
      "Good morning, please find attached the referral details for an intake assessment. " +
      "The patient is hoping to be seen within two weeks. Let me know what times you have " +
      "available and I'll coordinate with them directly.",
  },
  {
    id: "msg-003",
    from: "CanLII Updates <noreply@news.canlii.example>",
    to: "you@yourfirm.example",
    subject: "This week in Canadian case law: 6 new decisions",
    receivedAt: minutesAgo(95),
    body:
      "Your weekly digest of newly published decisions across Canadian courts. " +
      "Highlights this week include three privacy rulings and a notable contracts " +
      "decision. Click through to read summaries. Manage your subscription preferences here.",
  },
  {
    id: "msg-004",
    from: "Marcus Lebel <m.lebel@lebelconstruction.example>",
    to: "you@yourfirm.example",
    subject: "URGENT: lien deadline is Monday",
    receivedAt: minutesAgo(8),
    body:
      "We just realized the construction lien has to be registered by Monday or we lose " +
      "the right entirely. The project is the Riverside development. Please tell me what " +
      "you need from me today to get this filed in time. This cannot slip.",
  },
  {
    id: "msg-005",
    from: "Office Calendar <calendar@yourfirm.example>",
    to: "you@yourfirm.example",
    subject: "Reminder: partners' meeting at 3:00 PM",
    receivedAt: minutesAgo(60),
    body:
      "This is an automated reminder that the monthly partners' meeting is scheduled for " +
      "3:00 PM today in the main boardroom. Agenda items include the Q2 budget review and " +
      "the new client intake process.",
  },
  {
    id: "msg-006",
    from: "Sandra Whitfield <sandra.whitfield@personalmail.example>",
    to: "you@yourfirm.example",
    subject: "PRIVILEGED & CONFIDENTIAL — my strategy concerns",
    receivedAt: minutesAgo(25),
    body:
      "I wanted to share, in confidence and seeking your legal advice, some concerns about " +
      "how we should approach the negotiation. I'm worried the other side knows about the " +
      "issue with the inspection report. Please advise on how this affects our position. " +
      "I understand this is privileged solicitor-client communication.",
  },
  {
    id: "msg-007",
    from: "Jordan Kim <jordan.kim@startuplawclients.example>",
    to: "you@yourfirm.example",
    subject: "Quick question on the SAFE agreement",
    receivedAt: minutesAgo(150),
    body:
      "Thanks for the draft! One quick question — does the valuation cap of $8M apply before " +
      "or after the discount? Our investor asked and I wasn't sure. No rush, sometime this " +
      "week is fine.",
  },
  {
    id: "msg-008",
    from: "Billing <billing@legalsoftwaretools.example>",
    to: "you@yourfirm.example",
    subject: "Your invoice #INV-20418 is now available",
    receivedAt: minutesAgo(220),
    body:
      "Your monthly subscription invoice is ready. Amount due: $129.00, payable by the end " +
      "of the month. You can view and download your invoice from your account dashboard.",
  },
  {
    id: "msg-009",
    from: "Thomas Beaulieu <t.beaulieu@beaulieufamily.example>",
    to: "you@yourfirm.example",
    subject: "Re: separation agreement — kids' schedule",
    receivedAt: minutesAgo(33),
    body:
      "I've reviewed the draft parenting schedule. The alternating weekends work, but I'd " +
      "like to discuss the holiday split — I think Christmas should rotate yearly. Can we " +
      "talk before you send anything to the other side?",
  },
  {
    id: "msg-010",
    from: "Law Society Notices <notices@lawsociety.example>",
    to: "you@yourfirm.example",
    subject: "Annual CPD reporting deadline approaching",
    receivedAt: minutesAgo(300),
    body:
      "A reminder that your Continuing Professional Development hours must be reported by " +
      "the end of the quarter. Our records show you have logged 9 of the required 12 hours. " +
      "Log in to update your record.",
  },
  {
    id: "msg-011",
    from: "Aisha Rahman <aisha.rahman@rahmanproperties.example>",
    to: "you@yourfirm.example",
    subject: "Closing documents for 14 Birchwood Lane",
    receivedAt: minutesAgo(70),
    body:
      "Closing is scheduled for the 22nd. I've signed the documents you sent and will courier " +
      "the originals today. Could you confirm the trust deposit was received? The buyer's agent " +
      "is asking for an update.",
  },
  {
    id: "msg-012",
    from: "Conference Team <hello@privacylawsummit.example>",
    to: "you@yourfirm.example",
    subject: "You're invited: Canadian Privacy & Data Sovereignty Summit",
    receivedAt: minutesAgo(400),
    body:
      "Join 400+ legal and compliance professionals this fall to discuss data residency, " +
      "PIPEDA reform, and emerging AI governance. Early-bird registration is now open. " +
      "Unsubscribe at any time using the link below.",
  },
  {
    id: "msg-013",
    from: "Nathan Fortin <nathan@fortinaccounting.example>",
    to: "you@yourfirm.example",
    subject: "Trust account reconciliation — need figures by EOD",
    receivedAt: minutesAgo(18),
    body:
      "Hi, I'm finalizing the trust account reconciliation for the quarter. I'm missing the " +
      "disbursement figures for two matters. Could you send those over by end of day so I can " +
      "close the books? Thanks.",
  },
  {
    id: "msg-014",
    from: "Grace Liu <grace.liu@liuimmigration.example>",
    to: "you@yourfirm.example",
    subject: "Client's work permit expires in 30 days",
    receivedAt: minutesAgo(55),
    body:
      "Flagging that our client's work permit expires in 30 days and we still need to file " +
      "the extension. I've drafted the application but need your sign-off on the supporting " +
      "letter before submission. When can you review?",
  },
  {
    id: "msg-015",
    from: "IT Helpdesk <it@yourfirm.example>",
    to: "you@yourfirm.example",
    subject: "Scheduled maintenance this weekend",
    receivedAt: minutesAgo(500),
    body:
      "Please be advised that email and document systems will be briefly unavailable on " +
      "Saturday between 2:00 AM and 4:00 AM for scheduled maintenance. No action is required " +
      "on your part. Contact the helpdesk with any questions.",
  },
];

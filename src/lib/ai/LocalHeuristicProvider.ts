import type { AIProvider, TriageResult } from "./AIProvider";
import type { Priority, RawEmail } from "@/lib/types";
import type { AskContext, ComposeRequest, Tone } from "./prompts";

// ============================================================================
// LocalHeuristicProvider — the PLACEHOLDER "AI" used in the prototype.
//
// >>> THIS IS NOT REAL AI. <<<
//
// It is a small set of deterministic, rule-based functions that run entirely
// on your computer with NO internet connection and NO API key. We use it so the
// demo is trivial to run and so that not even synthetic data ever leaves the
// machine. It produces believable-looking summaries/labels/drafts for the demo,
// but it does not "understand" anything.
//
// TODO(production): replace with a real AIProvider backed by a Canadian-hosted
// model (e.g. a model served from a Canadian region) or an on-device model.
// Whatever it is, it must keep email-derived data inside Canadian-controlled
// infrastructure. Only the swappable backend changes — this interface stays.
// ============================================================================

const firstName = (from: string): string => {
  const namePart = from.split("<")[0].trim();
  const candidate = namePart.replace(/^(Dr\.?|Mr\.?|Ms\.?|Mrs\.?)\s+/i, "");
  const first = candidate.split(/\s+/)[0];
  return first && /[a-zA-Z]/.test(first) ? first : "there";
};

const firstSentence = (body: string): string => {
  const match = body.match(/[^.!?]*[.!?]/);
  const sentence = (match ? match[0] : body).trim();
  return sentence.length > 160 ? sentence.slice(0, 157) + "..." : sentence;
};

const has = (text: string, words: string[]): boolean => {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w));
};

export class LocalHeuristicProvider implements AIProvider {
  readonly name = "Local rule-based placeholder (no network, no API key)";

  async summarize(email: RawEmail): Promise<string> {
    const opener = firstSentence(email.body);
    const lower = `${email.subject} ${email.body}`.toLowerCase();
    let intent = "Provides an update.";
    if (has(lower, ["?", "could you", "can we", "can you", "question", "let me know"]))
      intent = "Asks for a response or action from you.";
    if (has(lower, ["deadline", "by friday", "by monday", "by end of day", "eod", "expires"]))
      intent = "Flags a time-sensitive deadline.";
    if (has(lower, ["invoice", "reminder", "digest", "newsletter", "unsubscribe"]))
      intent = "Informational / no reply likely needed.";
    return `${opener} ${intent}`;
  }

  async triage(email: RawEmail): Promise<TriageResult> {
    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();
    const all = `${subject} ${body}`;

    // Triage label (what kind of email is this?)
    let triageLabel = "Correspondence";
    if (has(all, ["settlement", "lien", "agreement", "matter", "closing", "permit", "v.", "privileged"]))
      triageLabel = "Client matter";
    else if (has(all, ["meeting", "calendar", "schedule", "reminder", "intake", "available"]))
      triageLabel = "Scheduling";
    else if (has(all, ["invoice", "billing", "reconciliation", "trust account", "payable"]))
      triageLabel = "Finance / billing";
    else if (has(all, ["digest", "newsletter", "summit", "unsubscribe", "subscription", "cpd", "maintenance"]))
      triageLabel = "Newsletter / notice";

    // Priority
    let priority: Priority = "FYI";
    if (has(subject, ["urgent"]) || has(all, ["expires in", "by monday", "deadline", "cannot slip", "cannot wait"]))
      priority = "Urgent";
    else if (has(all, ["by friday", "by end of day", "eod", "sign-off", "need your", "please advise", "asking for an update", "respond by"]))
      priority = "Action needed";
    else if (has(all, ["?", "could you", "can we", "can you", "question"]))
      priority = "Action needed";
    if (triageLabel === "Newsletter / notice") priority = "Low";

    return { priority, triageLabel };
  }

  async draftReply(email: RawEmail, opts?: { tone?: Tone }): Promise<string> {
    const name = firstName(email.from);
    const lower = `${email.subject} ${email.body}`.toLowerCase();

    if (has(lower, ["digest", "newsletter", "summit", "unsubscribe", "maintenance", "invoice", "reminder"])) {
      return `(No reply suggested — this looks informational.)`;
    }

    let middle =
      "Thanks for your email. I've noted the details and will follow up shortly.";
    if (has(lower, ["deadline", "urgent", "expires", "by monday", "by friday", "eod"])) {
      middle =
        "Thanks for the heads-up on the timing — I'm treating this as a priority. " +
        "I'll confirm the next steps and what I need from you within the next few hours.";
    } else if (has(lower, ["can we", "book", "30 minutes", "talk", "call", "available"])) {
      middle =
        "Happy to set up a quick call. I have some availability tomorrow morning and " +
        "early afternoon — let me know what works and I'll send an invite.";
    } else if (has(lower, ["question", "?"])) {
      middle =
        "Good question. Let me confirm the details on my end and I'll get you a clear " +
        "answer shortly.";
    }

    return wrapTone(opts?.tone, `Hi ${name},`, middle);
  }

  // Write-with-AI, offline. Deterministic: it does not "understand" the request,
  // it frames the user's own words into a tone-appropriate email shell so the
  // feature still works with no Ollama. The real drafting is the Apertus path.
  async compose(req: ComposeRequest): Promise<string> {
    const instruction = req.instruction?.trim();
    if (!instruction) return "";
    const greeting = req.context?.from ? `Hi ${firstName(req.context.from)},` : "Hello,";
    const body = instruction.charAt(0).toUpperCase() + instruction.slice(1);
    return wrapTone(req.tone, greeting, body);
  }

  // Ask AI, offline. It can't reason, so it honestly surfaces the most relevant
  // retrieved emails rather than fabricate an answer. Real Q&A is the Apertus path.
  async answer(question: string, contexts: AskContext[]): Promise<string> {
    if (!question.trim()) return "";
    if (contexts.length === 0) {
      return "I couldn't find anything in your inbox related to that.";
    }
    const top = contexts.slice(0, 2).map((c, i) => `${i + 1}. “${c.subject ?? "?"}” — ${c.summary ?? ""}`.trim());
    return (
      `Based on ${contexts.length} related email(s), the most relevant:\n` +
      top.join("\n") +
      `\n\n(Offline mode surfaces matches rather than a reasoned answer — enable local Apertus for full Q&A.)`
    );
  }
}

// Shape a greeting + body into an email whose opener/closer reflect the tone.
// (Offline placeholder styling only — the model does the real voice work.)
function wrapTone(tone: Tone | undefined, greeting: string, body: string): string {
  const closings: Record<string, string> = {
    professional: "Best regards,",
    warm: "Warm regards,",
    concise: "Thanks,",
    direct: "Regards,",
    formal: "Yours sincerely,",
  };
  if (tone === "concise") return `${greeting}\n\n${body}\n\nThanks,\n[Your name]`;
  const closing = closings[tone ?? "professional"] ?? "Best regards,";
  return `${greeting}\n\n${body}\n\n${closing}\n[Your name]`;
}

import type { AIProvider, TriageResult } from "./AIProvider";
import type { Priority, RawEmail } from "@/lib/types";
import { ollamaChat, OLLAMA_MODEL } from "./ollamaClient";
import { LocalHeuristicProvider } from "./LocalHeuristicProvider";
import {
  SYSTEM_BASE as SYSTEM,
  emailToText,
  buildDraftMessages,
  buildComposeMessages,
  buildAskMessages,
  type AskContext,
  type ComposeRequest,
  type Tone,
} from "./prompts";

// ============================================================================
// ApertusLocalProvider — the REAL AI provider for the prototype.
//
// It runs the open-source **Apertus 8B Instruct** model (Swiss AI Initiative,
// Apache 2.0) 100% locally via an Ollama server at http://localhost:11434.
// Nothing leaves the machine: no API keys, no cloud calls, ever. Only the
// synthetic sample emails are ever sent to it.
//
// Prompt wording + the per-user tone live in ./prompts (pure, unit-tested).
//
// TODO(production): serve the SAME Apertus model on Canadian-controlled
// infrastructure (a Canadian GPU host or on-prem appliance) and point
// OLLAMA_BASE_URL at it. This class does not change — only the endpoint does.
// ============================================================================

const PRIORITIES: Priority[] = ["Urgent", "Action needed", "FYI", "Low"];

export class ApertusLocalProvider implements AIProvider {
  readonly name = `Apertus 8B Instruct (local, via Ollama — ${OLLAMA_MODEL})`;

  // Used as a safety net so a single bad/slow model response never blanks the
  // whole demo. It runs entirely offline too, so we stay fully local.
  private fallback = new LocalHeuristicProvider();

  async summarize(email: RawEmail): Promise<string> {
    try {
      const content = await ollamaChat([
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content:
            "Summarize this email in ONE plain-language English sentence (max 30 words): " +
            "what it is about and whether it needs a reply or action. " +
            "Reply in English with the sentence only, no preamble.\n\n" +
            emailToText(email),
        },
      ]);
      const cleaned = content.replace(/^["']|["']$/g, "").trim();
      return cleaned || (await this.fallback.summarize(email));
    } catch {
      return this.fallback.summarize(email);
    }
  }

  async triage(email: RawEmail): Promise<TriageResult> {
    try {
      const content = await ollamaChat(
        [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content:
              "Triage this email. Respond ONLY with JSON: " +
              '{"priority": "...", "triageLabel": "..."}.\n\n' +
              `"priority" must be EXACTLY one of: ${PRIORITIES.join(", ")}.\n` +
              "Choose using these rules, in order. Be conservative — most emails are " +
              "NOT urgent:\n" +
              '- "Urgent": ONLY if the email states a hard deadline within ~2 days, or a ' +
              "serious time-sensitive consequence (e.g. a filing/lien deadline, something " +
              '"expires", "by Monday", "cannot wait"). If no explicit imminent deadline, it ' +
              "is not Urgent.\n" +
              '- "Action needed": it asks YOU for a reply, decision, or task, but with no ' +
              "imminent hard deadline (a question, a request, a draft to review, \"this week\").\n" +
              '- "FYI": informational and relevant, but needs no action from you (status ' +
              "updates, confirmations, meeting reminders).\n" +
              '- "Low": newsletters, digests, marketing, automated/system notices.\n\n' +
              '"triageLabel" is a 1-3 word category. Prefer one of: "Client matter", ' +
              '"Scheduling", "Finance / billing", "Newsletter / notice", "Correspondence".\n\n' +
              emailToText(email),
          },
        ],
        { json: true }
      );

      const parsed = JSON.parse(content) as { priority?: string; triageLabel?: string };
      const priority = PRIORITIES.find(
        (p) => p.toLowerCase() === String(parsed.priority ?? "").toLowerCase()
      );
      const triageLabel = String(parsed.triageLabel ?? "").trim();
      if (!priority || !triageLabel) return this.fallback.triage(email);
      return { priority, triageLabel };
    } catch {
      return this.fallback.triage(email);
    }
  }

  async draftReply(email: RawEmail, opts?: { tone?: Tone }): Promise<string> {
    try {
      const content = await ollamaChat(buildDraftMessages(email, opts?.tone ?? "professional"));
      return content.trim() || (await this.fallback.draftReply(email, opts));
    } catch {
      return this.fallback.draftReply(email, opts);
    }
  }

  async compose(req: ComposeRequest): Promise<string> {
    // Refuse empty instructions cheaply (no model call, no fallback noise).
    if (!req.instruction?.trim()) return "";
    try {
      const content = await ollamaChat(buildComposeMessages(req), { temperature: 0.4 });
      return content.trim() || (await this.fallback.compose(req));
    } catch {
      return this.fallback.compose(req);
    }
  }

  async answer(question: string, contexts: AskContext[]): Promise<string> {
    if (!question.trim()) return "";
    try {
      // Low temperature: we want grounded answers, not creativity.
      const content = await ollamaChat(buildAskMessages(question, contexts), { temperature: 0.1 });
      return content.trim() || (await this.fallback.answer(question, contexts));
    } catch {
      return this.fallback.answer(question, contexts);
    }
  }
}

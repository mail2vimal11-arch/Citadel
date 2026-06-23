import { describe, it, expect } from "vitest";
import { LocalHeuristicProvider } from "./LocalHeuristicProvider";
import type { RawEmail } from "@/lib/types";

const ai = new LocalHeuristicProvider();
const email: RawEmail = {
  id: "x",
  from: "Dana Lee <dana@firm.com>",
  to: "me@firm.com",
  subject: "Quick question",
  receivedAt: "2026-06-20T10:00:00Z",
  body: "Could you confirm the venue?",
};

// The offline provider is the fallback path: it must always return something
// usable for draftReply + compose so the feature works with no Ollama.
describe("LocalHeuristicProvider — compose (offline fallback)", () => {
  it("frames the user's instruction into an email", async () => {
    const draft = await ai.compose({ instruction: "ask for a one-week extension", tone: "professional" });
    expect(draft).toContain("Ask for a one-week extension"); // capitalized into the body
    expect(draft).toContain("[Your name]");
  });

  it("greets by name when reply context is present", async () => {
    const draft = await ai.compose({
      instruction: "decline politely",
      context: { from: "Dana Lee <dana@firm.com>" },
    });
    expect(draft).toContain("Hi Dana,");
  });

  it("returns empty for an empty instruction", async () => {
    expect(await ai.compose({ instruction: "   " })).toBe("");
  });
});

describe("LocalHeuristicProvider — answer (offline Ask AI fallback)", () => {
  it("surfaces the most relevant retrieved emails", async () => {
    const a = await ai.answer("what's due?", [
      { from: "Court", subject: "Filing deadline", summary: "Due Friday." },
      { from: "Dana", subject: "Lunch", summary: "Catch up." },
    ]);
    expect(a).toContain("Filing deadline");
    expect(a).toContain("2 related email");
  });
  it("says so when nothing is relevant", async () => {
    expect(await ai.answer("anything?", [])).toMatch(/couldn't find/i);
  });
  it("returns empty for an empty question", async () => {
    expect(await ai.answer("  ", [{ subject: "x" }])).toBe("");
  });
});

describe("LocalHeuristicProvider — tone-aware closings", () => {
  it("uses a formal closing for the formal tone", async () => {
    expect(await ai.draftReply(email, { tone: "formal" })).toContain("Yours sincerely,");
  });
  it("uses a concise closing for the concise tone", async () => {
    const d = await ai.draftReply(email, { tone: "concise" });
    expect(d).toContain("Thanks,");
    expect(d).not.toContain("Best regards,");
  });
  it("still works with no tone (back-compat)", async () => {
    const d = await ai.draftReply(email);
    expect(d).toContain("[Your name]");
  });
});

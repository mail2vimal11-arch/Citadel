import { describe, it, expect } from "vitest";
import {
  TONES,
  DEFAULT_TONE,
  normalizeTone,
  toneDirective,
  systemWithTone,
  emailToText,
  buildDraftMessages,
  buildComposeMessages,
  SYSTEM_BASE,
} from "./prompts";
import type { RawEmail } from "@/lib/types";

const email: RawEmail = {
  id: "x",
  from: "Dana Lee <dana@firm.com>",
  to: "me@firm.com",
  subject: "Filing deadline",
  receivedAt: "2026-06-20T10:00:00Z",
  body: "Can you confirm the filing is ready by Friday?",
};

describe("normalizeTone", () => {
  it("accepts every known tone", () => {
    for (const t of TONES) expect(normalizeTone(t.value)).toBe(t.value);
  });
  it("falls back to the default for unknown/empty/mixed-case", () => {
    expect(normalizeTone("loud")).toBe(DEFAULT_TONE);
    expect(normalizeTone(null)).toBe(DEFAULT_TONE);
    expect(normalizeTone("PROFESSIONAL")).toBe("professional");
  });
});

describe("toneDirective / systemWithTone", () => {
  it("gives a distinct directive per tone", () => {
    const directives = new Set(TONES.map((t) => toneDirective(t.value)));
    expect(directives.size).toBe(TONES.length);
  });
  it("folds the tone directive onto the base system prompt", () => {
    const sys = systemWithTone("warm");
    expect(sys.startsWith(SYSTEM_BASE)).toBe(true);
    expect(sys).toContain(toneDirective("warm"));
  });
});

describe("emailToText", () => {
  it("includes From, Subject and the body", () => {
    const t = emailToText(email);
    expect(t).toContain("From: Dana Lee <dana@firm.com>");
    expect(t).toContain("Subject: Filing deadline");
    expect(t).toContain("Can you confirm");
  });
});

describe("buildDraftMessages", () => {
  it("puts the tone in the system message and the email in the user message", () => {
    const msgs = buildDraftMessages(email, "formal");
    expect(msgs[0].role).toBe("system");
    expect(msgs[0].content).toContain(toneDirective("formal"));
    expect(msgs[1].role).toBe("user");
    expect(msgs[1].content).toContain("Draft a short");
    expect(msgs[1].content).toContain("Filing deadline");
  });
});

describe("buildComposeMessages", () => {
  it("includes the instruction and the selected tone", () => {
    const msgs = buildComposeMessages({ instruction: "Ask for a one-week extension.", tone: "direct" });
    expect(msgs[0].content).toContain(toneDirective("direct"));
    expect(msgs[1].content).toContain("Ask for a one-week extension.");
  });
  it("adds reply context only when provided", () => {
    const withCtx = buildComposeMessages({
      instruction: "Decline politely.",
      context: { from: "Dana Lee <dana@firm.com>", subject: "Filing", summary: "Asks to confirm filing." },
    });
    expect(withCtx[1].content).toContain("This is a reply");
    expect(withCtx[1].content).toContain("Subject: Filing");

    const noCtx = buildComposeMessages({ instruction: "Decline politely." });
    expect(noCtx[1].content).not.toContain("This is a reply");
  });
  it("defaults the tone when none is given", () => {
    const msgs = buildComposeMessages({ instruction: "Hi" });
    expect(msgs[0].content).toContain(toneDirective(DEFAULT_TONE));
  });
});

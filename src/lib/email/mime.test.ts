import { describe, it, expect } from "vitest";
import { buildMimeMessage, base64Url, replySubject, extractEmail, parseRecipients } from "./mime";

describe("buildMimeMessage", () => {
  it("includes To, Subject and the body after a blank line", () => {
    const m = buildMimeMessage({ to: "a@x.com", subject: "Hello", body: "Line 1\nLine 2" });
    expect(m).toContain("To: a@x.com");
    expect(m).toContain("Subject: Hello");
    expect(m).toContain('Content-Type: text/plain; charset="UTF-8"');
    // header/body separator is a blank CRLF line
    expect(m).toMatch(/\r\n\r\nLine 1\r\nLine 2$/);
  });

  it("adds threading headers only when replying", () => {
    const reply = buildMimeMessage({ to: "a@x.com", subject: "Re: Hi", body: "ok", inReplyTo: "<id@mail>", references: "<id@mail>" });
    expect(reply).toContain("In-Reply-To: <id@mail>");
    expect(reply).toContain("References: <id@mail>");
    const plain = buildMimeMessage({ to: "a@x.com", subject: "Hi", body: "ok" });
    expect(plain).not.toContain("In-Reply-To");
  });

  it("strips CR/LF from header values (no header injection)", () => {
    const m = buildMimeMessage({ to: "a@x.com\r\nBcc: evil@x.com", subject: "x", body: "y" });
    // The CRLF is flattened, so "Bcc:" is harmless text inside To — NOT its own
    // header line. The injection is neutralized.
    expect(m).not.toContain("\r\nBcc:");
    expect(m).toContain("To: a@x.com Bcc: evil@x.com");
  });
});

describe("base64Url", () => {
  it("is URL-safe and unpadded", () => {
    const enc = base64Url("To: a@x.com\r\n\r\nbody>>>???");
    expect(enc).not.toMatch(/[+/=]/);
    expect(Buffer.from(enc.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")).toContain("To: a@x.com");
  });
});

describe("replySubject", () => {
  it("prefixes Re: once", () => {
    expect(replySubject("Filing")).toBe("Re: Filing");
    expect(replySubject("Re: Filing")).toBe("Re: Filing");
    expect(replySubject("RE: Filing")).toBe("RE: Filing");
  });
});

describe("extractEmail / parseRecipients", () => {
  it("pulls the address out of a display-name form", () => {
    expect(extractEmail("Dana Lee <dana@firm.com>")).toBe("dana@firm.com");
    expect(extractEmail("plain@x.com")).toBe("plain@x.com");
  });
  it("splits a To field into bare addresses", () => {
    expect(parseRecipients("a@x.com, Bob <b@y.com>")).toEqual(["a@x.com", "b@y.com"]);
  });
});

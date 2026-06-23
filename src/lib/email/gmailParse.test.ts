import { describe, it, expect } from "vitest";
import {
  header,
  decodeB64Url,
  stripHtml,
  extractBody,
  toRawEmail,
  type GmailMessage,
  type GmailPart,
} from "@/lib/email/gmailParse";

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");

describe("gmail payload parsing", () => {
  it("looks up headers case-insensitively", () => {
    const headers = [{ name: "From", value: "a@b.com" }];
    expect(header(headers, "from")).toBe("a@b.com");
    expect(header(headers, "Subject")).toBe("");
  });

  it("decodes base64url", () => {
    expect(decodeB64Url(b64("héllo"))).toBe("héllo");
  });

  it("strips html down to text", () => {
    expect(stripHtml("<p>Hi&nbsp;<b>there</b></p><script>x()</script>")).toBe("Hi there");
  });

  it("prefers text/plain, then html, then a single-part body", () => {
    const multipart: GmailPart = {
      mimeType: "multipart/alternative",
      parts: [
        { mimeType: "text/html", body: { data: b64("<p>html</p>") } },
        { mimeType: "text/plain", body: { data: b64("plain") } },
      ],
    };
    expect(extractBody(multipart)).toBe("plain");
    expect(extractBody({ mimeType: "text/html", body: { data: b64("<p>only html</p>") } })).toBe("only html");
    expect(extractBody({ body: { data: b64("single body") } })).toBe("single body");
    expect(extractBody(undefined)).toBe("");
  });

  it("maps a message to RawEmail with a namespaced id", () => {
    const msg: GmailMessage = {
      id: "abc123",
      internalDate: "1750636800000",
      payload: {
        headers: [
          { name: "From", value: "x@y.com" },
          { name: "Subject", value: "Hi" },
        ],
        body: { data: b64("hello") },
      },
    };
    const raw = toRawEmail(msg);
    expect(raw.id).toBe("gmail:abc123");
    expect(raw.from).toBe("x@y.com");
    expect(raw.subject).toBe("Hi");
    expect(raw.body).toBe("hello");
    expect(raw.receivedAt).toBe(new Date(1750636800000).toISOString());
  });
});

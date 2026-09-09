import { describe, it, expect } from "vitest";
import {
  formatAddress,
  joinRecipients,
  extractBody,
  toRawEmail,
  type GraphMessage,
} from "./graphParse";

describe("formatAddress", () => {
  it("renders 'Name <addr>' when both present", () => {
    expect(formatAddress({ emailAddress: { name: "Dana Lee", address: "dana@firm.com" } })).toBe(
      "Dana Lee <dana@firm.com>"
    );
  });
  it("falls back to the address or name alone", () => {
    expect(formatAddress({ emailAddress: { address: "x@y.com" } })).toBe("x@y.com");
    expect(formatAddress({ emailAddress: { name: "No Address" } })).toBe("No Address");
  });
  it("is empty for a missing recipient", () => {
    expect(formatAddress(undefined)).toBe("");
    expect(formatAddress({})).toBe("");
  });
});

describe("joinRecipients", () => {
  it("joins multiple recipients and skips empties", () => {
    expect(
      joinRecipients([
        { emailAddress: { name: "A", address: "a@x.com" } },
        { emailAddress: { address: "b@x.com" } },
        {},
      ])
    ).toBe("A <a@x.com>, b@x.com");
  });
  it("is empty for none", () => {
    expect(joinRecipients(undefined)).toBe("");
  });
});

describe("extractBody", () => {
  it("strips HTML bodies to text", () => {
    const msg: GraphMessage = {
      id: "1",
      body: { contentType: "html", content: "<p>Hello <b>there</b></p><style>x{}</style>" },
    };
    expect(extractBody(msg)).toBe("Hello there");
  });
  it("returns plain text bodies as-is", () => {
    const msg: GraphMessage = { id: "1", body: { contentType: "text", content: "  plain body  " } };
    expect(extractBody(msg)).toBe("plain body");
  });
  it("falls back to bodyPreview when there is no body", () => {
    expect(extractBody({ id: "1", bodyPreview: "preview text" })).toBe("preview text");
  });
});

describe("toRawEmail", () => {
  const msg: GraphMessage = {
    id: "AAMkAGI2",
    subject: "Quarterly filing",
    from: { emailAddress: { name: "Court Clerk", address: "clerk@court.gov" } },
    toRecipients: [{ emailAddress: { name: "Me", address: "me@firm.com" } }],
    receivedDateTime: "2026-06-20T14:30:00Z",
    body: { contentType: "html", content: "<div>Please file by Friday.</div>" },
  };

  it("maps a Graph message into the neutral RawEmail shape", () => {
    const raw = toRawEmail(msg);
    expect(raw.id).toBe("m365:AAMkAGI2"); // namespaced to avoid id collisions
    expect(raw.from).toBe("Court Clerk <clerk@court.gov>");
    expect(raw.to).toBe("Me <me@firm.com>");
    expect(raw.subject).toBe("Quarterly filing");
    expect(raw.body).toBe("Please file by Friday.");
    expect(raw.receivedAt).toBe("2026-06-20T14:30:00.000Z");
  });

  it("namespaces the id by account when one is given (multi-account)", () => {
    expect(toRawEmail(msg, "me@firm.com").id).toBe("m365:me@firm.com:AAMkAGI2");
  });

  it("tolerates missing subject and date", () => {
    const raw = toRawEmail({ id: "x", bodyPreview: "hi" });
    expect(raw.subject).toBe("");
    expect(raw.from).toBe("");
    expect(typeof raw.receivedAt).toBe("string");
    expect(raw.id).toBe("m365:x");
  });

  it("caps overly long bodies", () => {
    const long = "a".repeat(20000);
    const raw = toRawEmail({ id: "x", body: { contentType: "text", content: long } });
    expect(raw.body.length).toBeLessThan(long.length);
    expect(raw.body.endsWith("…")).toBe(true);
  });
});

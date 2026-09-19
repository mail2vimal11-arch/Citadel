import { describe, it, expect } from "vitest";
import { CompositeSource } from "./CompositeSource";
import type { EmailSource } from "./EmailSource";
import type { RawEmail } from "@/lib/types";

const raw = (id: string): RawEmail => ({ id, from: "x@y.com", to: "me", subject: id, receivedAt: "t", body: "b" });
const fake = (name: string, ids: string[]): EmailSource => ({
  name,
  listEmails: async () => ids.map(raw),
});

describe("CompositeSource", () => {
  it("merges emails from every source", async () => {
    const c = new CompositeSource([fake("A", ["gmail:1", "gmail:2"]), fake("B", ["m365:1"])]);
    const ids = (await c.listEmails()).map((e) => e.id);
    expect(ids).toEqual(["gmail:1", "gmail:2", "m365:1"]);
    expect(c.name).toContain("A");
    expect(c.name).toContain("B");
  });

  it("skips a failing source rather than throwing", async () => {
    const bad: EmailSource = { name: "bad", listEmails: async () => { throw new Error("boom"); } };
    const c = new CompositeSource([bad, fake("B", ["m365:1"])]);
    expect((await c.listEmails()).map((e) => e.id)).toEqual(["m365:1"]);
  });
});

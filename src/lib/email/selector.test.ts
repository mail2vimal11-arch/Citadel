import { describe, it, expect, afterEach } from "vitest";
import { getEmailSource } from "@/lib/email";

const original = process.env.EMAIL_SOURCE;
afterEach(() => {
  if (original === undefined) delete process.env.EMAIL_SOURCE;
  else process.env.EMAIL_SOURCE = original;
});

describe("getEmailSource selector", () => {
  it("returns the synthetic source for EMAIL_SOURCE=sample", async () => {
    process.env.EMAIL_SOURCE = "sample";
    expect((await getEmailSource("u1")).name).toMatch(/synthetic/i);
  });

  it("returns the Gmail source for EMAIL_SOURCE=gmail", async () => {
    process.env.EMAIL_SOURCE = "gmail";
    expect((await getEmailSource("u1")).name).toMatch(/gmail/i);
  });
});

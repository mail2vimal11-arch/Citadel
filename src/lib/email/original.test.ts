import { describe, it, expect } from "vitest";
import { getOriginalEmail } from "./original";
import { SAMPLE_EMAILS } from "./sampleEmails";

// The sample path needs no network or OAuth, so it's unit-testable directly.
// The Gmail/Graph paths are exercised via the provider fetch in integration.
describe("getOriginalEmail (on-demand original fetch)", () => {
  it("returns the synthetic body for a sample sourceId", async () => {
    const sample = SAMPLE_EMAILS[0];
    const got = await getOriginalEmail("u1", sample.id);
    expect(got?.body).toBe(sample.body);
    expect(got?.subject).toBe(sample.subject);
  });

  it("returns null for an unknown id (nothing to show)", async () => {
    expect(await getOriginalEmail("u1", "msg-does-not-exist")).toBeNull();
  });
});

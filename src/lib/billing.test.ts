import { describe, it, expect } from "vitest";
import { planLimits, normalizePlan, atCap, remainingQuota, PLANS } from "./billing";

describe("planLimits", () => {
  it("caps the free plan and leaves full unlimited", () => {
    expect(planLimits("free").emailCap).toBe(2);
    expect(planLimits("free").maxBodyChars).toBe(2000);
    expect(planLimits("full").emailCap).toBeNull();
    expect(planLimits("full").maxBodyChars).toBeNull();
  });
});

describe("normalizePlan", () => {
  it("defaults to free for anything but 'full'", () => {
    expect(normalizePlan("full")).toBe("full");
    expect(normalizePlan("free")).toBe("free");
    expect(normalizePlan("enterprise")).toBe("free");
    expect(normalizePlan(null)).toBe("free");
  });
  it("only knows free and full", () => {
    expect(PLANS).toEqual(["free", "full"]);
  });
});

describe("atCap / remainingQuota", () => {
  it("free hits the cap at 2 active items", () => {
    expect(atCap("free", 1)).toBe(false);
    expect(atCap("free", 2)).toBe(true);
    expect(atCap("free", 3)).toBe(true);
    expect(remainingQuota("free", 0)).toBe(2);
    expect(remainingQuota("free", 2)).toBe(0);
  });
  it("full is never capped", () => {
    expect(atCap("full", 9999)).toBe(false);
    expect(remainingQuota("full", 9999)).toBe(Infinity);
  });
});

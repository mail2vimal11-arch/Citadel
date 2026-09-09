import { describe, it, expect } from "vitest";
import { intervalMs, computeForgetAt } from "@/lib/settings";

describe("forget schedule math", () => {
  it("maps each interval to milliseconds", () => {
    expect(intervalMs("1h")).toBe(3_600_000);
    expect(intervalMs("24h")).toBe(86_400_000);
    expect(intervalMs("7d")).toBe(604_800_000);
    expect(intervalMs("logout")).toBeNull();
  });

  it("computes the forget deadline from processedAt", () => {
    const t0 = new Date("2026-06-23T00:00:00.000Z");
    expect(computeForgetAt(t0, "24h")?.toISOString()).toBe("2026-06-24T00:00:00.000Z");
    expect(computeForgetAt(t0, "1h")?.toISOString()).toBe("2026-06-23T01:00:00.000Z");
  });

  it("returns null for logout (no automatic timer)", () => {
    expect(computeForgetAt(new Date(), "logout")).toBeNull();
  });
});

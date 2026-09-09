import { describe, it, expect } from "vitest";
import { snoozeUntil, isSnoozed, formatWake, SNOOZE_PRESETS } from "./schedule";

// A fixed Wednesday afternoon for deterministic assertions.
const now = new Date("2026-06-24T14:00:00"); // local time; Wed, 2pm

describe("snoozeUntil", () => {
  it("'later' is exactly 3 hours out", () => {
    expect(snoozeUntil("later", now).getTime() - now.getTime()).toBe(3 * 60 * 60 * 1000);
  });
  it("'evening' is 6pm the same day when it's still afternoon", () => {
    const d = snoozeUntil("evening", now);
    expect(d.getHours()).toBe(18);
    expect(d.toDateString()).toBe(now.toDateString());
  });
  it("'evening' rolls to next morning when it's already evening", () => {
    const late = new Date("2026-06-24T20:00:00");
    const d = snoozeUntil("evening", late);
    expect(d.getHours()).toBe(9);
    expect(d.getDate()).toBe(late.getDate() + 1);
  });
  it("'tomorrow' is 9am the next day", () => {
    const d = snoozeUntil("tomorrow", now);
    expect(d.getHours()).toBe(9);
    expect(d.getDate()).toBe(now.getDate() + 1);
  });
  it("'nextweek' is a Monday 9am strictly in the future", () => {
    const d = snoozeUntil("nextweek", now);
    expect(d.getDay()).toBe(1); // Monday
    expect(d.getHours()).toBe(9);
    expect(d.getTime()).toBeGreaterThan(now.getTime());
  });
  it("every preset resolves to a future time", () => {
    for (const p of SNOOZE_PRESETS) expect(snoozeUntil(p.id, now).getTime()).toBeGreaterThan(now.getTime());
  });
});

describe("isSnoozed", () => {
  it("is true while the wake time is in the future", () => {
    expect(isSnoozed(snoozeUntil("tomorrow", now).toISOString(), now)).toBe(true);
  });
  it("is false once the wake time has passed", () => {
    expect(isSnoozed("2026-06-24T13:00:00.000Z", new Date("2026-06-24T14:00:00.000Z"))).toBe(false);
  });
  it("is false for no wake time", () => {
    expect(isSnoozed(null, now)).toBe(false);
  });
});

describe("formatWake", () => {
  it("shows just the time for the same day", () => {
    const d = new Date("2026-06-24T17:30:00");
    expect(formatWake(d.toISOString(), now)).not.toMatch(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/);
  });
  it("includes the weekday for another day", () => {
    const d = snoozeUntil("nextweek", now);
    expect(formatWake(d.toISOString(), now)).toMatch(/Mon/);
  });
});

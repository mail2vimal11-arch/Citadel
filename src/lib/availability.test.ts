import { describe, it, expect } from "vitest";
import { freeSlots, proposeTimes, formatSlot, buildIcs, type Interval } from "./availability";

const iso = (s: string) => new Date(s).toISOString();

describe("freeSlots", () => {
  const dayStart = new Date("2026-06-24T09:00:00");
  const dayEnd = new Date("2026-06-24T17:00:00");

  it("returns the whole window when nothing is busy", () => {
    const slots = freeSlots(dayStart, dayEnd, [], 30);
    expect(slots).toHaveLength(1);
    expect(Date.parse(slots[0].start)).toBe(dayStart.getTime());
    expect(Date.parse(slots[0].end)).toBe(dayEnd.getTime());
  });

  it("splits around a busy block", () => {
    const busy: Interval[] = [{ start: iso("2026-06-24T12:00:00"), end: iso("2026-06-24T13:00:00") }];
    const slots = freeSlots(dayStart, dayEnd, busy, 30);
    expect(slots).toHaveLength(2);
    expect(new Date(slots[0].end).getHours()).toBe(12);
    expect(new Date(slots[1].start).getHours()).toBe(13);
  });

  it("drops gaps shorter than the requested duration", () => {
    const busy: Interval[] = [
      { start: iso("2026-06-24T09:20:00"), end: iso("2026-06-24T16:50:00") },
    ];
    // Only a 20-min gap at the start and a 10-min gap at the end — neither fits 30.
    expect(freeSlots(dayStart, dayEnd, busy, 30)).toHaveLength(0);
  });
});

describe("proposeTimes", () => {
  it("suggests future weekday slots at the preferred hour", () => {
    const now = new Date("2026-06-24T08:00:00"); // Wed morning
    const slots = proposeTimes(now, 3, { hour: 10 });
    expect(slots).toHaveLength(3);
    for (const s of slots) {
      const d = new Date(s.start);
      expect(d.getHours()).toBe(10);
      expect(d.getDay()).not.toBe(0); // not Sunday
      expect(d.getDay()).not.toBe(6); // not Saturday
      expect(d.getTime()).toBeGreaterThan(now.getTime());
    }
  });

  it("skips a day whose preferred hour already passed", () => {
    const now = new Date("2026-06-24T14:00:00"); // 2pm — 10am today is gone
    const first = proposeTimes(now, 1, { hour: 10 })[0];
    expect(new Date(first.start).getDate()).toBeGreaterThan(now.getDate()); // tomorrow+
  });
});

describe("buildIcs", () => {
  it("emits a VEVENT with the slot and title", () => {
    const slot: Interval = { start: iso("2026-06-25T10:00:00Z"), end: iso("2026-06-25T10:30:00Z") };
    const out = buildIcs("Call re: Filing", slot, "2026-06-24T00:00:00.000Z");
    expect(out).toContain("BEGIN:VEVENT");
    expect(out).toContain("SUMMARY:Call re: Filing");
    expect(out).toContain("DTSTART:20260625T100000Z");
    expect(out).toContain("END:VCALENDAR");
  });
});

describe("formatSlot", () => {
  it("renders a readable weekday + time", () => {
    const out = formatSlot({ start: iso("2026-06-25T10:00:00"), end: iso("2026-06-25T10:30:00") });
    expect(out).toMatch(/Thu/);
  });
});

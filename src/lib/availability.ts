// ============================================================================
// Calendar / availability (P10) — pure, DOM-free, `now` injectable for tests.
//
// `freeSlots` is the general primitive a real calendar integration would feed
// busy blocks into. `proposeTimes` uses it on an open working day to suggest
// meeting times for a reply, and `buildIcs` turns a chosen slot into a
// downloadable calendar event ("create event from email").
//
// TODO(production): real free/busy needs a Calendar scope (Google Calendar /
// Microsoft Graph calendars). Until then we model an open working day.
// ============================================================================

export type Interval = { start: string; end: string }; // ISO 8601

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17;

function atHour(base: Date, dayOffset: number, hour: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d;
}
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

// Free gaps (>= durationMin) within [dayStart, dayEnd], given busy intervals.
export function freeSlots(
  dayStart: Date,
  dayEnd: Date,
  busy: Interval[],
  durationMin: number
): Interval[] {
  const durMs = durationMin * 60_000;
  // Clamp busy to the window and sort by start.
  const blocks = busy
    .map((b) => ({ start: Math.max(Date.parse(b.start), dayStart.getTime()), end: Math.min(Date.parse(b.end), dayEnd.getTime()) }))
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start);

  const slots: Interval[] = [];
  let cursor = dayStart.getTime();
  for (const b of blocks) {
    if (b.start - cursor >= durMs) {
      slots.push({ start: new Date(cursor).toISOString(), end: new Date(b.start).toISOString() });
    }
    cursor = Math.max(cursor, b.end);
  }
  if (dayEnd.getTime() - cursor >= durMs) {
    slots.push({ start: new Date(cursor).toISOString(), end: new Date(dayEnd.getTime()).toISOString() });
  }
  return slots;
}

// Suggest the next `count` meeting slots: one per upcoming weekday at `hour`,
// skipping weekends and any time already past. Uses freeSlots on an open day.
export function proposeTimes(
  now: Date,
  count: number,
  opts: { hour?: number; durationMin?: number } = {}
): Interval[] {
  const hour = opts.hour ?? 10;
  const durationMin = opts.durationMin ?? 30;
  const out: Interval[] = [];
  for (let dayOffset = 0; out.length < count && dayOffset < 21; dayOffset++) {
    const dayStart = atHour(now, dayOffset, WORK_START_HOUR);
    if (isWeekend(dayStart)) continue;
    const dayEnd = atHour(now, dayOffset, WORK_END_HOUR);
    const preferred = atHour(now, dayOffset, hour);
    // Only consider the preferred hour if it's in the future and within hours.
    if (preferred.getTime() <= now.getTime()) continue;
    const free = freeSlots(preferred, dayEnd, [], durationMin);
    if (free.length) {
      out.push({ start: free[0].start, end: new Date(Date.parse(free[0].start) + durationMin * 60_000).toISOString() });
    }
  }
  return out;
}

export function formatSlot(slot: Interval): string {
  const d = new Date(slot.start);
  const day = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} ${time}`;
}

// Minimal RFC 5545 VEVENT for a download. dtstamp is passed in (no Date.now here).
export function buildIcs(title: string, slot: Interval, dtstamp: string): string {
  const ics = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Citadel//Sovereign Inbox//EN",
    "BEGIN:VEVENT",
    `DTSTAMP:${ics(dtstamp)}`,
    `DTSTART:${ics(slot.start)}`,
    `DTEND:${ics(slot.end)}`,
    `SUMMARY:${title.replace(/\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

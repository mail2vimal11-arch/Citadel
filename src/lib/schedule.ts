// ============================================================================
// Scheduling primitives (P9) — pure, DOM-free, `now` injectable for tests.
//
// Powers Snooze / Remind-me (hide an item until a chosen time, then it
// reappears). The same `dueAt` math is what a real Send-Later would schedule on —
// but the prototype's mailbox connectors are READ-ONLY, so actual transmission
// is out of scope. TODO(production): scheduled send needs a send-capable scope +
// an outbound queue.
// ============================================================================

export type SnoozePresetId = "later" | "evening" | "tomorrow" | "nextweek";

export const SNOOZE_PRESETS: { id: SnoozePresetId; label: string }[] = [
  { id: "later", label: "Later today (3h)" },
  { id: "evening", label: "This evening" },
  { id: "tomorrow", label: "Tomorrow 9am" },
  { id: "nextweek", label: "Next week" },
];

const atHour = (base: Date, dayOffset: number, hour: number): Date => {
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d;
};

// Resolve a preset to an absolute wake time relative to `now`.
export function snoozeUntil(preset: SnoozePresetId, now: Date = new Date()): Date {
  switch (preset) {
    case "later":
      return new Date(now.getTime() + 3 * 60 * 60 * 1000);
    case "evening": {
      // 6pm today, unless it's already 6pm+ — then tomorrow 9am.
      return now.getHours() < 18 ? atHour(now, 0, 18) : atHour(now, 1, 9);
    }
    case "tomorrow":
      return atHour(now, 1, 9);
    case "nextweek": {
      // Next Monday at 9am.
      const day = now.getDay(); // 0=Sun..6=Sat
      const daysUntilMonday = ((8 - day) % 7) || 7; // always 1..7 ahead
      return atHour(now, daysUntilMonday, 9);
    }
  }
}

// Is a wake time still in the future (item stays hidden)?
export function isSnoozed(wakeAt: string | null | undefined, now: Date = new Date()): boolean {
  if (!wakeAt) return false;
  return Date.parse(wakeAt) > now.getTime();
}

// Short human label for a wake time, e.g. "Mon 9:00 AM" / "2:30 PM".
export function formatWake(wakeAt: string, now: Date = new Date()): string {
  const d = new Date(wakeAt);
  const sameDay = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (sameDay) return time;
  const day = d.toLocaleDateString(undefined, { weekday: "short" });
  return `${day} ${time}`;
}

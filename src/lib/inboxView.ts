// ============================================================================
// Inbox view-model — the pure logic behind the reading UX (P4).
//
// Kept separate from the React component so it can be unit-tested in Node with
// no DOM: sorting, keyboard-key → action mapping, selection movement, the
// forget countdown, the client-side "done" declutter, and pagination. The
// component stays a thin shell over these functions.
// ============================================================================

export type Priority = "Urgent" | "Action needed" | "FYI" | "Low";

export type Payload = {
  from: string;
  subject: string;
  receivedAt: string;
  summary: string;
  priority: Priority;
  triageLabel: string;
  draftReply: string;
};

export type ActiveItem = {
  id: string;
  status: "ACTIVE";
  processedAt: string;
  forgetAt: string | null;
  payload: Payload;
};

export type ForgottenItem = {
  id: string;
  status: "FORGOTTEN";
  processedAt: string;
  forgottenAt: string;
};

export type Item = ActiveItem | ForgottenItem;

// Lower rank = more important = higher in the list.
const PRIORITY_RANK: Record<Priority, number> = {
  Urgent: 0,
  "Action needed": 1,
  FYI: 2,
  Low: 3,
};

export function priorityRank(p: Priority): number {
  return PRIORITY_RANK[p] ?? 99;
}

// A real inbox order: ACTIVE first (by priority, then most-recently received),
// FORGOTTEN sinks to the bottom (most-recently forgotten first). Pure + stable.
export function sortItems(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    if (a.status !== b.status) return a.status === "ACTIVE" ? -1 : 1;
    if (a.status === "ACTIVE" && b.status === "ACTIVE") {
      const pr = priorityRank(a.payload.priority) - priorityRank(b.payload.priority);
      if (pr !== 0) return pr;
      return Date.parse(b.payload.receivedAt) - Date.parse(a.payload.receivedAt);
    }
    const af = (a as ForgottenItem).forgottenAt;
    const bf = (b as ForgottenItem).forgottenAt;
    return Date.parse(bf) - Date.parse(af);
  });
}

// Client-only "done" declutter (like archive): hide handled items unless the
// user asks to see them. Never touches server data — it is purely a view filter.
export function applyDone(items: Item[], doneIds: ReadonlySet<string>, showDone: boolean): Item[] {
  if (showDone) return items;
  return items.filter((i) => !doneIds.has(i.id));
}

// Keyboard map. Returns a stable action name (or null to ignore). Superhuman-ish:
// j/k move, Enter/o open, e mark done, f forget, r refresh, / search, Esc close.
export type InboxAction =
  | "next"
  | "prev"
  | "open"
  | "close"
  | "done"
  | "forget"
  | "refresh"
  | "search";

export function keyAction(key: string): InboxAction | null {
  switch (key) {
    case "j":
    case "ArrowDown":
      return "next";
    case "k":
    case "ArrowUp":
      return "prev";
    case "Enter":
    case "o":
      return "open";
    case "Escape":
      return "close";
    case "e":
      return "done";
    case "f":
      return "forget";
    case "r":
      return "refresh";
    case "/":
      return "search";
    default:
      return null;
  }
}

// Move a selection index by delta, clamped to the list. Returns -1 for empty.
export function moveIndex(index: number, delta: number, length: number): number {
  if (length <= 0) return -1;
  const next = index + delta;
  if (next < 0) return 0;
  if (next > length - 1) return length - 1;
  return next;
}

// Human countdown to a forget deadline. now is injectable for testing.
export function forgetCountdown(forgetAt: string | null, now: Date = new Date()): string {
  if (!forgetAt) return "no auto-forget";
  const diffMs = Date.parse(forgetAt) - now.getTime();
  if (diffMs <= 0) return "forgetting…";
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `in ${hours}h`;
  const days = Math.round(hours / 24);
  return `in ${days}d`;
}

export type Page<T> = { slice: T[]; page: number; pageCount: number; total: number };

// Clamp the page into range and return just that slice. Pure; safe for any page.
export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const clamped = Math.min(Math.max(0, page), pageCount - 1);
  const start = clamped * pageSize;
  return { slice: items.slice(start, start + pageSize), page: clamped, pageCount, total };
}

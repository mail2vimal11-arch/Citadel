// ============================================================================
// Split Inbox — pure lane routing (P6).
//
// Groups inbox items into "lanes" (Important / VIP / Newsletters / Everything
// else / Forgotten) by simple, explainable rules, the way Superhuman's Split
// Inbox does. Kept pure and DOM-free so the routing is unit-tested; the inbox
// component only renders the result.
//
// The single user-defined rule is the VIP sender list (substring match), kept
// client-side like the "done" declutter. TODO(production): full user-defined
// lane CRUD + server-persisted rules.
// ============================================================================
import type { Item } from "./inboxView";

export type LaneId = "vip" | "important" | "news" | "other" | "forgotten";

export type Lane = { id: LaneId; name: string; description: string };

// Order matters: lanes render top-to-bottom in this sequence, and assignLane
// returns the FIRST matching lane (so VIP wins over Important, etc.).
export const LANES: Lane[] = [
  { id: "vip", name: "VIP", description: "From people you flagged as important" },
  { id: "important", name: "Important", description: "Urgent or needs an action from you" },
  { id: "news", name: "Newsletters & notices", description: "Low-priority, informational" },
  { id: "other", name: "Everything else", description: "The rest of your active mail" },
  { id: "forgotten", name: "Forgotten", description: "Content destroyed (key shredded)" },
];

// Parse the user's VIP list: comma- or newline-separated sender fragments.
export function parseVips(raw: string | null | undefined): string[] {
  return (raw ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function matchesVip(from: string, vips: string[]): boolean {
  const f = from.toLowerCase();
  return vips.some((v) => f.includes(v));
}

// Which lane does a single item belong to? First match wins (LANES order).
export function assignLane(item: Item, vips: string[]): LaneId {
  if (item.status === "FORGOTTEN") return "forgotten";
  const p = item.payload;
  if (vips.length && matchesVip(p.from, vips)) return "vip";
  if (p.priority === "Urgent" || p.priority === "Action needed") return "important";
  if (p.triageLabel === "Newsletter / notice" || p.priority === "Low") return "news";
  return "other";
}

export type LaneGroup = { lane: Lane; items: Item[] };

// Group an already-sorted item list into its non-empty lanes, in LANES order.
// Items keep their incoming (sorted) order within each lane.
export function groupIntoLanes(items: Item[], vips: string[]): LaneGroup[] {
  const buckets = new Map<LaneId, Item[]>();
  for (const item of items) {
    const id = assignLane(item, vips);
    const arr = buckets.get(id);
    if (arr) arr.push(item);
    else buckets.set(id, [item]);
  }
  return LANES.map((lane) => ({ lane, items: buckets.get(lane.id) ?? [] })).filter(
    (g) => g.items.length > 0
  );
}

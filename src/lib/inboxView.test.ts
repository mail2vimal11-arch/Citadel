import { describe, it, expect } from "vitest";
import {
  sortItems,
  applyDone,
  keyAction,
  moveIndex,
  forgetCountdown,
  paginate,
  priorityRank,
  type Item,
  type Priority,
} from "./inboxView";

function active(id: string, priority: Priority, receivedAt: string, forgetAt: string | null = null): Item {
  return {
    id,
    status: "ACTIVE",
    processedAt: receivedAt,
    forgetAt,
    payload: {
      from: `${id}@x.com`,
      subject: `subj ${id}`,
      receivedAt,
      summary: `summary ${id}`,
      priority,
      triageLabel: "Label",
      draftReply: "draft",
    },
  };
}
function forgotten(id: string, forgottenAt: string): Item {
  return { id, status: "FORGOTTEN", processedAt: forgottenAt, forgottenAt };
}

describe("priorityRank", () => {
  it("orders Urgent < Action needed < FYI < Low", () => {
    expect(priorityRank("Urgent")).toBeLessThan(priorityRank("Action needed"));
    expect(priorityRank("Action needed")).toBeLessThan(priorityRank("FYI"));
    expect(priorityRank("FYI")).toBeLessThan(priorityRank("Low"));
  });
});

describe("sortItems", () => {
  it("puts active before forgotten, by priority then recency", () => {
    const items: Item[] = [
      forgotten("g1", "2026-06-23T10:00:00Z"),
      active("a", "Low", "2026-06-23T09:00:00Z"),
      active("b", "Urgent", "2026-06-23T08:00:00Z"),
      active("c", "Urgent", "2026-06-23T09:30:00Z"),
    ];
    const sorted = sortItems(items).map((i) => i.id);
    // Urgent newest (c) then urgent older (b), then Low (a), then forgotten.
    expect(sorted).toEqual(["c", "b", "a", "g1"]);
  });

  it("does not mutate the input", () => {
    const items = [active("a", "Low", "2026-06-23T09:00:00Z"), active("b", "Urgent", "2026-06-23T08:00:00Z")];
    const copy = [...items];
    sortItems(items);
    expect(items).toEqual(copy);
  });
});

describe("applyDone", () => {
  const items = [active("a", "Urgent", "t"), active("b", "Low", "t")];
  it("hides done items by default", () => {
    expect(applyDone(items, new Set(["a"]), false).map((i) => i.id)).toEqual(["b"]);
  });
  it("shows them when asked", () => {
    expect(applyDone(items, new Set(["a"]), true).map((i) => i.id)).toEqual(["a", "b"]);
  });
});

describe("keyAction", () => {
  it("maps navigation and action keys", () => {
    expect(keyAction("j")).toBe("next");
    expect(keyAction("ArrowDown")).toBe("next");
    expect(keyAction("k")).toBe("prev");
    expect(keyAction("ArrowUp")).toBe("prev");
    expect(keyAction("Enter")).toBe("open");
    expect(keyAction("o")).toBe("open");
    expect(keyAction("Escape")).toBe("close");
    expect(keyAction("e")).toBe("done");
    expect(keyAction("f")).toBe("forget");
    expect(keyAction("r")).toBe("refresh");
    expect(keyAction("/")).toBe("search");
  });
  it("ignores unmapped keys", () => {
    expect(keyAction("x")).toBeNull();
    expect(keyAction("Shift")).toBeNull();
  });
});

describe("moveIndex", () => {
  it("clamps within bounds and handles empty", () => {
    expect(moveIndex(0, 1, 3)).toBe(1);
    expect(moveIndex(2, 1, 3)).toBe(2); // clamp at end
    expect(moveIndex(0, -1, 3)).toBe(0); // clamp at start
    expect(moveIndex(0, 1, 0)).toBe(-1); // empty list
  });
});

describe("forgetCountdown", () => {
  const now = new Date("2026-06-23T12:00:00Z");
  it("formats minutes, hours, days", () => {
    expect(forgetCountdown("2026-06-23T12:30:00Z", now)).toBe("in 30m");
    expect(forgetCountdown("2026-06-23T15:00:00Z", now)).toBe("in 3h");
    expect(forgetCountdown("2026-06-25T12:00:00Z", now)).toBe("in 2d");
  });
  it("handles past and missing deadlines", () => {
    expect(forgetCountdown("2026-06-23T11:00:00Z", now)).toBe("forgetting…");
    expect(forgetCountdown(null, now)).toBe("no auto-forget");
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 23 }, (_, i) => i);
  it("slices a page and reports counts", () => {
    const p = paginate(items, 0, 10);
    expect(p.slice).toHaveLength(10);
    expect(p.pageCount).toBe(3);
    expect(p.total).toBe(23);
  });
  it("clamps an out-of-range page to the last", () => {
    const p = paginate(items, 99, 10);
    expect(p.page).toBe(2);
    expect(p.slice).toEqual([20, 21, 22]);
  });
  it("always has at least one page when empty", () => {
    expect(paginate([], 0, 10).pageCount).toBe(1);
  });
});

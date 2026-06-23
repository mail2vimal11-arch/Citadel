import { describe, it, expect } from "vitest";
import { parseVips, assignLane, groupIntoLanes, LANES } from "./lanes";
import type { Item, Priority } from "./inboxView";

function active(id: string, priority: Priority, from: string, triageLabel = "Correspondence"): Item {
  return {
    id,
    status: "ACTIVE",
    processedAt: "2026-06-23T10:00:00Z",
    forgetAt: null,
    payload: { from, subject: `s ${id}`, receivedAt: "2026-06-23T10:00:00Z", summary: "", priority, triageLabel, draftReply: "" },
  };
}
const forgotten = (id: string): Item => ({ id, status: "FORGOTTEN", processedAt: "t", forgottenAt: "t" });

describe("parseVips", () => {
  it("splits on commas and newlines, trims, lowercases, drops empties", () => {
    expect(parseVips("Dana@firm.com,  Court\n , partner@x.com ")).toEqual([
      "dana@firm.com",
      "court",
      "partner@x.com",
    ]);
  });
  it("is empty for blank input", () => {
    expect(parseVips("")).toEqual([]);
    expect(parseVips(null)).toEqual([]);
  });
});

describe("assignLane", () => {
  const vips = ["dana@firm.com"];
  it("routes forgotten items to the forgotten lane", () => {
    expect(assignLane(forgotten("g"), vips)).toBe("forgotten");
  });
  it("routes VIP senders to vip — even when also urgent", () => {
    expect(assignLane(active("a", "Urgent", "Dana <dana@firm.com>"), vips)).toBe("vip");
  });
  it("routes urgent / action-needed to important", () => {
    expect(assignLane(active("a", "Urgent", "x@y.com"), vips)).toBe("important");
    expect(assignLane(active("b", "Action needed", "x@y.com"), vips)).toBe("important");
  });
  it("routes newsletters and Low priority to news", () => {
    expect(assignLane(active("a", "FYI", "x@y.com", "Newsletter / notice"), vips)).toBe("news");
    expect(assignLane(active("b", "Low", "x@y.com"), vips)).toBe("news");
  });
  it("routes the remainder to other", () => {
    expect(assignLane(active("a", "FYI", "x@y.com"), vips)).toBe("other");
  });
  it("ignores VIP matching when the list is empty", () => {
    expect(assignLane(active("a", "Urgent", "dana@firm.com"), [])).toBe("important");
  });
});

describe("groupIntoLanes", () => {
  it("returns only non-empty lanes, in LANES order, preserving item order", () => {
    const items = [
      active("imp", "Urgent", "x@y.com"),
      active("vip1", "FYI", "dana@firm.com"),
      active("news1", "Low", "news@z.com"),
      forgotten("g1"),
      active("vip2", "Action needed", "dana@firm.com"),
    ];
    const groups = groupIntoLanes(items, ["dana@firm.com"]);
    expect(groups.map((g) => g.lane.id)).toEqual(["vip", "important", "news", "forgotten"]);
    // VIP lane keeps incoming order (vip1 before vip2).
    expect(groups[0].items.map((i) => i.id)).toEqual(["vip1", "vip2"]);
  });

  it("omits lanes with no items", () => {
    const groups = groupIntoLanes([active("a", "FYI", "x@y.com")], []);
    expect(groups).toHaveLength(1);
    expect(groups[0].lane.id).toBe("other");
  });

  it("covers every lane id from the LANES table", () => {
    expect(LANES.map((l) => l.id)).toEqual(["vip", "important", "news", "other", "forgotten"]);
  });
});

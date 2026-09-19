import { describe, it, expect } from "vitest";
import { fuzzyScore, filterCommands, type CommandDef } from "./commands";

const cmds: CommandDef[] = [
  { id: "process", label: "Process inbox", keywords: ["run", "ai"] },
  { id: "settings", label: "Go to Settings", keywords: ["tone", "schedule"] },
  { id: "forget", label: "Forget all", keywords: ["shred", "delete"] },
];

describe("fuzzyScore", () => {
  it("returns 0 for an empty query (everything matches)", () => {
    expect(fuzzyScore("", "anything")).toBe(0);
  });
  it("scores a substring higher than a subsequence", () => {
    const sub = fuzzyScore("set", "Go to Settings")!; // substring "set"
    const seq = fuzzyScore("gts", "Go to Settings")!; // subsequence
    expect(sub).toBeGreaterThan(seq);
  });
  it("rewards earlier substring position", () => {
    expect(fuzzyScore("go", "Go to Settings")!).toBeGreaterThan(fuzzyScore("settings", "Go to Settings")!);
  });
  it("returns null when characters are missing/out of order", () => {
    expect(fuzzyScore("zzz", "Process inbox")).toBeNull();
  });
});

describe("filterCommands", () => {
  it("keeps original order for an empty query", () => {
    expect(filterCommands("", cmds).map((c) => c.id)).toEqual(["process", "settings", "forget"]);
  });
  it("matches on the label", () => {
    expect(filterCommands("forget", cmds).map((c) => c.id)).toEqual(["forget"]);
  });
  it("matches on keywords too", () => {
    expect(filterCommands("shred", cmds).map((c) => c.id)).toEqual(["forget"]);
    expect(filterCommands("tone", cmds).map((c) => c.id)).toEqual(["settings"]);
  });
  it("excludes non-matches", () => {
    expect(filterCommands("xyzzy", cmds)).toEqual([]);
  });
  it("ranks the strongest match first", () => {
    // "in" is a substring of "Process inbox"; subsequence elsewhere.
    expect(filterCommands("inbox", cmds)[0].id).toBe("process");
  });
});

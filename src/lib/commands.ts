// ============================================================================
// Command palette core (P11) — pure, DOM-free matching/ranking, unit-tested.
//
// The UI builds a list of commands (with their actions); this module does the
// fuzzy filtering + ranking so the Cmd+K palette stays a thin shell.
// ============================================================================

export type CommandDef = { id: string; label: string; keywords?: string[]; hint?: string };

// Score how well `query` matches `text`: substring match ranks highest (earlier
// position = better), then subsequence match (weaker), else null = no match.
export function fuzzyScore(query: string, text: string): number | null {
  const q = query.trim().toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 0;
  const idx = t.indexOf(q);
  if (idx >= 0) return 1000 - idx; // substring
  // subsequence: every char of q appears in order in t
  let ti = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found < 0) return null;
    ti = found + 1;
  }
  return 100 - q.length; // weak match
}

// Filter + rank commands against a query. Empty query keeps the original order.
export function filterCommands<T extends CommandDef>(query: string, cmds: T[]): T[] {
  return cmds
    .map((c, i) => {
      const texts = [c.label, ...(c.keywords ?? [])];
      let best: number | null = null;
      for (const t of texts) {
        const s = fuzzyScore(query, t);
        if (s !== null && (best === null || s > best)) best = s;
      }
      return { c, i, best };
    })
    .filter((x): x is { c: T; i: number; best: number } => x.best !== null)
    .sort((a, b) => b.best - a.best || a.i - b.i)
    .map((x) => x.c);
}

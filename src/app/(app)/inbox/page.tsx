"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  sortItems,
  applyDone,
  keyAction,
  moveIndex,
  forgetCountdown,
  paginate,
  type Item,
  type ActiveItem,
  type ForgottenItem,
  type Priority,
} from "@/lib/inboxView";
import { groupIntoLanes, parseVips } from "@/lib/lanes";
import { isSnoozed, snoozeUntil, formatWake, SNOOZE_PRESETS, type SnoozePresetId } from "@/lib/schedule";
import { proposeTimes, formatSlot, buildIcs } from "@/lib/availability";
import { filterCommands, type CommandDef } from "@/lib/commands";

type Command = CommandDef & { run: () => void };

const PAGE_SIZE = 20;
const DONE_KEY = "citadel:done";
const VIP_KEY = "citadel:vips";
const SPLIT_KEY = "citadel:split";
const SNOOZE_KEY = "citadel:snooze";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const priorityClass = (p: Priority) =>
  p === "Urgent" ? "p-Urgent" : p === "Action needed" ? "p-Action" : p === "FYI" ? "p-FYI" : "p-Low";

const intervalLabel: Record<string, string> = {
  "1h": "1 hour after processing",
  "24h": "24 hours after processing",
  "7d": "7 days after processing",
  logout: "only on logout",
};

export default function InboxPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [forgetInterval, setForgetInterval] = useState<string>("24h");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "info"; text: string } | null>(null);
  type MailStatus = { configured: boolean; accounts: { accountId: string; email?: string }[] };
  const [gmail, setGmail] = useState<MailStatus>({ configured: false, accounts: [] });
  const [m365, setM365] = useState<MailStatus>({ configured: false, accounts: [] });

  // Reading UX state.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [showDone, setShowDone] = useState(false);
  // Split Inbox (P6): group into lanes, with a client-side VIP sender list.
  const [split, setSplit] = useState(true);
  const [vipText, setVipText] = useState("");
  const [editingVips, setEditingVips] = useState(false);
  // Snooze / remind-me (P9): id -> wake-time ISO. Client-only, like "done".
  const [snoozeMap, setSnoozeMap] = useState<Record<string, string>>({});
  const [showSnoozed, setShowSnoozed] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false); // Cmd+K (P11)

  // ---- Data loading --------------------------------------------------------
  const loadGmail = useCallback(async () => {
    const res = await fetch("/api/auth/google/status", { cache: "no-store" });
    setGmail(await res.json());
  }, []);

  const loadM365 = useCallback(async () => {
    const res = await fetch("/api/auth/microsoft/status", { cache: "no-store" });
    setM365(await res.json());
  }, []);

  const load = useCallback(async () => {
    const res = await fetch("/api/items", { cache: "no-store" });
    const data = await res.json();
    setItems(data.items);
    setForgetInterval(data.forgetInterval);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    loadGmail();
    loadM365();
  }, [load, loadGmail, loadM365]);

  // Restore the client-only "done" set (declutter is a local view, never sent
  // to the server — it does not delete or forget anything).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DONE_KEY);
      if (raw) setDoneIds(new Set(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
  }, []);
  const persistDone = (next: Set<string>) => {
    setDoneIds(next);
    try {
      localStorage.setItem(DONE_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };

  // Restore Split Inbox preferences (VIP list + split on/off) + snoozes. Client-only.
  useEffect(() => {
    try {
      setVipText(localStorage.getItem(VIP_KEY) ?? "");
      const s = localStorage.getItem(SPLIT_KEY);
      if (s !== null) setSplit(s === "1");
      const sn = localStorage.getItem(SNOOZE_KEY);
      if (sn) setSnoozeMap(JSON.parse(sn));
    } catch {
      /* ignore */
    }
  }, []);
  const persistSnooze = (next: Record<string, string>) => {
    setSnoozeMap(next);
    try {
      localStorage.setItem(SNOOZE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };
  const saveVips = (raw: string) => {
    setVipText(raw);
    try {
      localStorage.setItem(VIP_KEY, raw);
    } catch {
      /* ignore */
    }
  };
  const toggleSplit = () => {
    setSplit((s) => {
      const next = !s;
      try {
        localStorage.setItem(SPLIT_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // Show a message after returning from a mailbox OAuth redirect (Google sets
  // ?gmail=, Microsoft sets ?m365=), then clean the param out of the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provider = params.get("gmail") ? "Gmail" : params.get("m365") ? "Microsoft 365" : null;
    const status = params.get("gmail") ?? params.get("m365");
    if (!provider || !status) return;
    const messages: Record<string, { kind: "ok" | "info"; text: string }> = {
      connected: { kind: "ok", text: `${provider} connected. “Process inbox” now reads your real mail (read-only).` },
      denied: { kind: "info", text: `${provider} connection cancelled — still using synthetic demo data.` },
      error: { kind: "info", text: `Couldn’t connect ${provider}. Check your setup and try again.` },
    };
    if (messages[status]) setFlash(messages[status]);
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  // ---- Derived view --------------------------------------------------------
  const sorted = useMemo(() => sortItems(items), [items]);
  const afterDone = useMemo(() => applyDone(sorted, doneIds, showDone), [sorted, doneIds, showDone]);
  // Hide snoozed items until their wake time (unless the user is viewing them).
  const snoozedCount = useMemo(
    () => afterDone.filter((i) => isSnoozed(snoozeMap[i.id])).length,
    [afterDone, snoozeMap]
  );
  const visible = useMemo(
    () => (showSnoozed ? afterDone : afterDone.filter((i) => !isSnoozed(snoozeMap[i.id]))),
    [afterDone, snoozeMap, showSnoozed]
  );
  const paged = useMemo(() => paginate(visible, page, PAGE_SIZE), [visible, page]);
  const vips = useMemo(() => parseVips(vipText), [vipText]);
  // Split Inbox: group into lanes. `nav` is the order j/k and selection follow —
  // the grouped order when split, the flat sorted order otherwise.
  const laned = useMemo(() => (split ? groupIntoLanes(visible, vips) : null), [split, visible, vips]);
  const nav = useMemo(() => (laned ? laned.flatMap((g) => g.items) : visible), [laned, visible]);
  const selectedIndex = nav.findIndex((i) => i.id === selectedId);
  const selected = selectedIndex >= 0 ? nav[selectedIndex] : null;

  const activeCount = items.filter((i) => i.status === "ACTIVE").length;
  const forgottenCount = items.length - activeCount;
  const doneCount = sorted.filter((i) => doneIds.has(i.id)).length;

  // Keep the page in sync if the visible list shrinks (e.g. after forgetting).
  useEffect(() => {
    if (page > paged.pageCount - 1) setPage(paged.pageCount - 1);
  }, [page, paged.pageCount]);

  const select = useCallback((id: string | null, withinIndex?: number) => {
    setSelectedId(id);
    if (withinIndex !== undefined && withinIndex >= 0) setPage(Math.floor(withinIndex / PAGE_SIZE));
  }, []);

  // ---- Actions -------------------------------------------------------------
  const process = async () => {
    setBusy(true);
    setFlash(null);
    const res = await fetch("/api/process", { method: "POST" });
    const data = await res.json();
    await load();
    setBusy(false);
    setFlash({
      kind: "ok",
      text:
        (data.processed > 0
          ? `Processed ${data.processed} new email(s) into encrypted derived data.`
          : `No new emails to process (all ${data.skipped} already done).`) +
        (data.emailSource ? ` Source: ${data.emailSource}.` : "") +
        (data.aiProvider ? ` AI: ${data.aiProvider}.` : ""),
    });
  };

  const forgetOne = async (id: string) => {
    setBusy(true);
    await fetch("/api/forget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: id }),
    });
    await load();
    setBusy(false);
    setFlash({ kind: "info", text: "Item forgotten — its key was destroyed. See the Audit log." });
  };

  const forgetAll = async () => {
    setBusy(true);
    const res = await fetch("/api/forget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    const data = await res.json();
    await load();
    setBusy(false);
    setFlash({ kind: "info", text: `Logged out & forgot ${data.forgotten} item(s). Keys destroyed.` });
  };

  const disconnectGmail = async (accountId: string) => {
    setBusy(true);
    await fetch(`/api/auth/google/status?accountId=${encodeURIComponent(accountId)}`, { method: "DELETE" });
    await loadGmail();
    setBusy(false);
    setFlash({ kind: "info", text: "Gmail account disconnected." });
  };

  const disconnectM365 = async (accountId: string) => {
    setBusy(true);
    await fetch(`/api/auth/microsoft/status?accountId=${encodeURIComponent(accountId)}`, { method: "DELETE" });
    await loadM365();
    setBusy(false);
    setFlash({ kind: "info", text: "Microsoft 365 account disconnected." });
  };

  const resetDemo = async () => {
    if (!confirm("Reset the demo? This wipes all derived items, keys, and audit events so you can start over.")) return;
    setBusy(true);
    await fetch("/api/reset", { method: "POST" });
    await load();
    setBusy(false);
    setFlash({ kind: "info", text: "Demo reset. Click “Process inbox” to start again." });
  };

  // Mark the selected item "done" (client-only declutter), then advance.
  const markDone = useCallback(
    (id: string) => {
      const next = new Set(doneIds);
      next.add(id);
      persistDone(next);
      const idx = visible.findIndex((i) => i.id === id);
      const remaining = visible.filter((i) => i.id !== id);
      const nextSel = remaining[Math.min(idx, remaining.length - 1)] ?? null;
      setSelectedId(nextSel ? nextSel.id : null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [doneIds, visible]
  );

  // Snooze the selected item until a preset time, then advance selection.
  const snooze = useCallback(
    (id: string, preset: SnoozePresetId) => {
      const next = { ...snoozeMap, [id]: snoozeUntil(preset).toISOString() };
      persistSnooze(next);
      const remaining = visible.filter((i) => i.id !== id);
      const idx = visible.findIndex((i) => i.id === id);
      setSelectedId(remaining[Math.min(idx, remaining.length - 1)]?.id ?? null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snoozeMap, visible]
  );
  const unsnooze = useCallback(
    (id: string) => {
      const next = { ...snoozeMap };
      delete next[id];
      persistSnooze(next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snoozeMap]
  );

  // ---- Keyboard navigation -------------------------------------------------
  // Latest view state lives in a ref so a single listener always sees fresh data.
  const stateRef = useRef({ nav, selectedIndex, busy, split });
  stateRef.current = { nav, selectedIndex, busy, split };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K toggles the command palette from anywhere (even while typing).
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      const action = keyAction(e.key);
      // While typing, only Escape (blur) is honoured so search keeps working.
      if (typing) {
        if (e.key === "Escape") (el as HTMLElement).blur();
        return;
      }
      if (!action) return;
      const { nav: vis, selectedIndex: si, busy: isBusy, split: isSplit } = stateRef.current;

      if (action === "next" || action === "prev") {
        e.preventDefault();
        if (vis.length === 0) return;
        const from = si < 0 ? (action === "next" ? -1 : 0) : si;
        const idx = moveIndex(from, action === "next" ? 1 : -1, vis.length);
        // Page-jump only matters in the flat (paginated) view.
        select(vis[idx].id, isSplit ? undefined : idx);
      } else if (action === "search") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (action === "refresh") {
        if (!isBusy) load();
      } else if (action === "close") {
        setSelectedId(null);
      } else if (action === "open") {
        if (si < 0 && vis.length) select(vis[0].id, 0);
        readingRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else if (action === "done") {
        if (si >= 0) markDone(vis[si].id);
      } else if (action === "forget") {
        if (si >= 0 && vis[si].status === "ACTIVE" && !isBusy) forgetOne(vis[si].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [select, load, markDone]); // handlers are stable; state is read via ref

  // ---- Render --------------------------------------------------------------
  const connectedCount = gmail.accounts.length + m365.accounts.length;
  const liveMailbox = connectedCount > 0;

  // Command palette entries (rebuilt each render so the closures stay fresh).
  const commands: Command[] = [
    { id: "process", label: "Process inbox", keywords: ["run", "ai", "fetch"], run: () => process() },
    { id: "refresh", label: "Refresh", keywords: ["reload"], run: () => load() },
    { id: "search", label: "Search the inbox", keywords: ["find", "semantic"], run: () => searchRef.current?.focus() },
    { id: "split", label: split ? "Split Inbox: turn off" : "Split Inbox: turn on", keywords: ["lanes", "vip"], run: toggleSplit },
    { id: "settings", label: "Go to Settings", keywords: ["tone", "schedule", "snippets"], run: () => router.push("/settings") },
    { id: "audit", label: "Go to Audit log", keywords: ["proof", "log"], run: () => router.push("/audit") },
  ];
  if (activeCount > 0)
    commands.push({ id: "forgetall", label: "Log out & forget all", keywords: ["shred", "destroy"], run: () => forgetAll() });
  if (items.length > 0)
    commands.push({ id: "reset", label: "Reset demo", keywords: ["wipe", "clear"], run: () => resetDemo() });
  if (gmail.configured)
    commands.push({
      id: "gmail",
      label: gmail.accounts.length ? "Add Gmail account" : "Connect Gmail",
      keywords: ["mailbox", "google"],
      run: () => { window.location.href = "/api/auth/google"; },
    });
  if (m365.configured)
    commands.push({
      id: "microsoft",
      label: m365.accounts.length ? "Add Microsoft account" : "Connect Microsoft",
      keywords: ["mailbox", "outlook", "365"],
      run: () => { window.location.href = "/api/auth/microsoft"; },
    });

  return (
    <div className="container-wide">
      {paletteOpen && <CommandPalette commands={commands} onClose={() => setPaletteOpen(false)} />}
      {liveMailbox ? (
        <div className="banner warn">
          <strong>
            Connected to {connectedCount} real mailbox{connectedCount === 1 ? "" : "es"} — read-only.
          </strong>{" "}
          Message bodies are processed <strong>in memory only</strong> and never stored; only the
          encrypted AI-derived summary/triage/draft is kept. The AI still runs{" "}
          <strong>100% locally</strong>. ⚠️ Encryption keys here are <strong>demo-grade</strong> —
          don’t connect a truly sensitive account on this prototype.
        </div>
      ) : (
        <div className="banner">
          <strong>Prototype — synthetic data only.</strong> Every email below is fake. The AI
          runs <strong>100% locally</strong> (Apertus 8B via Ollama, no internet, no API key);
          if Ollama isn’t running it falls back to an offline rule-based placeholder. Encryption
          keys here are demo-grade, not production-grade.
        </div>
      )}

      <h1>Inbox</h1>
      <p className="subtitle">
        AI-derived summaries &amp; drafts. Stored encrypted; auto-forgotten{" "}
        <strong>{intervalLabel[forgetInterval] ?? forgetInterval}</strong>.{" "}
        <a href="/settings">Change schedule</a>.
      </p>

      <div className="toolbar">
        <button className="btn-primary" onClick={process} disabled={busy}>
          {busy ? "Working…" : "Process inbox"}
        </button>
        <button className="btn-secondary" onClick={load} disabled={busy}>
          Refresh
        </button>
        {activeCount > 0 && (
          <button className="btn-danger" onClick={forgetAll} disabled={busy}>
            Log out &amp; forget all
          </button>
        )}
        {items.length > 0 && (
          <button className="btn-secondary" onClick={resetDemo} disabled={busy}>
            Reset demo
          </button>
        )}
        {gmail.configured && (
          <a className="btn-secondary" href="/api/auth/google">
            {gmail.accounts.length ? "Add Gmail" : "Connect Gmail"}
          </a>
        )}
        {m365.configured && (
          <a className="btn-secondary" href="/api/auth/microsoft">
            {m365.accounts.length ? "Add Microsoft" : "Connect Microsoft"}
          </a>
        )}
        <span className="note">
          {activeCount} active · {forgottenCount} forgotten{doneCount > 0 ? ` · ${doneCount} done` : ""}
        </span>
      </div>

      {connectedCount > 0 && (
        <div className="accounts">
          {gmail.accounts.map((a) => (
            <span key={`g-${a.accountId}`} className="account-chip">
              <span className="account-prov">Gmail</span>
              {a.email ?? a.accountId}
              <button
                className="account-x"
                title="Disconnect this account"
                onClick={() => disconnectGmail(a.accountId)}
                disabled={busy}
              >
                ✕
              </button>
            </span>
          ))}
          {m365.accounts.map((a) => (
            <span key={`m-${a.accountId}`} className="account-chip">
              <span className="account-prov">Microsoft</span>
              {a.email ?? a.accountId}
              <button
                className="account-x"
                title="Disconnect this account"
                onClick={() => disconnectM365(a.accountId)}
                disabled={busy}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {flash && <div className={`flash ${flash.kind}`}>{flash.text}</div>}

      {activeCount > 0 && (
        <SearchBox
          inputRef={searchRef}
          onPick={(id) => select(id, split ? undefined : visible.findIndex((i) => i.id === id))}
        />
      )}

      {activeCount > 0 && (
        <AskBox onPick={(id) => select(id, split ? undefined : visible.findIndex((i) => i.id === id))} />
      )}

      {loading ? (
        <p className="empty">Loading…</p>
      ) : items.length === 0 ? (
        <div className="empty">
          No items yet. Click <strong>“Process inbox”</strong> to run the AI over{" "}
          {liveMailbox ? "your recent messages" : "the 15 synthetic sample emails"}.
        </div>
      ) : (
        <div className="inbox-layout">
          {/* ---- Message list ---- */}
          <div>
            <div className="list-tools">
              <span className="note" style={{ margin: 0 }}>
                {visible.length} message{visible.length === 1 ? "" : "s"}
                {!split && paged.pageCount > 1 ? ` · page ${paged.page + 1}/${paged.pageCount}` : ""}
              </span>
              <div className="toolbar" style={{ margin: 0, gap: 7 }}>
                <button className="btn-secondary btn-small" onClick={() => setEditingVips((v) => !v)}>
                  VIPs{vips.length ? ` (${vips.length})` : ""}
                </button>
                <button className={`btn-secondary btn-small ${split ? "is-on" : ""}`} onClick={toggleSplit}>
                  Split: {split ? "On" : "Off"}
                </button>
                {doneCount > 0 && (
                  <button className="btn-secondary btn-small" onClick={() => setShowDone((s) => !s)}>
                    {showDone ? "Hide done" : `Show done (${doneCount})`}
                  </button>
                )}
                {snoozedCount > 0 && (
                  <button
                    className={`btn-secondary btn-small ${showSnoozed ? "is-on" : ""}`}
                    onClick={() => setShowSnoozed((s) => !s)}
                  >
                    {showSnoozed ? "Hide snoozed" : `Snoozed (${snoozedCount})`}
                  </button>
                )}
              </div>
            </div>

            {editingVips && (
              <div className="card" style={{ padding: 14, marginBottom: 12 }}>
                <div className="reading-section-label">VIP senders</div>
                <p className="note" style={{ margin: "4px 0 8px" }}>
                  Comma- or line-separated name/email fragments. Matching senders get their own
                  lane. Stored only in this browser.
                </p>
                <textarea
                  className="compose-input"
                  rows={2}
                  placeholder="e.g. court@, @keyclient.com, Managing Partner"
                  value={vipText}
                  onChange={(e) => saveVips(e.target.value)}
                />
                <div className="toolbar" style={{ margin: "8px 0 0" }}>
                  <button className="btn-secondary btn-small" onClick={() => setEditingVips(false)}>
                    Done
                  </button>
                </div>
              </div>
            )}

            {split && laned ? (
              laned.map((g) => (
                <div key={g.lane.id} className="lane">
                  <div className="lane-head">
                    <span className="lane-name">{g.lane.name}</span>
                    <span className="lane-count">{g.items.length}</span>
                  </div>
                  <ul className="msg-list">
                    {g.items.map((item) => (
                      <MsgRow
                        key={item.id}
                        item={item}
                        selected={item.id === selectedId}
                        done={doneIds.has(item.id)}
                        onSelect={() => select(item.id)}
                      />
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <ul className="msg-list">
                {paged.slice.map((item) => (
                  <MsgRow
                    key={item.id}
                    item={item}
                    selected={item.id === selectedId}
                    done={doneIds.has(item.id)}
                    onSelect={() => select(item.id)}
                  />
                ))}
              </ul>
            )}

            {!split && paged.pageCount > 1 && (
              <div className="pager">
                <button
                  className="btn-secondary btn-small"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={paged.page === 0}
                >
                  ← Prev
                </button>
                <span className="note" style={{ margin: 0 }}>
                  {paged.page + 1} / {paged.pageCount}
                </span>
                <button
                  className="btn-secondary btn-small"
                  onClick={() => setPage((p) => Math.min(paged.pageCount - 1, p + 1))}
                  disabled={paged.page >= paged.pageCount - 1}
                >
                  Next →
                </button>
              </div>
            )}

            <div className="kbd-hints">
              <span><span className="kbd">j</span><span className="kbd">k</span> move</span>
              <span><span className="kbd">e</span> done</span>
              <span><span className="kbd">f</span> forget</span>
              <span><span className="kbd">/</span> search</span>
              <span><span className="kbd">r</span> refresh</span>
              <span><span className="kbd">⌘K</span> commands</span>
            </div>
          </div>

          {/* ---- Reading pane ---- */}
          <div className="reading-pane" ref={readingRef}>
            {!selected ? (
              <div className="reading-empty">
                Select a message — or press <span className="kbd">j</span> to start reading.
              </div>
            ) : selected.status === "ACTIVE" ? (
              <ReadingActive
                item={selected}
                done={doneIds.has(selected.id)}
                busy={busy}
                onForget={forgetOne}
                onDone={markDone}
                snoozedUntil={snoozeMap[selected.id] ?? null}
                onSnooze={snooze}
                onUnsnooze={unsnooze}
              />
            ) : (
              <ReadingForgotten item={selected} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Ask AI — a question over the inbox, answered locally and grounded in the most
// relevant items (RAG). Clicking a source opens that message.
function AskBox({ onPick }: { onPick: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<{
    answer: string;
    sources: { id: string; subject: string; from: string }[];
    aiProvider: string;
  } | null>(null);
  const [asking, setAsking] = useState(false);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setAsking(true);
    setResult(null);
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    });
    setResult(await res.json());
    setAsking(false);
  };

  return (
    <div className="card">
      <form onSubmit={run} className="toolbar" style={{ marginBottom: result ? 12 : 0 }}>
        <input
          className="search-input"
          placeholder="Ask your inbox — e.g. “What deadlines do I have this week?”"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-secondary btn-small" type="submit" disabled={asking}>
          {asking ? "Thinking…" : "Ask AI"}
        </button>
        <span className="note" style={{ margin: 0 }}>answers run locally</span>
      </form>
      {result && (
        <div>
          <div className="ask-answer">{result.answer}</div>
          {result.sources.length > 0 && (
            <div className="ask-sources">
              <span className="note" style={{ margin: 0 }}>Sources:</span>{" "}
              {result.sources.map((s) => (
                <button key={s.id} className="badge label ask-source" onClick={() => onPick(s.id)}>
                  {s.subject || s.from}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Cmd+K command palette (P11). Fuzzy-filtered, arrow-navigable, Enter to run.
function CommandPalette({ commands, onClose }: { commands: Command[]; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = filterCommands(q, commands);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    setActive(0);
  }, [q]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = filtered[active];
      if (c) {
        onClose();
        c.run();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="cmdk-overlay" onClick={onClose}>
      <div className="cmdk" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="cmdk-input"
          placeholder="Type a command…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <ul className="cmdk-list">
          {filtered.length === 0 ? (
            <li className="cmdk-empty">No matching commands</li>
          ) : (
            filtered.map((c, i) => (
              <li key={c.id}>
                <button
                  className={`cmdk-item ${i === active ? "active" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    onClose();
                    c.run();
                  }}
                >
                  {c.label}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

// One row in the message list — shared by the flat and Split-Inbox renderings.
function MsgRow({
  item,
  selected,
  done,
  onSelect,
}: {
  item: Item;
  selected: boolean;
  done: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button className={`msg-row ${selected ? "selected" : ""} ${done ? "done" : ""}`} onClick={onSelect}>
        {item.status === "ACTIVE" ? (
          <>
            <span className={`msg-dot ${priorityClass(item.payload.priority)}`} aria-hidden />
            <span className="msg-main">
              <span className="msg-sender">{item.payload.from}</span>
              <span className="msg-subject">{item.payload.subject}</span>
              <span className="msg-snippet">{item.payload.summary}</span>
            </span>
            <span className="msg-side">
              <span className="msg-time">{fmt(item.payload.receivedAt)}</span>
              <span className="msg-count">{forgetCountdown(item.forgetAt)}</span>
            </span>
          </>
        ) : (
          <>
            <span className="msg-dot p-Low" aria-hidden />
            <span className="msg-main">
              <span className="msg-sender">🔒 Forgotten</span>
              <span className="msg-snippet">Content permanently destroyed.</span>
            </span>
            <span className="msg-side">
              <span className="msg-time">{fmt(item.forgottenAt)}</span>
            </span>
          </>
        )}
      </button>
    </li>
  );
}

function SearchBox({
  inputRef,
  onPick,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  onPick: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<{
    mode: string;
    provider: string;
    hits: { id: string; subject: string; from: string; summary: string; score: number }[];
  } | null>(null);
  const [searching, setSearching] = useState(false);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    setResult(await res.json());
    setSearching(false);
  };

  return (
    <div className="card">
      <form onSubmit={run} className="toolbar" style={{ marginBottom: result ? 12 : 0 }}>
        <input
          ref={inputRef}
          className="search-input"
          placeholder="Search by meaning — e.g. “deadline I might miss”"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-secondary btn-small" type="submit" disabled={searching}>
          {searching ? "Searching…" : "Search"}
        </button>
        {result && (
          <span className="note">
            {result.mode === "semantic" ? "local semantic search" : "offline keyword match"}
          </span>
        )}
      </form>
      {result &&
        (result.hits.length === 0 ? (
          <p className="note" style={{ margin: 0 }}>No matches among active items.</p>
        ) : (
          result.hits.map((h) => (
            <button key={h.id} className="search-hit search-hit-btn" onClick={() => onPick(h.id)}>
              <span className="badge label">{Math.round(h.score * 100)}%</span>{" "}
              <strong>{h.subject}</strong> — <span className="note">{h.summary}</span>
            </button>
          ))
        ))}
    </div>
  );
}

type Snippet = { id: string; title: string; body: string };

function ReadingActive({
  item,
  done,
  busy,
  onForget,
  onDone,
  snoozedUntil,
  onSnooze,
  onUnsnooze,
}: {
  item: ActiveItem;
  done: boolean;
  busy: boolean;
  onForget: (id: string) => void;
  onDone: (id: string) => void;
  snoozedUntil: string | null;
  onSnooze: (id: string, preset: SnoozePresetId) => void;
  onUnsnooze: (id: string) => void;
}) {
  const p = item.payload;
  const [copied, setCopied] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  // Snippets (P9): reusable templates managed in Settings, inserted here.
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  useEffect(() => {
    try {
      setSnippets(JSON.parse(localStorage.getItem("citadel:snippets") ?? "[]"));
    } catch {
      setSnippets([]);
    }
  }, [item.id]);
  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(p.draftReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be unavailable; ignore */
    }
  };

  // Write-with-AI: compose a draft from a freeform instruction, in the user's tone.
  const [instruction, setInstruction] = useState("");
  const [composed, setComposed] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const compose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;
    setComposing(true);
    setComposed(null);
    const res = await fetch("/api/compose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instruction, itemId: item.id }),
    });
    const d = await res.json();
    setComposing(false);
    setComposed(d.draft || "(The assistant returned an empty draft.)");
  };

  // Reset the compose box when switching to a different message.
  useEffect(() => {
    setInstruction("");
    setComposed(null);
  }, [item.id]);

  // Calendar helpers (P10): suggest meeting times into the reply, or download an
  // .ics event. Availability uses an open working-day model (no calendar scope).
  const proposeMeeting = () => {
    const slots = proposeTimes(new Date(), 3);
    if (!slots.length) return;
    const text = `I'm available: ${slots.map(formatSlot).join("; ")}.`;
    setInstruction((cur) => (cur ? `${cur} ${text}` : text));
  };
  const addToCalendar = () => {
    const slots = proposeTimes(new Date(), 1);
    if (!slots.length) return;
    const ics = buildIcs(`Meeting: ${p.subject}`, slots[0], new Date().toISOString());
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "citadel-event.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reading">
      <div className="reading-head">
        <div className="item-subject" style={{ fontSize: 18, fontWeight: 650, color: "var(--ink)" }}>
          {p.subject}
        </div>
        <div className="item-from" style={{ marginTop: 4 }}>{p.from}</div>
        <div className="note" style={{ marginTop: 2 }}>Received {fmt(p.receivedAt)}</div>
      </div>

      <div className="badges">
        <span className={`badge ${priorityClass(p.priority)}`}>{p.priority}</span>
        <span className="badge label">{p.triageLabel}</span>
        {done && <span className="badge label">✓ done</span>}
      </div>

      <p className="reading-privacy">
        The raw message body was processed <strong>in memory only</strong> and never stored. Below is
        the encrypted, AI-derived view — auto-forgets <strong>{forgetCountdown(item.forgetAt)}</strong>.
      </p>

      <div className="reading-section-label">Summary</div>
      <div className="summary" style={{ marginTop: 4 }}>{p.summary}</div>

      <div className="draft">
        <div className="draft-label" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Suggested reply (draft)</span>
          <button className="btn-secondary btn-small" onClick={copyDraft}>
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        {p.draftReply}
      </div>

      <form className="compose" onSubmit={compose}>
        <div className="reading-section-label">Write with AI</div>
        <textarea
          className="compose-input"
          rows={2}
          placeholder="Tell the assistant what to say — e.g. “Ask for a one-week extension and propose Friday.”"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
        />
        {snippets.length > 0 && (
          <div className="ask-sources" style={{ marginTop: 8 }}>
            <span className="note" style={{ margin: 0 }}>Snippets:</span>{" "}
            {snippets.map((s) => (
              <button
                key={s.id}
                type="button"
                className="badge label ask-source"
                title={s.body}
                onClick={() => setInstruction((cur) => (cur ? `${cur} ${s.body}` : s.body))}
              >
                {s.title}
              </button>
            ))}
          </div>
        )}
        <div className="toolbar" style={{ margin: "8px 0 0" }}>
          <button className="btn-primary btn-small" type="submit" disabled={composing || !instruction.trim()}>
            {composing ? "Drafting…" : "Draft with AI"}
          </button>
          <button type="button" className="btn-secondary btn-small" onClick={proposeMeeting}>
            Propose times
          </button>
          <button type="button" className="btn-secondary btn-small" onClick={addToCalendar}>
            Add to calendar
          </button>
        </div>
        {composed !== null && (
          <div className="draft" style={{ marginTop: 10 }}>
            <div className="draft-label" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>AI draft</span>
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={() => navigator.clipboard?.writeText(composed).catch(() => {})}
              >
                Copy
              </button>
            </div>
            {composed}
          </div>
        )}
      </form>

      <div className="toolbar" style={{ marginTop: 14, marginBottom: 0 }}>
        <button className="btn-secondary btn-small" onClick={() => onDone(item.id)} disabled={done}>
          {done ? "Done" : "Mark done (e)"}
        </button>
        {snoozedUntil ? (
          <button className="btn-secondary btn-small" onClick={() => onUnsnooze(item.id)}>
            Snoozed {formatWake(snoozedUntil)} · Unsnooze
          </button>
        ) : (
          <span className="snooze-wrap">
            <button className="btn-secondary btn-small" onClick={() => setSnoozeOpen((o) => !o)}>
              Snooze ▾
            </button>
            {snoozeOpen && (
              <span className="snooze-menu">
                {SNOOZE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className="snooze-item"
                    onClick={() => {
                      setSnoozeOpen(false);
                      onSnooze(item.id, preset.id);
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </span>
            )}
          </span>
        )}
        <button className="btn-danger btn-small" onClick={() => onForget(item.id)} disabled={busy}>
          Forget now (f)
        </button>
      </div>
    </div>
  );
}

function ReadingForgotten({ item }: { item: ForgottenItem }) {
  const [proof, setProof] = useState<string | null>(null);
  const prove = async () => {
    const res = await fetch(`/api/forget?prove=${item.id}`, { cache: "no-store" });
    const d = await res.json();
    setProof(
      [
        `status:           ${d.status}`,
        `key in vault:      ${d.keyDestroyed ? "DESTROYED (gone)" : "present"}`,
        `stored ciphertext: ${d.ciphertextPreview}`,
        `decrypt attempt:   ${d.decryptAttempt === "unrecoverable" ? "FAILED — unrecoverable" : "readable"}`,
      ].join("\n")
    );
  };
  return (
    <div className="reading">
      <div className="reading-head">
        <span className="lock">🔒 Forgotten</span>
        <div className="note" style={{ marginTop: 6 }}>
          Content permanently destroyed. Processed {fmt(item.processedAt)} · forgotten {fmt(item.forgottenAt)}.
        </div>
      </div>
      <p className="reading-privacy">
        The per-item key was destroyed, so the stored ciphertext can never be decrypted again. Prove it:
      </p>
      <button className="btn-secondary btn-small" onClick={prove}>
        Prove it’s unrecoverable
      </button>
      {proof && <div className="proof" style={{ marginTop: 12 }}>{proof}</div>}
    </div>
  );
}

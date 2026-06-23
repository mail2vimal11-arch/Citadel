"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const PAGE_SIZE = 20;
const DONE_KEY = "citadel:done";

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
  const [gmail, setGmail] = useState<{ configured: boolean; connected: boolean; email?: string }>({
    configured: false,
    connected: false,
  });
  const [m365, setM365] = useState<{ configured: boolean; connected: boolean; email?: string }>({
    configured: false,
    connected: false,
  });

  // Reading UX state.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [showDone, setShowDone] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);

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
  const visible = useMemo(() => applyDone(sorted, doneIds, showDone), [sorted, doneIds, showDone]);
  const paged = useMemo(() => paginate(visible, page, PAGE_SIZE), [visible, page]);
  const selectedIndex = visible.findIndex((i) => i.id === selectedId);
  const selected = selectedIndex >= 0 ? visible[selectedIndex] : null;

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

  const disconnectGmail = async () => {
    setBusy(true);
    await fetch("/api/auth/google/status", { method: "DELETE" });
    await loadGmail();
    setBusy(false);
    setFlash({ kind: "info", text: "Gmail disconnected. Back to synthetic demo data." });
  };

  const disconnectM365 = async () => {
    setBusy(true);
    await fetch("/api/auth/microsoft/status", { method: "DELETE" });
    await loadM365();
    setBusy(false);
    setFlash({ kind: "info", text: "Microsoft 365 disconnected. Back to synthetic demo data." });
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

  // ---- Keyboard navigation -------------------------------------------------
  // Latest view state lives in a ref so a single listener always sees fresh data.
  const stateRef = useRef({ visible, selectedIndex, busy });
  stateRef.current = { visible, selectedIndex, busy };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      const action = keyAction(e.key);
      // While typing, only Escape (blur) is honoured so search keeps working.
      if (typing) {
        if (e.key === "Escape") (el as HTMLElement).blur();
        return;
      }
      if (!action) return;
      const { visible: vis, selectedIndex: si, busy: isBusy } = stateRef.current;

      if (action === "next" || action === "prev") {
        e.preventDefault();
        if (vis.length === 0) return;
        const from = si < 0 ? (action === "next" ? -1 : 0) : si;
        const idx = moveIndex(from, action === "next" ? 1 : -1, vis.length);
        select(vis[idx].id, idx);
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
  const liveMailbox = gmail.connected ? "Gmail" : m365.connected ? "Microsoft 365" : null;
  const liveEmail = gmail.connected ? gmail.email : m365.email;

  return (
    <div>
      {liveMailbox ? (
        <div className="banner warn">
          <strong>Connected to a real {liveMailbox} ({liveEmail ?? "your account"}) — read-only.</strong>{" "}
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
        {gmail.configured &&
          (gmail.connected ? (
            <button className="btn-secondary" onClick={disconnectGmail} disabled={busy}>
              Disconnect Gmail
            </button>
          ) : (
            <a className="btn-secondary" href="/api/auth/google">
              Connect Gmail
            </a>
          ))}
        {m365.configured &&
          (m365.connected ? (
            <button className="btn-secondary" onClick={disconnectM365} disabled={busy}>
              Disconnect Microsoft
            </button>
          ) : (
            <a className="btn-secondary" href="/api/auth/microsoft">
              Connect Microsoft
            </a>
          ))}
        <span className="note">
          {activeCount} active · {forgottenCount} forgotten{doneCount > 0 ? ` · ${doneCount} done` : ""}
        </span>
      </div>

      {flash && <div className={`flash ${flash.kind}`}>{flash.text}</div>}

      {activeCount > 0 && <SearchBox inputRef={searchRef} onPick={(id) => select(id, visible.findIndex((i) => i.id === id))} />}

      {loading ? (
        <p className="empty">Loading…</p>
      ) : items.length === 0 ? (
        <div className="empty">
          No items yet. Click <strong>“Process inbox”</strong> to run the AI over{" "}
          {liveMailbox ? `your recent ${liveMailbox} messages` : "the 15 synthetic sample emails"}.
        </div>
      ) : (
        <div className="inbox-layout">
          {/* ---- Message list ---- */}
          <div>
            <div className="list-tools">
              <span className="note" style={{ margin: 0 }}>
                {visible.length} message{visible.length === 1 ? "" : "s"}
                {paged.pageCount > 1 ? ` · page ${paged.page + 1}/${paged.pageCount}` : ""}
              </span>
              {doneCount > 0 && (
                <button className="btn-secondary btn-small" onClick={() => setShowDone((s) => !s)}>
                  {showDone ? "Hide done" : `Show done (${doneCount})`}
                </button>
              )}
            </div>

            <ul className="msg-list">
              {paged.slice.map((item) => (
                <li key={item.id}>
                  <button
                    className={`msg-row ${item.id === selectedId ? "selected" : ""} ${
                      doneIds.has(item.id) ? "done" : ""
                    }`}
                    onClick={() => select(item.id)}
                  >
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
              ))}
            </ul>

            {paged.pageCount > 1 && (
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

function ReadingActive({
  item,
  done,
  busy,
  onForget,
  onDone,
}: {
  item: ActiveItem;
  done: boolean;
  busy: boolean;
  onForget: (id: string) => void;
  onDone: (id: string) => void;
}) {
  const p = item.payload;
  const [copied, setCopied] = useState(false);
  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(p.draftReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be unavailable; ignore */
    }
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

      <div className="toolbar" style={{ marginTop: 14, marginBottom: 0 }}>
        <button className="btn-secondary btn-small" onClick={() => onDone(item.id)} disabled={done}>
          {done ? "Done" : "Mark done (e)"}
        </button>
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

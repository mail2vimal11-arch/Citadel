"use client";

import { useCallback, useEffect, useState } from "react";

type Payload = {
  from: string;
  subject: string;
  receivedAt: string;
  summary: string;
  priority: "Urgent" | "Action needed" | "FYI" | "Low";
  triageLabel: string;
  draftReply: string;
};
type ActiveItem = {
  id: string;
  status: "ACTIVE";
  processedAt: string;
  forgetAt: string | null;
  payload: Payload;
};
type ForgottenItem = {
  id: string;
  status: "FORGOTTEN";
  processedAt: string;
  forgottenAt: string;
};
type Item = ActiveItem | ForgottenItem;

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const priorityClass = (p: Payload["priority"]) =>
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

  const load = useCallback(async () => {
    const res = await fetch("/api/items", { cache: "no-store" });
    const data = await res.json();
    setItems(data.items);
    setForgetInterval(data.forgetInterval);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
        data.processed > 0
          ? `Processed ${data.processed} new email(s) into encrypted derived data.`
          : `No new emails to process (all ${data.skipped} sample emails already done).`,
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

  const resetDemo = async () => {
    if (!confirm("Reset the demo? This wipes all derived items, keys, and audit events so you can start over.")) return;
    setBusy(true);
    await fetch("/api/reset", { method: "POST" });
    await load();
    setBusy(false);
    setFlash({ kind: "info", text: "Demo reset. Click “Process inbox” to start again." });
  };

  const activeCount = items.filter((i) => i.status === "ACTIVE").length;
  const forgottenCount = items.length - activeCount;

  return (
    <div>
      <div className="banner">
        <strong>Prototype — synthetic data only.</strong> Every email below is fake. The
        “AI” is a local rule-based placeholder (no internet, no API key). Encryption keys
        here are demo-grade, not production-grade.
      </div>

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
        <span className="note">
          {activeCount} active · {forgottenCount} forgotten
        </span>
      </div>

      {flash && <div className={`flash ${flash.kind}`}>{flash.text}</div>}

      {loading ? (
        <p className="empty">Loading…</p>
      ) : items.length === 0 ? (
        <div className="empty">
          No items yet. Click <strong>“Process inbox”</strong> to run the AI over the 15
          synthetic sample emails.
        </div>
      ) : (
        items.map((item) =>
          item.status === "ACTIVE" ? (
            <ActiveCard key={item.id} item={item} onForget={forgetOne} busy={busy} />
          ) : (
            <ForgottenCard key={item.id} item={item} />
          )
        )
      )}
    </div>
  );
}

function ActiveCard({
  item,
  onForget,
  busy,
}: {
  item: ActiveItem;
  onForget: (id: string) => void;
  busy: boolean;
}) {
  const [showDraft, setShowDraft] = useState(false);
  const p = item.payload;
  return (
    <div className="card">
      <div className="item-head">
        <div>
          <div className="item-from">{p.from}</div>
          <div className="item-subject">{p.subject}</div>
        </div>
        <div className="item-meta">{fmt(p.receivedAt)}</div>
      </div>

      <div className="badges">
        <span className={`badge ${priorityClass(p.priority)}`}>{p.priority}</span>
        <span className="badge label">{p.triageLabel}</span>
      </div>

      <div className="summary">{p.summary}</div>

      <div className="toolbar" style={{ marginBottom: 0 }}>
        <button className="btn-secondary btn-small" onClick={() => setShowDraft((s) => !s)}>
          {showDraft ? "Hide suggested reply" : "Show suggested reply"}
        </button>
        <button className="btn-danger btn-small" onClick={() => onForget(item.id)} disabled={busy}>
          Forget now
        </button>
        {item.forgetAt && (
          <span className="note">Auto-forgets {fmt(item.forgetAt)}</span>
        )}
      </div>

      {showDraft && (
        <div className="draft">
          <div className="draft-label">Suggested reply (draft)</div>
          {p.draftReply}
        </div>
      )}
    </div>
  );
}

function ForgottenCard({ item }: { item: ForgottenItem }) {
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
    <div className="card forgotten">
      <div className="item-head">
        <div>
          <span className="lock">🔒 Forgotten</span>
          <div className="note">
            Content permanently destroyed. Processed {fmt(item.processedAt)} · forgotten{" "}
            {fmt(item.forgottenAt)}.
          </div>
        </div>
        <button className="btn-secondary btn-small" onClick={prove}>
          Prove it’s unrecoverable
        </button>
      </div>
      {proof && <div className="proof">{proof}</div>}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

type Event = {
  id: string;
  event: "PROCESSED" | "FORGOTTEN" | "SETTINGS_CHANGED" | "DRAFTED" | "SENT";
  message: string;
  sourceRef: string | null;
  itemId: string | null;
  createdAt: string;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function AuditPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/audit", { cache: "no-store" });
    const data = await res.json();
    setEvents(data.events);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="container">
      <div className="banner">
        <strong>Proof, not content.</strong> This append-only log records <em>that</em> an
        item was processed and <em>when</em> it was forgotten — never the email content, the
        summary, or any key.
      </div>

      <h1>Audit log</h1>
      <p className="subtitle">
        {events.length} event(s).{" "}
        <button className="btn-secondary btn-small" onClick={load}>
          Refresh
        </button>
      </p>

      {loading ? (
        <p className="empty">Loading…</p>
      ) : events.length === 0 ? (
        <div className="empty">No events yet. Process the inbox to get started.</div>
      ) : (
        <div className="card">
          {events.map((e) => (
            <div className="audit-row" key={e.id}>
              <span className="audit-time">{fmt(e.createdAt)}</span>
              <span className={`tag ${e.event}`}>{e.event.replace("_", " ")}</span>
              <span>
                {e.message}
                {e.sourceRef ? ` (ref: ${e.sourceRef})` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

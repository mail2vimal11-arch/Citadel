"use client";

import { useEffect, useState } from "react";

type Option = { value: string; label: string; ms: number | null };
type ToneOption = { value: string; label: string };
type Snippet = { id: string; title: string; body: string };
const SNIPPETS_KEY = "citadel:snippets";

export default function SettingsPage() {
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string>("24h");
  const [tones, setTones] = useState<ToneOption[]>([]);
  const [tone, setTone] = useState<string>("professional");
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Snippets (P9) — reusable templates, stored client-side, inserted in the
  // inbox "Write with AI" box.
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [snipTitle, setSnipTitle] = useState("");
  const [snipBody, setSnipBody] = useState("");

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setOptions(d.options);
        setSelected(d.forgetInterval);
        setTones(d.tones ?? []);
        setTone(d.tone ?? "professional");
      });
    try {
      setSnippets(JSON.parse(localStorage.getItem(SNIPPETS_KEY) ?? "[]"));
    } catch {
      setSnippets([]);
    }
  }, []);

  const persistSnippets = (next: Snippet[]) => {
    setSnippets(next);
    try {
      localStorage.setItem(SNIPPETS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };
  const addSnippet = () => {
    if (!snipTitle.trim() || !snipBody.trim()) return;
    persistSnippets([
      ...snippets,
      { id: `${snipTitle.slice(0, 12)}-${snippets.length}`, title: snipTitle.trim(), body: snipBody.trim() },
    ]);
    setSnipTitle("");
    setSnipBody("");
  };
  const removeSnippet = (id: string) => persistSnippets(snippets.filter((s) => s.id !== id));

  const save = async (value: string) => {
    setBusy(true);
    setSelected(value);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forgetInterval: value }),
    });
    const d = await res.json();
    setBusy(false);
    setSaved(`Schedule saved. Updated ${d.updated} active item(s).`);
  };

  const saveTone = async (value: string) => {
    setBusy(true);
    setTone(value);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tone: value }),
    });
    setBusy(false);
    setSaved(`Tone saved. New AI drafts will use the “${value}” voice.`);
  };

  return (
    <div>
      <div className="banner">
        <strong>Data minimization by design.</strong> Choose how long the assistant keeps
        AI-derived data before it permanently forgets it (by destroying each item’s key).
      </div>

      <h1>Settings</h1>
      <p className="subtitle">Forget schedule</p>

      {options.map((o) => (
        <label
          key={o.value}
          className={`radio-row ${selected === o.value ? "selected" : ""}`}
        >
          <input
            type="radio"
            name="forget"
            value={o.value}
            checked={selected === o.value}
            onChange={() => save(o.value)}
            disabled={busy}
          />
          <span>{o.label}</span>
        </label>
      ))}

      <p className="note">
        Changing this immediately recomputes the forget deadline for every active item,
        based on when each was originally processed. “On logout only” turns off the timer —
        items are kept until you click <em>“Log out &amp; forget all”</em> on the Inbox.
      </p>

      <p className="subtitle" style={{ marginTop: 32 }}>Write-with-AI tone</p>
      <p className="note" style={{ marginTop: -16, marginBottom: 14 }}>
        The voice the local AI uses for suggested replies and the <em>Write with AI</em> box.
        Runs 100% locally — your tone never leaves the machine.
      </p>
      {tones.map((t) => (
        <label key={t.value} className={`radio-row ${tone === t.value ? "selected" : ""}`}>
          <input
            type="radio"
            name="tone"
            value={t.value}
            checked={tone === t.value}
            onChange={() => saveTone(t.value)}
            disabled={busy}
          />
          <span>{t.label}</span>
        </label>
      ))}

      <p className="subtitle" style={{ marginTop: 32 }}>Snippets</p>
      <p className="note" style={{ marginTop: -16, marginBottom: 14 }}>
        Reusable phrases you can drop into the <em>Write with AI</em> box on the inbox.
        Stored only in this browser.
      </p>
      {snippets.map((s) => (
        <div key={s.id} className="radio-row" style={{ cursor: "default" }}>
          <span style={{ flex: 1 }}>
            <strong>{s.title}</strong>
            <span className="note" style={{ display: "block", margin: 0 }}>{s.body}</span>
          </span>
          <button className="btn-secondary btn-small" onClick={() => removeSnippet(s.id)}>
            Remove
          </button>
        </div>
      ))}
      <div className="card" style={{ padding: 14 }}>
        <input
          className="search-input"
          style={{ width: "100%", marginBottom: 8 }}
          placeholder="Snippet title — e.g. “Out of office”"
          value={snipTitle}
          onChange={(e) => setSnipTitle(e.target.value)}
        />
        <textarea
          className="compose-input"
          rows={2}
          placeholder="The text to insert…"
          value={snipBody}
          onChange={(e) => setSnipBody(e.target.value)}
        />
        <div className="toolbar" style={{ margin: "8px 0 0" }}>
          <button
            className="btn-secondary btn-small"
            onClick={addSnippet}
            disabled={!snipTitle.trim() || !snipBody.trim()}
          >
            Add snippet
          </button>
        </div>
      </div>

      {saved && <div className="flash ok" style={{ marginTop: 14 }}>{saved}</div>}
    </div>
  );
}

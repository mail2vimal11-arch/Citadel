"use client";

import { useEffect, useState } from "react";

type Option = { value: string; label: string; ms: number | null };
type ToneOption = { value: string; label: string };

export default function SettingsPage() {
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string>("24h");
  const [tones, setTones] = useState<ToneOption[]>([]);
  const [tone, setTone] = useState<string>("professional");
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setOptions(d.options);
        setSelected(d.forgetInterval);
        setTones(d.tones ?? []);
        setTone(d.tone ?? "professional");
      });
  }, []);

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

      {saved && <div className="flash ok" style={{ marginTop: 14 }}>{saved}</div>}
    </div>
  );
}

import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Citadel",
  description:
    "How Citadel handles your email data: minimization, local AI, per-item encryption, provable forgetting, and Google API Limited Use compliance.",
};

// NOTE(production): this is an accurate description of how Citadel handles data,
// written to satisfy Google/Microsoft OAuth verification (it includes the Google
// API Limited Use disclosure). Have counsel review and fill the [bracketed]
// legal-entity / jurisdiction placeholders before relying on it publicly.
const EFFECTIVE = "September 4, 2026";

export default function Privacy() {
  return (
    <div className="mk">
      <header className="mk-topbar">
        <div className="mk-topbar-inner">
          <Link href="/" className="brand">
            <span className="logo" aria-hidden>C</span>
            <span className="brand-text">
              <b>Citadel</b>
              <small>Your sovereign inbox</small>
            </span>
          </Link>
          <nav className="mk-nav">
            <Link href="/">Home</Link>
            <Link className="btn-primary btn-small" href="/inbox">Open Citadel</Link>
          </nav>
        </div>
      </header>

      <article className="legal">
        <h1>Privacy Policy</h1>
        <p className="legal-meta">Effective {EFFECTIVE}</p>

        <p>
          Citadel (&ldquo;Citadel&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a privacy-first email
          assistant operated by <strong>[legal entity name]</strong> (&ldquo;the Operator&rdquo;) at{" "}
          <a href="https://citadel.aletheos.tech">citadel.aletheos.tech</a>. This policy explains
          what data we access when you connect a mailbox, how we use it, how long we keep it, and the
          choices you have. Citadel is built so that the honest answer to &ldquo;what do you keep?&rdquo;
          is <em>almost nothing, and not for long</em>.
        </p>

        <h2>The short version</h2>
        <ul>
          <li>We only access your mailbox with your explicit consent, using the least-privilege scopes.</li>
          <li>Your raw email is processed <strong>in memory only</strong> and is <strong>never written to our database</strong>.</li>
          <li>The AI that reads your mail runs on <strong>infrastructure we control</strong> — not a third-party AI service.</li>
          <li>We store only AI-<em>derived</em> data (a short summary, a priority, an optional draft), each item <strong>encrypted with its own key</strong>.</li>
          <li>On a schedule you choose, that key is destroyed (&ldquo;crypto-shredding&rdquo;), making the item <strong>permanently unrecoverable</strong>.</li>
          <li>We never sell your data, never use it for advertising, and no human reads your email content.</li>
        </ul>

        <h2>Data we access (Google &amp; Microsoft user data)</h2>
        <p>When you connect an account, you grant these scopes:</p>
        <ul>
          <li><strong>Google Gmail</strong> — <code>gmail.readonly</code> (to read messages we summarize and triage) and <code>gmail.send</code> (only to send a reply or message you explicitly compose and approve).</li>
          <li><strong>Microsoft 365 / Outlook</strong> — <code>Mail.Read</code>, <code>Mail.Send</code>, and <code>User.Read</code> (your basic profile, to identify the connected account).</li>
        </ul>
        <p>
          We request the minimum needed for the features you use. We do not request or access your
          contacts, Drive/OneDrive files, calendar, or any data beyond your mail and basic profile.
        </p>

        <h2>How we use it</h2>
        <p>
          When you run &ldquo;Process inbox,&rdquo; Citadel fetches recent messages, and a language model
          <strong> running on infrastructure we control</strong> produces, for each message, a short
          summary, a priority/label, and (optionally) a suggested reply in your tone. The raw message
          body is held in memory only for that pass and is discarded immediately afterward — it is
          <strong> never stored</strong>. We use your data solely to provide these user-facing features
          to you. We do <strong>not</strong> use your email content to train models for other users.
        </p>

        <h2>What we store, and for how long</h2>
        <ul>
          <li><strong>Only AI-derived data</strong> (summary, priority/label, optional draft) is stored — never the raw email.</li>
          <li>Each stored item is encrypted with <strong>AES-256-GCM under a unique per-item key</strong> (envelope encryption); our database holds only ciphertext.</li>
          <li>You choose a <strong>forget schedule</strong> (e.g. 1 hour, 24 hours, 7 days, or on logout). When it elapses, the item&rsquo;s one key is destroyed. Because the plaintext key was never written down, the item then becomes <strong>permanently unrecoverable</strong> — this is deletion by design, not a trash folder.</li>
          <li>We keep a <strong>content-free audit log</strong> that records <em>that</em> a message was processed and <em>when</em> it was forgotten — never the content, the summary, or any key.</li>
          <li>OAuth tokens are stored to keep your account connected and are deleted when you disconnect.</li>
        </ul>

        <h2 id="limited-use">Google API Services Limited Use disclosure</h2>
        <p>
          Citadel&rsquo;s use and transfer of information received from Google APIs to any other app will
          adhere to the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
            Google API Services User Data Policy
          </a>
          , including the <strong>Limited Use</strong> requirements. Specifically:
        </p>
        <ul>
          <li>We use Google user data only to provide and improve the user-facing features described above.</li>
          <li>We do not transfer or sell Google user data for advertising, market research, or any unrelated purpose.</li>
          <li>We do not use Google user data for personalized or any advertising.</li>
          <li>We do not allow humans to read Google user data, except: with your explicit consent for specific messages; as necessary for security or to comply with applicable law; or where the data is aggregated and anonymized for internal operations. Citadel&rsquo;s processing is automated and does not surface your content to our staff.</li>
        </ul>

        <h2>Where processing happens (sub-processors)</h2>
        <p>
          The AI pass runs on compute infrastructure the Operator controls rather than a third-party AI
          API. During the current phase this compute may run on a rented GPU host in the{" "}
          <strong>United Kingdom or European Union</strong>; the application and database run on the
          Operator&rsquo;s server. Encryption keys can be held on a <strong>separate host</strong> from the
          compute (&ldquo;keys-off-host&rdquo;), so the compute host holds only ciphertext it cannot decrypt
          alone. We will update this policy and, where required, notify you before adding sub-processors.
        </p>

        <h2>How we protect it</h2>
        <p>
          Encryption in transit (TLS) and at rest (AES-256-GCM, one key per item). Keys are never stored
          in the database, and can be held off the compute host entirely. Crypto-shredding provides an
          irreversible deletion guarantee that survives even compelled disclosure of the ciphertext.
        </p>

        <h2>Disclosure</h2>
        <p>
          We do not sell or rent your data. We may disclose data if required by valid legal process, but
          our design limits what any disclosure can reveal: raw email is never stored, stored items are
          ciphertext, and forgotten items&rsquo; keys are destroyed. We will resist overbroad requests to
          the extent permitted by law.
        </p>

        <h2>Your rights and choices</h2>
        <ul>
          <li><strong>Disconnect</strong> any mailbox at any time in Settings; we delete its tokens. You can also revoke access from your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">Google Account permissions</a> or Microsoft account.</li>
          <li><strong>Forget now</strong> — trigger crypto-shredding of any item or all items immediately.</li>
          <li><strong>Export</strong> your content-free audit log.</li>
          <li>Depending on your location, you may have rights to access, correct, or delete personal data (e.g. under GDPR/UK-GDPR or Canadian privacy law). Contact us to exercise them.</li>
        </ul>

        <h2>Data retention &amp; deletion</h2>
        <p>
          Derived items are retained only until your forget schedule elapses, then crypto-shredded.
          Disconnecting an account deletes its tokens. You may request deletion of any remaining data by
          contacting us; we honor it promptly.
        </p>

        <h2>Children</h2>
        <p>Citadel is not directed to children under 16 and we do not knowingly collect their data.</p>

        <h2>International transfers</h2>
        <p>
          Your data may be processed in the country where our compute and servers are located (see
          &ldquo;Where processing happens&rdquo;). We take steps to ensure appropriate safeguards for cross-border
          processing.
        </p>

        <h2>Changes</h2>
        <p>
          We may update this policy; we will change the effective date above and, for material changes,
          take reasonable steps to notify connected users.
        </p>

        <h2>Contact</h2>
        <p>
          Questions or requests: <a href="mailto:privacy@aletheos.tech">privacy@aletheos.tech</a>.
          Operator: <strong>[legal entity name, address, jurisdiction]</strong>.
        </p>

        <p className="legal-foot">
          <Link href="/">← Back to Citadel</Link>
        </p>
      </article>
    </div>
  );
}

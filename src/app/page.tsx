import Link from "next/link";

export const metadata = {
  title: "Citadel — your sovereign inbox",
  description:
    "Private, sovereign email for everyone — built to a regulated-professional standard. The AI runs on infrastructure you control, and forgets on a schedule you can prove.",
};

export default function Landing() {
  return (
    <div className="mk">
      <header className="mk-header">
        <Link href="/" className="brand">
          <span className="logo" aria-hidden>C</span>
          <span className="brand-text">
            <b>Citadel</b>
            <small>Your sovereign inbox</small>
          </span>
        </Link>
        <nav className="mk-nav">
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <Link className="btn-primary btn-small" href="/inbox">Open Citadel</Link>
        </nav>
      </header>

      <section className="mk-hero">
        <div className="mk-eyebrow">Privacy-first email · Canadian-controlled AI</div>
        <h1 className="mk-h1">
          Your inbox.
          <br />
          Sovereign.
        </h1>
        <p className="mk-lede">
          An AI assistant that reads your email, helps you triage and reply — then{" "}
          <strong>forgets</strong> on a schedule you choose, and can <strong>prove</strong> it
          forgot. The AI runs on infrastructure you control. Built for anyone who wants their inbox
          handled to a regulated-professional standard.
        </p>
        <div className="mk-cta-row">
          <Link className="btn-primary" href="/inbox">Get started</Link>
          <a className="btn-secondary" href="#how">See how it works</a>
        </div>

        <div className="mk-preview" aria-hidden>
          <div className="mk-preview-bar"><span /><span /><span /></div>
          <div className="card" style={{ margin: 0 }}>
            <div className="item-head">
              <div>
                <div className="item-from">Jordan Lee &lt;jordan@client.example&gt;</div>
                <div className="item-subject">Re: settlement timeline</div>
              </div>
              <div className="item-meta">9:24 AM</div>
            </div>
            <div className="badges">
              <span className="badge p-Urgent">Urgent</span>
              <span className="badge label">Client matter</span>
            </div>
            <div className="summary">
              Client asks to confirm the filing deadline this Thursday and whether the revised draft
              is ready to send.
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <h2 className="mk-h2">
          The wedge: <span className="mk-grad">residency · minimization · provable forgetting</span>
        </h2>
        <div className="mk-grid">
          <Feature
            title="Runs on infrastructure you control"
            body="The AI pass — summary, triage, suggested reply — runs locally via Apertus, with a clear path to a Canadian GPU host. No US clouds, no API keys. Your content never leaves."
          />
          <Feature
            title="Forgets — and proves it"
            body="Citadel stores only AI-derived data, each item encrypted with its own key. On your schedule the key is destroyed (“crypto-shredding”) — the data becomes permanently unrecoverable."
          />
          <Feature
            title="A content-free audit log"
            body="Every action is logged as proof — that an item was processed, and when it was forgotten — never the content, the summary, or any key. Show your work without exposing a word."
          />
        </div>
      </section>

      <section className="mk-section" id="how">
        <h2 className="mk-h2">How it works</h2>
        <ol className="mk-steps">
          <Step n="1" title="Connect" body="Read-only Gmail today (Microsoft 365 next). Raw email stays in memory only — never written to disk." />
          <Step n="2" title="Process" body="The local AI writes a one-line summary, a priority, and a suggested reply for each message." />
          <Step n="3" title="Encrypt" body="Only the derived data is stored — encrypted per-item with a unique key." />
          <Step n="4" title="Forget" body="On schedule (1h / 24h / 7d / on logout) the key is destroyed — gone for good." />
          <Step n="5" title="Prove" body="The audit log shows it happened, content-free. One click proves the data is truly unrecoverable." />
        </ol>
      </section>

      <section className="mk-section" id="pricing">
        <h2 className="mk-h2">Simple, honest pricing</h2>
        <p className="mk-sub">Everyone gets the same product — built to a regulated-professional standard.</p>
        <div className="mk-pricing">
          <div className="mk-price">
            <div className="mk-price-name">Free</div>
            <div className="mk-price-amt">$0</div>
            <div className="mk-price-note">Connect a real inbox</div>
            <ul className="mk-price-list">
              <li>AI on up to <strong>2 emails</strong></li>
              <li>Capped text per email</li>
              <li>The full forget &amp; prove loop</li>
            </ul>
            <Link className="btn-secondary mk-price-btn" href="/inbox">Try it free</Link>
          </div>
          <div className="mk-price mk-price-featured">
            <div className="mk-price-badge">Most popular</div>
            <div className="mk-price-name">Full</div>
            <div className="mk-price-amt">$15<span>/mo</span></div>
            <div className="mk-price-note">or $10/mo paid annually</div>
            <ul className="mk-price-list">
              <li>Your full inbox</li>
              <li>Full forget scheduler &amp; semantic search</li>
              <li>Audit export</li>
              <li>Professional / compliance add-ons</li>
            </ul>
            <Link className="btn-primary mk-price-btn" href="/inbox">Get started</Link>
          </div>
        </div>
      </section>

      <section className="mk-band">
        <h2 className="mk-band-h">Take back your inbox.</h2>
        <Link className="btn-primary mk-band-btn" href="/inbox">Get started</Link>
      </section>

      <footer className="mk-footer">
        <div className="brand">
          <span className="logo" aria-hidden>C</span>
          <span className="brand-text">
            <b>Citadel</b>
            <small>Your sovereign inbox</small>
          </span>
        </div>
        <div className="mk-foot-note">
          Concept prototype · synthetic data by default · AI runs locally. © Citadel
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="mk-feature">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="mk-step">
      <span className="mk-step-n" aria-hidden>{n}</span>
      <div>
        <h4>{title}</h4>
        <p>{body}</p>
      </div>
    </li>
  );
}

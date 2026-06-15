# Sovereign Inbox — Concept Prototype

A privacy-first email assistant for Canadian regulated professionals (lawyers,
healthcare). This is a **local, demo-only prototype** built to show design
partners the core idea:

> An AI assistant that reads your email, helps you triage and reply — and then
> **forgets** the data on a schedule you choose, and can **prove** it forgot.

**This prototype runs entirely on your own computer, on fake sample data. It
never connects to a real mailbox, never uses the internet, and never sends data
anywhere.**

---

## What it does (the core loop)

1. **Loads 15 synthetic sample emails** (all fake — invented law/healthcare
   scenarios, including scheduling, client matters, a privilege-sensitive one,
   and newsletters).
2. **Runs an "AI pass"** over each one: a short **summary**, a **priority/triage
   label**, and a **suggested reply draft**.
3. **Stores only the AI-derived data** (summary, labels, draft, light metadata) —
   each item **encrypted with its own unique key**.
4. **Forgets on a schedule you set** (1 hour / 24 hours / 7 days / on logout).
   When an item expires, its key is **destroyed**, making the stored data
   permanently unrecoverable. This is called "crypto-shredding."
5. **Keeps an audit log** showing *that* each item was processed and *when* it
   was forgotten — but **never** the forgotten content.

---

## How to run it (step by step)

You need **Node.js 18 or newer** installed ([download here](https://nodejs.org)).
That's the only prerequisite. To check, open a terminal and run `node --version`.

Then, in this project's folder:

```bash
npm install      # 1. download the building blocks (one time)
npm run demo     # 2. set up the local database and start the app
```

When you see `Ready`, open your web browser to:

```
http://localhost:3000
```

To stop the app, return to the terminal and press `Ctrl + C`.

> The two commands above are all you need. `npm run demo` creates a small local
> database file (`prisma/dev.db`) and launches the app. Run it again any time;
> your data stays until you forget it or reset.

---

## How to demo the "forget" feature live

This is the part to show design partners. Here's a 2-minute script:

1. **Open the Inbox** (`http://localhost:3000`) and click **"Process inbox."**
   You'll see 15 emails, each with an AI summary, a colored priority label, and
   a triage category. Click **"Show suggested reply"** on any of them.

2. **Open the Audit log** (top nav). You'll see a `PROCESSED` entry for each
   email — proof the assistant did the work, with **no email content** stored in
   the log.

3. **Forget one item live.** Back on the Inbox, click **"Forget now"** on any
   email. It instantly turns into a locked, grey "🔒 Forgotten" card with no
   content. Click **"Prove it's unrecoverable"** on that card — the app shows
   you that:
   - the item's encryption **key has been destroyed**,
   - the encrypted bytes are *still in the database*,
   - but a decryption attempt now **fails — the data is gone for good.**

4. **Show the audit trail.** Open the Audit log again — there's now a `FORGOTTEN`
   entry with a timestamp, and still **no content anywhere**.

5. **Show the schedule.** Open **Settings** and switch between *1 hour / 24 hours
   / 7 days / on logout*. Explain: when the timer expires, the same
   key-destruction happens automatically. (The timer is checked every time you
   open the inbox or audit log — no background process needed.)

6. **Forget everything.** On the Inbox, **"Log out & forget all"** shreds every
   active item at once — the "close the laptop and it's all gone" story.

7. **Reset and repeat.** **"Reset demo"** clears everything so you can run the
   demo again from scratch.

---

## ⚠️ Important: what is real vs. placeholder

This is a **concept prototype**, not the product. Several things are deliberately
faked or simplified and are clearly marked `TODO(production)` in the code:

| Area | In this prototype | In the real product |
|---|---|---|
| **Email source** | 15 fake sample emails | Read-only Gmail / Microsoft 365 connectors (OAuth) |
| **The "AI"** | A local rule-based placeholder (no real AI, no internet) | A **Canadian-hosted or on-device** AI model |
| **Encryption keys** | Stored in the same local file as the data (**not secure**) | A **Canadian-controlled HSM/KMS** |
| **Database** | A local SQLite file | A Canadian-region managed database |
| **Hosting** | Your laptop | Canadian sovereign infrastructure |

**Do not put real or confidential email into this prototype.** The demo key
vault is not secure. See `ARCHITECTURE.md` for the full list of "swap-in" points
a developer would build for production.

---

## Project layout (for the curious)

```
src/
  app/            the web pages (Inbox, Settings, Audit) + API endpoints
  lib/
    email/        EmailSource interface + SampleDataSource + production stubs
    ai/           AIProvider interface + the local placeholder
    keyvault/     KeyVault interface + the demo (insecure) vault
    crypto.ts     AES-256-GCM encrypt/decrypt
    forget/       the "forget engine" (destroys keys, writes audit entries)
    pipeline.ts   the process loop: email -> AI -> encrypt -> store
prisma/           the database shape
```

See **`ARCHITECTURE.md`** for the interfaces and every production seam.

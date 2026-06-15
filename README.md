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
2. **Runs an "AI pass"** over each one — a short **summary**, a **priority/triage
   label**, and a **suggested reply draft** — using an AI model that runs
   **100% on your own computer** (Apertus 8B via Ollama; nothing leaves the
   machine, no API key, no internet).
3. **Stores only the AI-derived data** (summary, labels, draft, light metadata) —
   each item **encrypted with its own unique key**.
4. **Forgets on a schedule you set** (1 hour / 24 hours / 7 days / on logout).
   When an item expires, its key is **destroyed**, making the stored data
   permanently unrecoverable. This is called "crypto-shredding."
5. **Keeps an audit log** showing *that* each item was processed and *when* it
   was forgotten — but **never** the forgotten content.

---

## Step 1 (do this first): the local AI — Ollama + Apertus

The whole point of this product is that the AI runs on **infrastructure you
control**, not in someone else's cloud. So before the app, we set up a local AI
server on your own machine. This is a one-time setup.

> **Don't want to install the AI right now?** You can skip this whole section.
> The app still runs — it just falls back to a simple offline rule-based
> stand-in instead of the real model. (Set `AI_PROVIDER="heuristic"` in `.env`
> to silence the "no AI found" notice.) To see the *real* local AI, do the steps
> below.

1. **Install Ollama** — a free app that runs AI models locally. Download it from
   [ollama.com/download](https://ollama.com/download) and install it like any
   other app. To confirm it worked, open a terminal and run:

   ```bash
   ollama --version
   ```

2. **Download the Apertus model** (Apertus 8B Instruct — an open model from the
   Swiss AI Initiative, Apache 2.0 licensed). In a terminal, run:

   ```bash
   ollama run MichelRosselli/apertus:8b-instruct-2509-q4_k_m
   ```

   The first run downloads a few GB, then drops you into a chat prompt. Type a
   question like `Summarize what a construction lien is.` to confirm it answers.
   Type `/bye` to leave. (This `q4_k_m` build is sized for normal laptops. If you
   have a lot of memory, you can use the larger `...:bf16` tag instead and set
   `OLLAMA_MODEL` in `.env` to match.)

   - **If that tag won't download or run** on your machine, the fallback is the
     official Unsloth GGUF (`unsloth/Apertus-8B-Instruct-2509-GGUF`) run via
     **llama.cpp** or **LM Studio** with its OpenAI-compatible server, and point
     `OLLAMA_BASE_URL` at it. If *nothing* runs Apertus on your hardware, the
     closest fully-open fallback is OLMo 3 7B (`ollama run olmo3:7b`, then set
     `OLLAMA_MODEL="olmo3:7b"`) — tell us and we'll help.

3. **(Optional) Download the search model** — used by the "search by meaning"
   box on the inbox:

   ```bash
   ollama pull nomic-embed-text
   ```

4. **Leave Ollama running** in the background. The app talks to it at
   `http://localhost:11434` — all local, no API key, no internet.

## Step 2: run the app (step by step)

You need **Node.js 18 or newer** installed ([download here](https://nodejs.org)).
To check, run `node --version`.

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
>
> **How the app picks the AI:** by default (`AI_PROVIDER="auto"` in `.env`) it
> uses local Apertus when Ollama is running and the model is downloaded, and
> otherwise quietly falls back to the offline rule-based stand-in. After you
> click **"Process inbox,"** the confirmation message tells you exactly which AI
> was used.

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
| **The AI** | Real **Apertus 8B** on your own machine via Ollama (offline rule-based stand-in if Ollama isn't running) | The **same Apertus model served on Canadian-controlled infrastructure** |
| **Search/memory** | Local `nomic-embed-text` embeddings via Ollama, in-memory only | Same embedding model on Canadian-controlled infrastructure |
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
    ai/           AIProvider interface + ApertusLocalProvider (Ollama) + offline stand-in
    embeddings/   EmbeddingProvider interface + local (nomic-embed-text) impl
    keyvault/     KeyVault interface + the demo (insecure) vault
    crypto.ts     AES-256-GCM encrypt/decrypt
    forget/       the "forget engine" (destroys keys, writes audit entries)
    pipeline.ts   the process loop: email -> AI -> encrypt -> store
prisma/           the database shape
```

See **`ARCHITECTURE.md`** for the interfaces and every production seam.

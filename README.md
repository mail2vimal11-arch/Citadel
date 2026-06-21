# Citadel — Concept Prototype

> **Citadel** — your sovereign inbox.

A privacy-first email assistant for **anyone who wants private, sovereign control
of their inbox** — built to a regulated-professional standard (lawyers, clinicians,
journalists are the proof-of-rigor and the premium tier, but everyone gets the same
product). This is a **local, demo-only prototype** built to show the core idea:

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

## Run it on a server (VPS) for a shared demo

Want design partners to open a link instead of watching your laptop? You can host
the same app on a Linux VPS. This is still **synthetic data only** — treat the box
as a throwaway demo server. Prefer a **Canadian** host (e.g. a Montréal-based
provider) so it lines up with the product's data-residency story.

> ⚠️ **Sovereignty note:** a generic VPS in the US/EU is fine for *this fake-data
> demo*, but it is **not** Canadian-controlled hosting. For anything beyond a demo,
> use a Canadian region and complete the production items in `ARCHITECTURE.md`.

### One-time setup (Ubuntu)

```bash
# 1. Node.js 20 LTS (Ubuntu's default `apt install nodejs` is too old)
apt-get update && apt-get install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node --version            # expect v20.x

# 2. Ollama + the models (see Step 1 above for details)
curl -fsSL https://ollama.com/install.sh | sh
ollama pull MichelRosselli/apertus:8b-instruct-2509-q4_k_m
ollama pull nomic-embed-text

# 3. The app
git clone https://github.com/mail2vimal11-arch/citadel.git
cd citadel                                 # IMPORTANT: stay in this folder
git checkout claude/sovereign-inbox-prototype-o03qrz
npm install
```

### Configure and run

```bash
# write .env (use your working model name from `ollama list`)
cat > .env <<'EOF'
DATABASE_URL="file:./dev.db"
AI_PROVIDER="apertus"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="MichelRosselli/apertus:8b-instruct-2509-q4_k_m"
OLLAMA_EMBED_MODEL="nomic-embed-text"
EOF

npx prisma db push
npx next dev -H 0.0.0.0 -p 3000
```

Open `http://<your-VPS-IP>:3000`. If it won't load, open port 3000 in **both** the
server firewall (`ufw allow 3000/tcp`) **and** your host's control-panel firewall.

### Keep it running after you log out (optional)

`next dev` stops when you close the terminal. To keep it alive:

```bash
npm install -g pm2
npm run build
pm2 start "npx next start -H 0.0.0.0 -p 3000" --name citadel
pm2 save
```

### Security before sharing the link
- It's fake data, but **don't leave port 3000 open to the whole internet** long-term.
  Put it behind a password (a reverse proxy such as Caddy/Nginx with basic auth) or
  restrict the firewall to your own IP.
- Keep **Ollama bound to localhost** (its default) — never expose port `11434`
  publicly; it has no authentication.

### Troubleshooting (things we actually hit)
- **Model replies with gibberish/math, or in German/French** → the chat template
  isn't being applied. Don't import a bare `.gguf`; use the community **instruct**
  tag (`MichelRosselli/apertus:8b-instruct-2509-q4_k_m`) or build your model `FROM`
  it. Details in `OPEN_BUGS.md`.
- **"Could not find Prisma Schema"** → you're not in the project folder. `cd citadel`
  first (`pwd` should end in `/citadel`).
- **`node: command not found`** → install Node 20 via NodeSource (above), not
  `apt install nodejs`.
- **Processing is slow / only some emails appear** → expected on a CPU-only box
  (Apertus runs ~15 emails × 3 passes). Click "Process inbox" again to resume, or
  pre-process before a live demo. A GPU host makes this fast.
- **Page won't load but the terminal says `Ready`** → firewall on port 3000 (above).

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

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
http://localhost:3000          # the marketing landing page
http://localhost:3000/inbox    # the actual app (inbox / settings / audit)
```

> The home page (`/`) is a dark, Superhuman-style marketing landing; the working
> app lives at `/inbox`. Click **"Get started" / "Open Citadel"** on the landing
> to jump in.
>
> **Sign-in (optional):** out of the box the app runs in single-user **demo
> mode** — no login, everything scoped to a built-in `demo-user`. Set
> `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` in `.env` (see the
> "Accounts & sign-in" block there) and the app switches on Google sign-in at
> `/signin` with **real per-user data isolation** — each account sees only its
> own inbox, audit log, settings, and Gmail connection.

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

1. **Open the Inbox** (`http://localhost:3000/inbox`) and click **"Process inbox."**
   You'll get a two-pane reader: a **message list** (sorted by priority, with a
   colored priority dot, sender, subject, summary snippet, and a live
   *auto-forgets in…* countdown) beside a **reading pane**. Click a message — or
   navigate hands-free with the keyboard: **`j`/`k`** to move, **`e`** to mark
   done (a local declutter — it never deletes or forgets), **`f`** to forget now,
   **`/`** to jump to search. The reading pane shows the full AI-derived view —
   summary + a suggested reply you can **copy** — and reminds you the raw body was
   processed *in memory only* and never stored.

2. **Open the Audit log** (top nav). You'll see a `PROCESSED` entry for each
   email — proof the assistant did the work, with **no email content** stored in
   the log.

3. **Forget one item live.** Select an email and click **"Forget now"** in the
   reading pane (or press **`f`**). Its list row becomes a locked "🔒 Forgotten"
   entry with no content; open it and click **"Prove it's unrecoverable"** — the
   app shows you that:
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

## Connect a real Gmail (optional — read-only)

By default Citadel reads 15 fake sample emails. You can instead point it at a
**real Gmail account, read-only**, to see the AI work on genuine mail. The raw
messages are processed **in memory only** and never written to the database —
only the encrypted AI-derived summary/triage/draft is stored.

> ⚠️ The demo key vault is **not** production-grade. Use a **throwaway test
> Gmail**, not an account with anything sensitive in it.

**One-time Google setup** (~10 min):

1. At **console.cloud.google.com**, create a project (e.g. "Citadel Dev").
2. **APIs & Services → Library →** enable the **Gmail API**.
3. **Google Auth Platform → Audience →** keep the app in **Testing** and add your
   Gmail address under **Test users** (this lets you skip Google's verification).
4. **Google Auth Platform → Data Access → Add or remove scopes →** add
   `.../auth/gmail.readonly`. _(Optional for test users — the app also requests it
   at runtime.)_
5. **APIs & Services → Credentials → Create credentials → OAuth client ID →
   Web application.** Add the redirect URI exactly:
   `http://localhost:3000/api/auth/google/callback`. Copy the **Client ID** and
   **Client secret**.

**Tell Citadel about it** — create a `.env.local` file (gitignored; never commit
it) next to `.env`:

```
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."
```

Restart the app. An **"Connect an account"** button appears in the inbox toolbar
(it becomes **"+ Add account"** once you have one). Click it — if more than one
provider is configured you'll get a small chooser (Google · Gmail / Microsoft ·
Outlook); pick Google, approve the consent screen (you'll see an "unverified app"
notice for your own test app — that's expected; continue), and you'll land back
on the inbox reading your real mail.

You can connect **multiple accounts** — every connected account is merged into one
inbox, and each shows as a chip with its own **✕** to disconnect just that account.
(The **Microsoft / Outlook** option only appears once `MICROSOFT_CLIENT_ID` /
`MICROSOFT_CLIENT_SECRET` are set — see the Microsoft 365 section below.)

> **Sending email (read-write).** Citadel can also *send* — **New email** in the
> toolbar and a **Reply** button (seeded with the AI draft) open a compose window
> that sends as a connected account. This needs the least-privilege send scopes
> (`gmail.send` / `Mail.Send`), so **if you connected an account before this, click
> "Add Gmail"/"Add Microsoft" to reconnect** and grant send — the first send will
> tell you if it's missing. For Gmail, add `…/auth/gmail.send` to your OAuth
> consent screen's scopes. Every send asks for confirmation, stores nothing, and
> logs a content-free `SENT` audit entry.

Tuning (optional, in `.env`): `EMAIL_SOURCE` (`auto` | `sample` | `gmail` |
`microsoft`) and `GMAIL_MAX_MESSAGES` (how many recent messages to pull).

---

## Connect Microsoft 365 / Outlook (optional — read-only)

Citadel reads Microsoft mail the same way: read-only, via **Microsoft Graph**
(`Mail.Read`), bodies in memory only. It works for both **Microsoft 365**
(work/school) and **personal Outlook.com** accounts (the OAuth flow uses the
`/common` authority).

1. In the **[Microsoft Entra admin center](https://entra.microsoft.com)** →
   **App registrations → New registration**.
2. **Supported account types:** "Accounts in any organizational directory **and**
   personal Microsoft accounts."
3. **Redirect URI (Web):** `http://localhost:3000/api/auth/microsoft/callback`.
4. **Certificates & secrets → New client secret** — copy the value.
5. **API permissions → Add → Microsoft Graph → Delegated →** add `Mail.Read`
   (and `offline_access`, `User.Read`). No admin consent needed for personal use.

**Tell Citadel about it** in `.env.local` (gitignored):

```
MICROSOFT_CLIENT_ID="..."
MICROSOFT_CLIENT_SECRET="..."
```

Restart the app, click **"Connect Microsoft"** in the inbox toolbar, approve the
consent, and you'll land back reading your real mail. **"Disconnect Microsoft"**
deletes the stored token. (If both Gmail and Microsoft are connected, `auto`
prefers Gmail — force one with `EMAIL_SOURCE=microsoft`.)

---

## Continuous deployment (optional, GitHub Actions → SSH)

`.github/workflows/ci.yml` has a gated **`deploy`** job that ships to the live
host **after the build passes**, on a push to the deploy branch. It only runs
once you add these repo secrets (Settings → Secrets and variables → Actions); until
then it no-ops with a notice, so CI stays green:

| Secret | Meaning |
|---|---|
| `SSH_HOST` | host / IP of the server |
| `SSH_USER` | SSH user |
| `SSH_KEY` | that user's **private** key (PEM); its public key in the host's `~/.ssh/authorized_keys` |
| `DEPLOY_PATH` | absolute path to the checked-out repo on the host |
| `SSH_PORT` | optional (defaults to `22`) |

On each deploy the host runs `git pull` (the deploy branch) + `docker compose up
-d --build`. The image build runs `prisma db push`, which applies **additive**
schema changes (e.g. new columns) to the SQLite volume without data loss.

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
| **Email source** | 15 fake sample emails by default; **real read-only Gmail** can be connected (OAuth, `gmail.readonly`) | Gmail **+ Microsoft 365** (incl. personal Outlook), per-user OAuth, tokens in a secrets manager |
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

# Deploying the off-host key service (step by step)

This is the operational runbook for the **keys-off-host** production gate
(`COMPLIANCE.md`). You stand up `server.mjs` on a **separate host from the Citadel
app**, behind TLS, holding the master key (KEK). The app then wraps/unwraps every
per-item key against it (`RemoteKmsClient`), so the app/GPU host only ever stores
ciphertext + wrapped data keys. A seizure or court order against the app host
yields nothing decryptable, and crypto-shredding stays irreversible.

> **The one rule that makes this worth doing:** the key host and the app host must
> be **different machines under different blast radius** — ideally a different
> provider and a different jurisdiction (a Canadian-controlled host is the goal).
> If they share a box, an attacker (or a warrant) that reaches one reaches both and
> the guarantee collapses.

---

## 0. What you need
- A small Linux host (1 vCPU / 512 MB is plenty), **separate** from the app host.
  Ideally Canadian-controlled. No GPU, no database — it only holds a key and does
  AES-GCM.
- A DNS name you control for it, e.g. `keys.your-domain.ca`, pointed at that host.
- The Citadel app already deployed elsewhere (the box at `citadel.aletheos.tech`).

---

## 1. Lock the host down first
Do this **before** the key ever touches the machine.

```bash
# As root on the key host.
adduser --system --group --home /opt/keyservice keyservice
apt-get update && apt-get install -y ufw

# Default-deny inbound. Allow SSH (lock to your admin IP if you can) and HTTPS.
ufw default deny incoming
ufw default allow outgoing
ufw allow from <YOUR_ADMIN_IP> to any port 22 proto tcp
ufw allow 443/tcp
ufw enable
```

The service listens on `127.0.0.1:8088` only (see §4) — it is **never** exposed
directly. The TLS reverse proxy (§5) is the only public surface, on 443.

> If your provider gives you a private network shared with the app host, prefer
> binding the proxy to that private interface and firewalling 443 to the app
> host's IP only. Public 443 + a strong bearer token is the fallback.

---

## 2. Install Node and the service file
```bash
# Node 20 LTS (matches the app's runtime). Use your distro's NodeSource setup.
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Drop server.mjs in place (copy from this repo: tools/keyservice/server.mjs).
install -o keyservice -g keyservice -m 0644 server.mjs /opt/keyservice/server.mjs
```

The service is a single zero-dependency file — no `npm install`, nothing to audit
beyond Node itself and the ~120 lines you can read.

---

## 3. Generate the KEK and the shared token
```bash
# 32-byte master key (KEK) and the bearer token the app will present.
openssl rand -base64 32   # -> KMS_MASTER_KEY   (the KEK)
openssl rand -hex 32      # -> KMS_SERVICE_TOKEN (shared secret)
```

**Back up the KEK now**, into a secrets manager or an offline vault — lose it and
**every encrypted item becomes permanently unreadable** (that is the design, so
treat the backup as the single most important secret you hold). Never commit it,
never put it in the app's `.env`, never log it.

Store both in an env file readable only by the service user:
```bash
umask 077
cat > /opt/keyservice/keyservice.env <<EOF
KMS_MASTER_KEY=<paste the base64 KEK>
KMS_SERVICE_TOKEN=<paste the hex token>
PORT=8088
EOF
chown keyservice:keyservice /opt/keyservice/keyservice.env
chmod 600 /opt/keyservice/keyservice.env
```

---

## 4. Run it under systemd (auto-restart, no shell)
```ini
# /etc/systemd/system/keyservice.service
[Unit]
Description=Citadel off-host key service
After=network-online.target
Wants=network-online.target

[Service]
User=keyservice
Group=keyservice
EnvironmentFile=/opt/keyservice/keyservice.env
ExecStart=/usr/bin/node /opt/keyservice/server.mjs
Restart=on-failure
RestartSec=2
# Hardening — the process needs nothing but the network and its env.
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
PrivateDevices=true
ReadOnlyPaths=/opt/keyservice
# Bind only to loopback; the TLS proxy in §5 is the public edge.
Environment=HOST=127.0.0.1

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now keyservice
systemctl status keyservice          # should be active (running)
curl -s http://127.0.0.1:8088/health # -> {"ok":true}
```

> `server.mjs` binds `PORT` on all interfaces by default; the firewall in §1 keeps
> 8088 private, and the systemd `Environment=HOST=127.0.0.1` documents intent. If
> you want a hard loopback bind, pass the host explicitly in your own fork of
> `server.listen`. Either way, **do not** open 8088 in `ufw`.

---

## 5. Put TLS in front (Caddy — automatic certs)
The app talks to the service over HTTPS only. Caddy gives you a Let's Encrypt cert
with zero config.

```bash
apt-get install -y caddy
cat > /etc/caddy/Caddyfile <<'EOF'
keys.your-domain.ca {
    reverse_proxy 127.0.0.1:8088
}
EOF
systemctl reload caddy

# Verify end to end (from anywhere):
curl -s https://keys.your-domain.ca/health   # -> {"ok":true}
```

For stronger auth than a bearer token, add **mTLS**: have Caddy require a client
cert that only the app host holds (`tls { client_auth ... }`). That is the
`TODO(production)` in the README and is recommended before real client data.

---

## 6. Point the Citadel app at it
On the **app host**, in `.env.docker`:
```
KMS_REMOTE_URL=https://keys.your-domain.ca
KMS_REMOTE_TOKEN=<the same KMS_SERVICE_TOKEN from §3>
```
Then redeploy the app (`docker compose up -d --build`). `getKmsClient()` switches
from `LocalKmsClient` to `RemoteKmsClient`; the app no longer needs `KMS_MASTER_KEY`
locally — **remove it from the app host** so the KEK truly lives in one place.

Confirm the wiring from the app container:
```bash
docker compose exec citadel node -e "fetch(process.env.KMS_REMOTE_URL+'/health').then(r=>r.json()).then(console.log)"
# -> { ok: true }
```

### Cutover note (don't lose data by surprise)
Items already wrapped on-host under the *local* KEK can't be unwrapped by the
remote service (different KEK) — they will read as forgotten. Do the switch on a
**fresh deploy**, or let existing demo items forget on schedule first. Every **new**
item is wrapped remotely from the moment you flip the env vars.

---

## 7. Operate it
- **Healthcheck (Compose).** If you ever run the key service under Docker too, give
  it the same liveness probe the app uses:
  ```yaml
  healthcheck:
    test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:8088/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
    interval: 30s
    timeout: 5s
    retries: 3
  ```
- **Backups.** Back up only the KEK (offline, encrypted). There is no other state.
- **Availability.** If the key host is down, the app can't unwrap → items read as
  temporarily unavailable, not lost. Keep it on a reliable host; consider an
  active/standby pair sharing the same KEK if uptime matters.
- **Monitoring.** Alert on `keyservice` being inactive and on non-200 `/health`.
  Add unwrap-call audit logging (the README `TODO(production)`) so you can see
  access patterns without seeing keys.
- **Rotation.** To rotate the KEK you must re-wrap live DEKs (decrypt-with-old,
  wrap-with-new) — out of scope for the reference service; plan it before scale.

---

## 8. End state vs. this reference
`server.mjs` is a **reference** that proves the contract and lets you go live on a
plain VM. The production target is a **Canadian-controlled managed KMS / HSM**
where the KEK is generated and used inside hardware and never read by any process.
When you adopt one, keep `RemoteKmsClient` and repoint `KMS_REMOTE_URL` at the
HSM's wrap/unwrap endpoint (or implement a thin `KmsClient` against its SDK) — the
app code does not change.

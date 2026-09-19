# Citadel off-host key service

Holds the master key (KEK) on a **separate host from the Citadel app**, so the app
box only ever stores ciphertext + wrapped data keys. This is the "keys-off-host"
production gate from [`COMPLIANCE.md`](../../COMPLIANCE.md): a seizure or court
order against the app/GPU host can only produce data nobody can decrypt there, and
crypto-shredding makes destroyed items unrecoverable for good.

It's a single zero-dependency Node file (`server.mjs`, node builtins only).

## Topology
```
[ user ] → [ Citadel app + Apertus + DB ]  ──wrap/unwrap──▶  [ key service ] (holds KEK)
            (holds only ciphertext + wrapped DEKs)            (different host, ideally 🇨🇦)
```

## Run it (on the key host)
```bash
export KMS_MASTER_KEY="$(openssl rand -base64 32)"   # 32-byte KEK — store in a secrets mgr
export KMS_SERVICE_TOKEN="$(openssl rand -hex 32)"   # shared secret the app sends
export PORT=8088
node server.mjs
```
Put it behind TLS (a reverse proxy / Caddy) so the app reaches it over HTTPS, and
restrict network access to the app host. **Back up `KMS_MASTER_KEY`** — lose it and
every item becomes unreadable (by design).

## Point the Citadel app at it
In the app's `.env.docker` (on the app host):
```
KMS_REMOTE_URL=https://keys.your-canadian-host.example
KMS_REMOTE_TOKEN=<the same KMS_SERVICE_TOKEN>
```
Then redeploy the app. `getKmsClient()` switches to `RemoteKmsClient`; the app no
longer needs `KMS_MASTER_KEY` locally. (Leave `KMS_REMOTE_URL` unset to fall back
to the on-host `LocalKmsClient` for local dev.)

## Migration note
Items wrapped by the on-host `LocalKmsClient` were sealed under the *local* KEK.
After switching to the remote service (a different KEK), those old items can't be
unwrapped — they'll read as forgotten. For a clean cutover, do it on a fresh
deploy, or let existing items forget on schedule. New items are wrapped remotely.

## Protocol (for reference)
- `POST /wrap   { dek: base64 }   → { wrapped: "kms:v1:…" }`
- `POST /unwrap { wrapped }       → { dek: base64 }`  (404 = unrecoverable)
- `GET  /health → { ok: true }`
- Bearer-authenticated with `KMS_SERVICE_TOKEN`. Envelope format matches the app's
  `LocalKmsClient`, so wrapped values are interchangeable.

## TODO(production)
- Replace this reference service with a Canadian-controlled managed KMS / HSM
  (the KEK generated and used inside hardware, never read by a process).
- mTLS between app and key service; audit logging of unwrap calls; rate limiting.

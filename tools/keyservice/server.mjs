// ============================================================================
// Citadel off-host key service — the "keys-off-host" production gate.
//
// Run this on a SEPARATE host from the Citadel app (ideally Canadian-controlled).
// It holds the master key (KEK) and wraps/unwraps per-item data keys (DEKs) so
// the app box never holds the KEK — a seizure/court order against the app yields
// only ciphertext + wrapped DEKs. Zero dependencies (node: builtins only).
//
// Wire protocol (matches src/lib/keyvault/kms/RemoteKmsClient.ts):
//   POST /wrap    { dek: base64 }          -> { wrapped: "kms:v1:…" }
//   POST /unwrap  { wrapped: "kms:v1:…" }  -> { dek: base64 }   (404 if unreadable)
//   GET  /health  -> { ok: true }
// Bearer-authenticated with KMS_SERVICE_TOKEN.
//
// Env:
//   KMS_MASTER_KEY    base64-encoded 32-byte KEK   (required; from a secrets mgr)
//   KMS_SERVICE_TOKEN shared secret the app sends   (required)
//   PORT              listen port                    (default 8088)
//
// The envelope format is identical to the app's LocalKmsClient ("kms:v1:" +
// base64(JSON({ciphertext,iv,authTag}))), so wrapped values are interchangeable.
// ============================================================================
import http from "node:http";
import crypto from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_BYTES = 12;
const WRAP_PREFIX = "kms:v1:";

const KEK = Buffer.from(process.env.KMS_MASTER_KEY ?? "", "base64");
const TOKEN = process.env.KMS_SERVICE_TOKEN ?? "";
const PORT = Number(process.env.PORT ?? 8088);

if (KEK.length !== 32) {
  console.error("KMS_MASTER_KEY must be a base64-encoded 32-byte key. Exiting.");
  process.exit(1);
}
if (!TOKEN) {
  console.error("KMS_SERVICE_TOKEN must be set. Exiting.");
  process.exit(1);
}

// AES-256-GCM, matching src/lib/crypto.ts exactly.
function encrypt(plaintext) {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGO, KEK, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    ciphertext: enc.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}
function decrypt(env) {
  try {
    const d = crypto.createDecipheriv(ALGO, KEK, Buffer.from(env.iv, "base64"));
    d.setAuthTag(Buffer.from(env.authTag, "base64"));
    return Buffer.concat([d.update(Buffer.from(env.ciphertext, "base64")), d.final()]).toString("utf8");
  } catch {
    return null; // wrong key / tampered → unrecoverable
  }
}

const wrap = (dekB64) => WRAP_PREFIX + Buffer.from(JSON.stringify(encrypt(dekB64))).toString("base64");
function unwrap(wrapped) {
  if (typeof wrapped !== "string" || !wrapped.startsWith(WRAP_PREFIX)) return null;
  try {
    const env = JSON.parse(Buffer.from(wrapped.slice(WRAP_PREFIX.length), "base64").toString("utf8"));
    return decrypt(env);
  } catch {
    return null;
  }
}

function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}
function authed(req) {
  return req.headers["authorization"] === `Bearer ${TOKEN}`;
}
function readJson(req) {
  return new Promise((resolve) => {
    let buf = "";
    req.on("data", (c) => {
      buf += c;
      if (buf.length > 1_000_000) req.destroy(); // 1MB guard
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(buf || "{}"));
      } catch {
        resolve(null);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true });

  if (req.method !== "POST" || (req.url !== "/wrap" && req.url !== "/unwrap")) {
    return send(res, 404, { error: "not found" });
  }
  if (!authed(req)) return send(res, 401, { error: "unauthorized" });

  const body = await readJson(req);
  if (!body) return send(res, 400, { error: "invalid json" });

  if (req.url === "/wrap") {
    if (typeof body.dek !== "string") return send(res, 400, { error: "dek required" });
    return send(res, 200, { wrapped: wrap(body.dek) });
  }
  // /unwrap
  const dek = unwrap(body.wrapped);
  if (dek === null) return send(res, 404, { error: "unrecoverable" });
  return send(res, 200, { dek });
});

server.listen(PORT, () => console.log(`[keyservice] listening on :${PORT}`));

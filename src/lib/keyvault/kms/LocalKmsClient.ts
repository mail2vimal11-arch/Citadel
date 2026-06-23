import fs from "node:fs";
import path from "node:path";
import type { DataKey, KmsClient } from "./KmsClient";
import { encrypt, decrypt, generateKey, type Encrypted } from "@/lib/crypto";

// ============================================================================
// LocalKmsClient — a stand-in KMS that runs fully offline.
//
// It does the SAME envelope encryption a real KMS does, but the KEK lives in a
// local secret rather than hardware: either the KMS_MASTER_KEY env var (base64,
// 32 bytes) or an auto-provisioned file at .citadel-secrets/kms-master.key
// (gitignored — the same out-of-band secrets dir used for Gmail tokens).
//
// Why this still earns its keep over LocalKeyVault: the KEK is NOT in the
// database. The DB holds only wrapped DEKs (ciphertext). Whoever steals the
// SQLite file gets locks with no keys — exactly the property the demo vault
// lacked. The remaining gap vs. production is only WHERE the KEK lives (a local
// file/env, not an HSM), which is the one line the seam exists to swap.
//
// TODO(production): replace the file/env KEK with a Canadian-controlled managed
// KMS so the master key is generated and used inside hardware and never read by
// the app process. Prefer KMS_MASTER_KEY-from-secrets-manager at minimum.
// ============================================================================

// Wrapped DEKs carry a version tag so the format can evolve and so the vault can
// tell an enveloped value apart from a legacy raw key (see KmsKeyVault).
export const WRAP_PREFIX = "kms:v1:";

const SECRETS_DIR = path.join(process.cwd(), ".citadel-secrets");
const MASTER_KEY_FILE = path.join(SECRETS_DIR, "kms-master.key");

export class LocalKmsClient implements KmsClient {
  readonly name = "Local KMS (envelope encryption; KEK in env/secret file)";
  // Cache the resolved KEK so we don't re-read the file on every call. An
  // explicit key (used by tests) bypasses env/file resolution entirely.
  private kek: Buffer | null;

  constructor(kek?: Buffer) {
    this.kek = kek ?? null;
  }

  async generateDataKey(): Promise<DataKey> {
    const kek = this.getKek();
    const plaintext = generateKey();
    // Wrap = encrypt the DEK (as base64) under the KEK, then tag with a version.
    const env = encrypt(plaintext.toString("base64"), kek);
    const wrapped = WRAP_PREFIX + Buffer.from(JSON.stringify(env)).toString("base64");
    return { plaintext, wrapped };
  }

  async unwrap(wrapped: string): Promise<Buffer | null> {
    if (!wrapped.startsWith(WRAP_PREFIX)) return null;
    const kek = this.getKek();
    let env: Encrypted;
    try {
      env = JSON.parse(
        Buffer.from(wrapped.slice(WRAP_PREFIX.length), "base64").toString("utf8")
      );
    } catch {
      return null;
    }
    const b64 = decrypt(env, kek);
    return b64 === null ? null : Buffer.from(b64, "base64");
  }

  // Resolve the KEK: explicit > env > local file (auto-provisioned on first use).
  private getKek(): Buffer {
    if (this.kek) return this.kek;

    const fromEnv = process.env.KMS_MASTER_KEY;
    if (fromEnv) {
      const buf = Buffer.from(fromEnv, "base64");
      if (buf.length !== 32) {
        throw new Error("KMS_MASTER_KEY must be 32 bytes (base64-encoded).");
      }
      this.kek = buf;
      return buf;
    }

    if (fs.existsSync(MASTER_KEY_FILE)) {
      this.kek = Buffer.from(fs.readFileSync(MASTER_KEY_FILE, "utf8").trim(), "base64");
      return this.kek;
    }

    // First run with no configured KEK: generate one and persist it OUTSIDE the
    // database (file mode 0600). TODO(production): never auto-provision — the KEK
    // must come from the managed KMS / secrets manager.
    const key = generateKey();
    fs.mkdirSync(SECRETS_DIR, { recursive: true });
    fs.writeFileSync(MASTER_KEY_FILE, key.toString("base64"), { mode: 0o600 });
    this.kek = key;
    return key;
  }
}

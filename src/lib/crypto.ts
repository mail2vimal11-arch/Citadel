import crypto from "node:crypto";

// ============================================================================
// Authenticated encryption for derived data (AES-256-GCM).
//
// NOTE: This uses Node's standard, well-tested crypto primitives correctly
// (random 96-bit IV per message, GCM auth tag). The DEMO weakness is not the
// algorithm — it is WHERE the keys live (see LocalKeyVault). In production the
// keys must come from a Canadian-controlled HSM/KMS.
//
// We NEVER log keys or plaintext anywhere in this module.
// ============================================================================

const ALGORITHM = "aes-256-gcm";
export const KEY_BYTES = 32; // 256-bit key
const IV_BYTES = 12; // 96-bit nonce, recommended for GCM

export interface Encrypted {
  ciphertext: string; // base64
  iv: string; // base64
  authTag: string; // base64
}

export function generateKey(): Buffer {
  return crypto.randomBytes(KEY_BYTES);
}

export function encrypt(plaintext: string, key: Buffer): Encrypted {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: enc.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

// Returns the decrypted plaintext, or null if the data cannot be decrypted
// (e.g. the key was destroyed / is wrong / the ciphertext was tampered with).
export function decrypt(data: Encrypted, key: Buffer): string | null {
  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(data.iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(data.authTag, "base64"));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(data.ciphertext, "base64")),
      decipher.final(),
    ]);
    return dec.toString("utf8");
  } catch {
    // Wrong/destroyed key or tampered data — by design we just can't read it.
    return null;
  }
}

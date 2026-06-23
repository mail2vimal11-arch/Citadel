import { describe, it, expect } from "vitest";
import { generateKey, encrypt, decrypt } from "@/lib/crypto";

describe("crypto (AES-256-GCM) — the crypto-shredding guarantee", () => {
  it("round-trips plaintext with the right key", () => {
    const key = generateKey();
    const enc = encrypt("hello sovereign world", key);
    expect(decrypt(enc, key)).toBe("hello sovereign world");
  });

  it("is unrecoverable once the key is gone (a different key)", () => {
    const key = generateKey();
    const enc = encrypt("privileged client note", key);
    const destroyed = generateKey(); // the original key no longer exists
    expect(decrypt(enc, destroyed)).toBeNull();
  });

  it("returns null when the ciphertext is tampered with", () => {
    const key = generateKey();
    const enc = encrypt("secret", key);
    const tampered = { ...enc, ciphertext: Buffer.from("deadbeef", "hex").toString("base64") };
    expect(decrypt(tampered, key)).toBeNull();
  });

  it("uses a fresh IV per message (same plaintext → different ciphertext)", () => {
    const key = generateKey();
    expect(encrypt("same", key).ciphertext).not.toBe(encrypt("same", key).ciphertext);
  });
});

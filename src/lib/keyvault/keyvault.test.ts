import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { encrypt, decrypt, generateKey } from "@/lib/crypto";
import { LocalKeyVault } from "./LocalKeyVault";
import { KmsKeyVault } from "./KmsKeyVault";
import { LocalKmsClient, WRAP_PREFIX } from "./kms/LocalKmsClient";
import type { KeyVault } from "./KeyVault";

// A fixed test KEK so the KMS path never touches env or the filesystem.
const TEST_KEK = generateKey();

afterAll(async () => {
  await prisma.$disconnect();
});

// The KeyVault contract every implementation must honour: issue → use → destroy
// → unrecoverable. This is the crypto-shredding guarantee at the vault level.
function contractTests(name: string, make: () => KeyVault) {
  describe(`${name} — KeyVault contract`, () => {
    it("issues a usable key, then shreds it so the data is unrecoverable", async () => {
      const vault = make();
      const { keyId, key } = await vault.issueKey();

      // The issued key round-trips real ciphertext.
      const enc = encrypt("privileged matter notes", key);
      const fetched = await vault.getKey(keyId);
      expect(fetched).not.toBeNull();
      expect(decrypt(enc, fetched!)).toBe("privileged matter notes");

      // Destroy the key — the irreversible step.
      await vault.destroyKey(keyId);

      // Key is gone forever, and the ciphertext can no longer be read.
      expect(await vault.getKey(keyId)).toBeNull();
      const gone = await vault.getKey(keyId);
      expect(gone === null || decrypt(enc, gone) === null).toBe(true);
    });
  });
}

contractTests("LocalKeyVault (demo)", () => new LocalKeyVault());
contractTests("KmsKeyVault (envelope)", () => new KmsKeyVault(new LocalKmsClient(TEST_KEK)));

describe("KmsKeyVault — keys live apart from the data", () => {
  it("persists only a WRAPPED key, never raw key bytes", async () => {
    const vault = new KmsKeyVault(new LocalKmsClient(TEST_KEK));
    const { keyId, key } = await vault.issueKey();

    const row = await prisma.vaultKey.findUnique({ where: { id: keyId } });
    expect(row?.material).toBeTruthy();
    expect(row!.material!.startsWith(WRAP_PREFIX)).toBe(true);
    // The stored value is NOT the raw key in any encoding.
    expect(row!.material).not.toBe(key.toString("base64"));
    expect(row!.material).not.toContain(key.toString("base64"));
  });

  it("cannot recover a key with the wrong master key (DB alone is useless)", async () => {
    // Issue under one KEK…
    const real = new KmsKeyVault(new LocalKmsClient(TEST_KEK));
    const { keyId } = await real.issueKey();

    // …then try to read the SAME stored row with a different KEK.
    const attacker = new KmsKeyVault(new LocalKmsClient(generateKey()));
    expect(await attacker.getKey(keyId)).toBeNull();
  });

  it("transparently reads a legacy raw-key row (safe upgrade path)", async () => {
    // Simulate a row written by the old LocalKeyVault: raw base64, no prefix.
    const raw = generateKey();
    const legacy = await prisma.vaultKey.create({
      data: { material: raw.toString("base64"), destroyed: false },
    });

    const vault = new KmsKeyVault(new LocalKmsClient(TEST_KEK));
    const fetched = await vault.getKey(legacy.id);
    expect(fetched?.toString("base64")).toBe(raw.toString("base64"));
  });
});

describe("LocalKmsClient — envelope wrap/unwrap", () => {
  it("round-trips a data key through wrap → unwrap", async () => {
    const kms = new LocalKmsClient(TEST_KEK);
    const { plaintext, wrapped } = await kms.generateDataKey();
    expect(wrapped.startsWith(WRAP_PREFIX)).toBe(true);
    const unwrapped = await kms.unwrap(wrapped);
    expect(unwrapped?.toString("base64")).toBe(plaintext.toString("base64"));
  });

  it("returns null when unwrapping under a different KEK", async () => {
    const { wrapped } = await new LocalKmsClient(TEST_KEK).generateDataKey();
    expect(await new LocalKmsClient(generateKey()).unwrap(wrapped)).toBeNull();
  });

  it("returns null for a value that isn't a wrapped key", async () => {
    expect(await new LocalKmsClient(TEST_KEK).unwrap("not-wrapped")).toBeNull();
  });
});

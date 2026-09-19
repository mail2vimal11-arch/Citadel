import type { IssuedKey, KeyVault } from "./KeyVault";
import { generateKey } from "@/lib/crypto";
import { prisma } from "@/lib/db";

// ============================================================================
// LocalKeyVault — the DEMO key vault.
//
// >>> WARNING: NOT PRODUCTION-GRADE. <<<
//
// This stores each per-item key as base64 in the SAME SQLite file as the
// ciphertext it protects. That co-location means it provides essentially no
// real-world confidentiality — anyone with the database file has both the lock
// and the key. It exists ONLY to demonstrate the crypto-shredding lifecycle:
// issue a key, use it, then DESTROY it so the data becomes unrecoverable.
//
// TODO(production): replace with a Canadian-controlled HSM/KMS. Keys must be
// generated, stored, and destroyed inside hardware that never exposes raw key
// material to the application, with destruction being an auditable operation.
// Keys must NEVER live alongside the data they protect.
// ============================================================================
export class LocalKeyVault implements KeyVault {
  readonly name = "Local SQLite key vault (DEMO ONLY — not secure)";

  async issueKey(): Promise<IssuedKey> {
    const key = generateKey();
    const record = await prisma.vaultKey.create({
      data: { material: key.toString("base64"), destroyed: false },
    });
    return { keyId: record.id, key };
  }

  async getKey(keyId: string): Promise<Buffer | null> {
    const record = await prisma.vaultKey.findUnique({ where: { id: keyId } });
    if (!record || record.destroyed || !record.material) return null;
    return Buffer.from(record.material, "base64");
  }

  async destroyKey(keyId: string): Promise<void> {
    // Irreversible: null out the material and flag it destroyed. There is no
    // copy anywhere else, so the protected ciphertext can never be read again.
    await prisma.vaultKey.update({
      where: { id: keyId },
      data: { material: null, destroyed: true, destroyedAt: new Date() },
    });
  }
}

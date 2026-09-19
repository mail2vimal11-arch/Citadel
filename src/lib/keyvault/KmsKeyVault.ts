import type { IssuedKey, KeyVault } from "./KeyVault";
import type { KmsClient } from "./kms/KmsClient";
import { getKmsClient } from "./kms";
import { WRAP_PREFIX } from "./kms/LocalKmsClient";
import { prisma } from "@/lib/db";

// ============================================================================
// KmsKeyVault — the production-shaped key vault (envelope encryption).
//
// Unlike LocalKeyVault, this NEVER stores raw key material in the database. It
// asks the KMS for a per-item data key (DEK), uses the plaintext DEK to encrypt
// the payload in memory, and persists ONLY the wrapped DEK (the DEK encrypted
// under the KMS master key). The database therefore holds nothing but ciphertext.
//
// Crypto-shredding still works the same way, and the guarantee is actually
// stronger: to "forget" an item we destroy its one and only wrapped DEK. The
// plaintext DEK was never written down, so once the wrapped copy is gone the
// item is unrecoverable — even to someone holding both the database AND the KMS
// master key, because there is no longer anything to unwrap.
// ============================================================================
export class KmsKeyVault implements KeyVault {
  readonly name = "KMS key vault (envelope encryption; keys stored apart from data)";

  // Defaults to the env-selected client: off-host RemoteKmsClient when
  // KMS_REMOTE_URL is set, else the local KEK. Injectable for tests.
  constructor(private readonly kms: KmsClient = getKmsClient()) {}

  async issueKey(): Promise<IssuedKey> {
    const { plaintext, wrapped } = await this.kms.generateDataKey();
    // Only the WRAPPED key is persisted. `material` is ciphertext, not a key.
    const record = await prisma.vaultKey.create({
      data: { material: wrapped, destroyed: false },
    });
    return { keyId: record.id, key: plaintext };
  }

  async getKey(keyId: string): Promise<Buffer | null> {
    const record = await prisma.vaultKey.findUnique({ where: { id: keyId } });
    if (!record || record.destroyed || !record.material) return null;

    // Wrapped (normal) path: hand the wrapped DEK to the KMS to unwrap.
    if (record.material.startsWith(WRAP_PREFIX)) {
      return this.kms.unwrap(record.material);
    }

    // Legacy path: rows written by the old LocalKeyVault hold a raw base64 key.
    // Read them transparently so upgrading the vault never loses existing items;
    // they get shredded normally and any NEW item is enveloped.
    // TODO(production): one-time migration to re-wrap or expire legacy rows.
    return Buffer.from(record.material, "base64");
  }

  async destroyKey(keyId: string): Promise<void> {
    // Irreversible: drop the wrapped DEK and flag it destroyed. There is no other
    // copy of this item's key anywhere, so its ciphertext can never be read again.
    await prisma.vaultKey.update({
      where: { id: keyId },
      data: { material: null, destroyed: true, destroyedAt: new Date() },
    });
  }
}

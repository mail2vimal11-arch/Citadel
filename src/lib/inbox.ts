import { prisma } from "@/lib/db";
import { getKeyVault } from "@/lib/keyvault/LocalKeyVault";
import { decrypt } from "@/lib/crypto";
import type { AnyInboxItem, DerivedPayload } from "@/lib/types";

// Load all items for the inbox view. ACTIVE items are decrypted in-memory just
// long enough to build the response; FORGOTTEN items return NO content at all.
export async function loadInbox(userId: string): Promise<AnyInboxItem[]> {
  const vault = getKeyVault();
  const rows = await prisma.derivedItem.findMany({
    where: { userId },
    orderBy: { processedAt: "desc" },
  });

  const items: AnyInboxItem[] = [];
  for (const row of rows) {
    if (row.status === "FORGOTTEN") {
      items.push({
        id: row.id,
        status: "FORGOTTEN",
        processedAt: row.processedAt.toISOString(),
        forgottenAt: (row.forgottenAt ?? row.processedAt).toISOString(),
      });
      continue;
    }

    // ACTIVE: fetch the key and decrypt. If the key is somehow gone, we simply
    // can't show content — we never error out the whole inbox.
    const key = await vault.getKey(row.keyId);
    const plain = key
      ? decrypt(
          { ciphertext: row.ciphertext, iv: row.iv, authTag: row.authTag },
          key
        )
      : null;

    if (!plain) {
      items.push({
        id: row.id,
        status: "FORGOTTEN",
        processedAt: row.processedAt.toISOString(),
        forgottenAt: (row.forgottenAt ?? new Date()).toISOString(),
      });
      continue;
    }

    const payload = JSON.parse(plain) as DerivedPayload;
    items.push({
      id: row.id,
      status: "ACTIVE",
      processedAt: row.processedAt.toISOString(),
      forgetAt: row.forgetAt ? row.forgetAt.toISOString() : null,
      payload,
    });
  }

  return items;
}

// Demo-only: peek at the raw stored row for a forgotten item, to PROVE that the
// ciphertext is still present but unreadable now that the key is gone.
export async function proveUnrecoverable(userId: string, itemId: string): Promise<{
  found: boolean;
  status?: string;
  keyDestroyed?: boolean;
  ciphertextPreview?: string;
  decryptAttempt?: "unrecoverable" | "readable";
}> {
  const row = await prisma.derivedItem.findFirst({ where: { id: itemId, userId } });
  if (!row) return { found: false };

  const key = await getKeyVault().getKey(row.keyId);
  const plain = key
    ? decrypt({ ciphertext: row.ciphertext, iv: row.iv, authTag: row.authTag }, key)
    : null;

  return {
    found: true,
    status: row.status,
    keyDestroyed: key === null,
    // Show a short slice of the stored ciphertext (base64) — meaningless bytes.
    ciphertextPreview: row.ciphertext.slice(0, 48) + "…",
    decryptAttempt: plain ? "readable" : "unrecoverable",
  };
}

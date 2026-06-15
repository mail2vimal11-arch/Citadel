// ============================================================================
// KeyVault — the seam for key management.
//
// Each derived item gets its OWN key. To "forget" an item we destroy its key,
// which makes the item's ciphertext permanently unrecoverable. This is the
// "crypto-shredding" design at the heart of the product.
// ============================================================================

export interface IssuedKey {
  keyId: string;
  key: Buffer; // raw key bytes, kept in memory only as long as needed
}

export interface KeyVault {
  readonly name: string;
  // Create and store a fresh per-item key. Returns the id + the raw bytes.
  issueKey(): Promise<IssuedKey>;
  // Fetch the raw key bytes for an item, or null if it has been destroyed.
  getKey(keyId: string): Promise<Buffer | null>;
  // Irreversibly destroy a key. After this, getKey() must return null forever.
  destroyKey(keyId: string): Promise<void>;
}

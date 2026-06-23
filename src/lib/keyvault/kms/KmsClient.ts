// ============================================================================
// KmsClient — the seam for a managed Key Management Service.
//
// This models the envelope-encryption API that every real cloud KMS exposes
// (AWS KMS GenerateDataKey/Decrypt, GCP KMS, Azure Key Vault): a master key —
// the Key-Encryption-Key (KEK) — lives INSIDE the KMS and never leaves it. The
// app asks the KMS to mint a per-item data key (DEK); the KMS returns the DEK in
// the clear (for immediate in-memory use) AND a "wrapped" copy (the DEK
// encrypted under the KEK). Only the WRAPPED copy is ever persisted next to the
// data. To read later, the app hands the wrapped DEK back and the KMS unwraps it.
//
// This is the crux of P2: keys live APART from the data. The database only ever
// holds ciphertext — both the encrypted payload and the wrapped DEK are useless
// without the KEK, which is not in the database.
//
// TODO(production): implement this interface against a Canadian-controlled
// managed KMS / HSM (keys generated, wrapped, and destroyed in hardware that
// never exposes the KEK to the application).
// ============================================================================

export interface DataKey {
  // The raw 256-bit data key, kept in memory only as long as needed to encrypt.
  plaintext: Buffer;
  // The same key encrypted ("wrapped") under the KEK. Safe to store beside data.
  wrapped: string;
}

export interface KmsClient {
  readonly name: string;
  // Mint a fresh per-item data key: plaintext (for immediate use) + wrapped form.
  generateDataKey(): Promise<DataKey>;
  // Recover a data key from its wrapped form, or null if the KEK cannot unwrap
  // it (wrong/rotated KEK, or tampered ciphertext).
  unwrap(wrapped: string): Promise<Buffer | null>;
}

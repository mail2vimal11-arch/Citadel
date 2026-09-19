import type { KeyVault } from "./KeyVault";
import { KmsKeyVault } from "./KmsKeyVault";
import { LocalKeyVault } from "./LocalKeyVault";

// ============================================================================
// getKeyVault — the one line that chooses how keys are managed.
//
// KEY_VAULT:
//   auto | kms  = envelope encryption via the KMS seam (KmsKeyVault). The master
//                 key lives OUTSIDE the database; the DB holds only ciphertext.
//                 This is the default — keys live apart from the data.
//   local       = the insecure DEMO vault (LocalKeyVault): raw keys stored beside
//                 the data. Kept only to demonstrate the crypto-shredding
//                 lifecycle without any KMS, and for the offline contrast.
//
// TODO(production): in production this returns a KmsKeyVault wired to a
// Canadian-controlled managed KMS; the `local` option does not exist there.
// ============================================================================
export function getKeyVault(): KeyVault {
  const choice = (process.env.KEY_VAULT ?? "auto").toLowerCase();
  if (choice === "local") return new LocalKeyVault();
  return new KmsKeyVault();
}

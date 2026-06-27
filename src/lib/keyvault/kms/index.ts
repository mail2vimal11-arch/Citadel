import type { KmsClient } from "./KmsClient";
import { LocalKmsClient } from "./LocalKmsClient";
import { RemoteKmsClient } from "./RemoteKmsClient";

// getKmsClient — the one line that decides WHERE the master key lives.
//
//   KMS_REMOTE_URL set → RemoteKmsClient: the KEK lives in an external key
//     service (off this host) — the production "keys-off-host" posture
//     (COMPLIANCE.md). The app box holds only ciphertext + wrapped DEKs.
//   otherwise            → LocalKmsClient: KEK in env/file on this host (demo).
export function getKmsClient(): KmsClient {
  return process.env.KMS_REMOTE_URL ? new RemoteKmsClient() : new LocalKmsClient();
}

import { generateKey } from "@/lib/crypto";
import type { DataKey, KmsClient } from "./KmsClient";

// ============================================================================
// RemoteKmsClient — keys OFF the compute host (the COMPLIANCE.md production gate).
//
// The master key (KEK) lives in a SEPARATE key service that Citadel controls,
// ideally on Canadian-controlled infrastructure. This app box only ever:
//   - generates a per-item DEK in memory (transient, used to encrypt one item),
//   - asks the key service to WRAP it (the service holds the KEK), and
//   - stores only the wrapped DEK.
// To read, it asks the service to UNWRAP. The KEK never touches this host, so a
// seizure/court order against the compute box yields only ciphertext + wrapped
// DEKs that can't be opened here. Crypto-shredding (destroy the wrapped DEK)
// keeps the irreversibility guarantee.
//
// Wire protocol (see tools/keyservice/server.mjs):
//   POST {url}/wrap   { dek: base64 }      -> { wrapped: "kms:v1:…" }
//   POST {url}/unwrap { wrapped: "kms:v1:…" } -> { dek: base64 } | 404
// Bearer-authenticated with KMS_REMOTE_TOKEN.
// ============================================================================
export class RemoteKmsClient implements KmsClient {
  readonly name = "Remote KMS (off-host key manager)";

  private readonly url: string;
  constructor(
    url: string = process.env.KMS_REMOTE_URL ?? "",
    private readonly token: string = process.env.KMS_REMOTE_TOKEN ?? ""
  ) {
    this.url = url.replace(/\/$/, ""); // trim trailing slash so `${url}/wrap` is clean
  }

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  async generateDataKey(): Promise<DataKey> {
    // DEK is born here and used in-memory to encrypt one item; the service wraps
    // it under the KEK (which never leaves the service).
    const plaintext = generateKey();
    const res = await fetch(`${this.url}/wrap`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ dek: plaintext.toString("base64") }),
    });
    if (!res.ok) throw new Error(`Remote KMS wrap failed (${res.status}).`);
    const { wrapped } = (await res.json()) as { wrapped?: string };
    if (!wrapped) throw new Error("Remote KMS returned no wrapped key.");
    return { plaintext, wrapped };
  }

  async unwrap(wrapped: string): Promise<Buffer | null> {
    const res = await fetch(`${this.url}/unwrap`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ wrapped }),
    });
    if (res.status === 404) return null; // unknown/shredded → unrecoverable
    if (!res.ok) throw new Error(`Remote KMS unwrap failed (${res.status}).`);
    const { dek } = (await res.json()) as { dek?: string };
    return dek ? Buffer.from(dek, "base64") : null;
  }
}

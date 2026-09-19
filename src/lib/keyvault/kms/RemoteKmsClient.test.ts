import { describe, it, expect, vi, afterEach } from "vitest";
import { RemoteKmsClient } from "./RemoteKmsClient";
import { generateKey, encrypt, decrypt } from "@/lib/crypto";

afterEach(() => vi.unstubAllGlobals());

// Minimal fake Response.
const ok = (obj: unknown) => ({ ok: true, status: 200, json: async () => obj });
const status = (code: number) => ({ ok: false, status: code, json: async () => ({}) });

describe("RemoteKmsClient", () => {
  it("generateDataKey: mints a 32-byte DEK and returns the service's wrapped form", async () => {
    const calls: { url: string; body: Record<string, unknown> }[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, opts: { body: string }) => {
      calls.push({ url, body: JSON.parse(opts.body) });
      return ok({ wrapped: "kms:v1:fromservice" });
    }));
    const c = new RemoteKmsClient("https://keys.example/", "tok");
    const { plaintext, wrapped } = await c.generateDataKey();

    expect(plaintext).toHaveLength(32);
    expect(wrapped).toBe("kms:v1:fromservice");
    expect(calls[0].url).toBe("https://keys.example/wrap"); // trailing slash trimmed
    expect(typeof calls[0].body.dek).toBe("string"); // DEK sent for wrapping
  });

  it("unwrap: returns the DEK buffer the service hands back", async () => {
    const dek = generateKey();
    vi.stubGlobal("fetch", vi.fn(async () => ok({ dek: dek.toString("base64") })));
    const got = await new RemoteKmsClient("https://k", "t").unwrap("kms:v1:x");
    expect(got?.equals(dek)).toBe(true);
  });

  it("unwrap: 404 → null (shredded/unknown = unrecoverable)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => status(404)));
    expect(await new RemoteKmsClient("https://k", "t").unwrap("kms:v1:gone")).toBeNull();
  });

  it("throws when the service errors on wrap", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => status(500)));
    await expect(new RemoteKmsClient("https://k", "t").generateDataKey()).rejects.toThrow(/wrap failed/);
  });

  it("sends the bearer token", async () => {
    let auth: string | undefined;
    vi.stubGlobal("fetch", vi.fn(async (_u: string, opts: { headers: Record<string, string> }) => {
      auth = opts.headers.Authorization;
      return ok({ wrapped: "kms:v1:z" });
    }));
    await new RemoteKmsClient("https://k", "secret-token").generateDataKey();
    expect(auth).toBe("Bearer secret-token");
  });

  it("round-trips a DEK end-to-end against a same-format service", async () => {
    // A tiny in-memory fake of the key service: it wraps the exact DEK the client
    // sends under a fixed KEK using the SAME envelope format (kms:v1: + base64
    // (JSON(encrypt(...)))), and unwraps it back. This proves the remote contract
    // preserves the key byte-for-byte across the wire.
    const KEK = generateKey();
    const PREFIX = "kms:v1:";
    vi.stubGlobal("fetch", vi.fn(async (url: string, opts: { body: string }) => {
      const body = JSON.parse(opts.body);
      if (url.endsWith("/wrap")) {
        const env = encrypt(body.dek, KEK); // body.dek is the DEK as base64 text
        const wrapped = PREFIX + Buffer.from(JSON.stringify(env)).toString("base64");
        return ok({ wrapped });
      }
      // /unwrap
      try {
        const env = JSON.parse(
          Buffer.from((body.wrapped as string).slice(PREFIX.length), "base64").toString("utf8"),
        );
        const dekB64 = decrypt(env, KEK); // returns the original DEK base64 text
        return ok({ dek: dekB64 });
      } catch {
        return status(404);
      }
    }));

    const client = new RemoteKmsClient("https://k", "t");
    const { plaintext, wrapped } = await client.generateDataKey();
    const recovered = await client.unwrap(wrapped);
    expect(recovered?.equals(plaintext)).toBe(true);
  });
});

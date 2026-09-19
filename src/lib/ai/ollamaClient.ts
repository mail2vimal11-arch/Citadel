// ============================================================================
// Local Ollama client — the ONLY place the app talks to the local model server.
//
// Everything here points at a LOCAL Ollama server (default http://localhost:11434).
// There are NO API keys and NO cloud endpoints anywhere. This is what keeps the
// whole demo — including the synthetic sample data — fully offline.
//
// TODO(production): point OLLAMA_BASE_URL at the SAME Apertus model served on
// Canadian-controlled infrastructure (a Canadian GPU host or on-prem appliance)
// instead of localhost. The interface above this client never changes — only the
// base URL and transport security (mTLS, private networking) do.
// ============================================================================

// Read once. Defaults are the local Ollama server described in the README.
export const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") || "http://localhost:11434";

// The chat model. Default is the community Apertus 8B Instruct GGUF (Q4_K_M),
// the practical size for consumer hardware. Override with OLLAMA_MODEL.
export const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "MichelRosselli/apertus:8b-instruct-2509-q4_k_m";

// The local embedding model for the search/memory seam.
export const OLLAMA_EMBED_MODEL =
  process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

// 8B models on CPU can be slow; give generation a generous ceiling.
const GENERATE_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 120_000);
const PING_TIMEOUT_MS = 2_500;

async function withTimeout<T>(
  ms: number,
  fn: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fn(ctrl.signal);
  } finally {
    clearTimeout(timer);
  }
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// One non-streaming chat completion against the local model.
// `json: true` asks Ollama to constrain output to valid JSON (used for triage).
export async function ollamaChat(
  messages: ChatMessage[],
  opts: { json?: boolean; temperature?: number; model?: string } = {}
): Promise<string> {
  const body = {
    model: opts.model || OLLAMA_MODEL,
    messages,
    stream: false,
    ...(opts.json ? { format: "json" } : {}),
    options: { temperature: opts.temperature ?? 0.2 },
  };

  const res = await withTimeout(GENERATE_TIMEOUT_MS, (signal) =>
    fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    })
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Ollama chat failed (${res.status}). Is the model pulled and the server running? ${detail}`.trim()
    );
  }

  const data = (await res.json()) as { message?: { content?: string } };
  return data.message?.content?.trim() ?? "";
}

// One embedding vector for a piece of text, from the local embedding model.
export async function ollamaEmbed(
  text: string,
  model: string = OLLAMA_EMBED_MODEL
): Promise<number[]> {
  const res = await withTimeout(GENERATE_TIMEOUT_MS, (signal) =>
    fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: text }),
      signal,
    })
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Ollama embeddings failed (${res.status}). ${detail}`.trim());
  }
  const data = (await res.json()) as { embedding?: number[] };
  if (!data.embedding?.length) throw new Error("Ollama returned an empty embedding.");
  return data.embedding;
}

// Is a local Ollama server reachable AND is `model` already pulled?
// Used by "auto" provider selection so the demo gracefully falls back to the
// offline placeholder when the local model isn't ready yet.
export async function ollamaModelReady(model: string): Promise<boolean> {
  try {
    const res = await withTimeout(PING_TIMEOUT_MS, (signal) =>
      fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal })
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { models?: { name?: string; model?: string }[] };
    const names = (data.models ?? []).flatMap((m) => [m.name, m.model].filter(Boolean));
    // Match exact tag, or the bare name before ":latest".
    return names.some((n) => n === model || n === `${model}:latest` || n?.split(":")[0] === model.split(":")[0]);
  } catch {
    return false;
  }
}

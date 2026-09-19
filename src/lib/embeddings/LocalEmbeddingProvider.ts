import type { EmbeddingProvider } from "./EmbeddingProvider";
import { ollamaEmbed, OLLAMA_EMBED_MODEL, ollamaModelReady } from "@/lib/ai/ollamaClient";

// ============================================================================
// LocalEmbeddingProvider — runs a small embedding model (default
// `nomic-embed-text`) 100% locally via the same Ollama server as the chat model.
// No network, no API key. Used by the in-memory semantic search demo.
//
// TODO(production): serve this embedding model on Canadian-controlled
// infrastructure (same swap as ApertusLocalProvider). This class is unchanged.
// ============================================================================
export class LocalEmbeddingProvider implements EmbeddingProvider {
  readonly name = `Local embeddings (via Ollama — ${OLLAMA_EMBED_MODEL})`;

  async embed(text: string): Promise<number[]> {
    return ollamaEmbed(text);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const out: number[][] = [];
    for (const t of texts) out.push(await this.embed(t));
    return out;
  }
}

// Is the local embedding model reachable and pulled?
export function embeddingsAvailable(): Promise<boolean> {
  return ollamaModelReady(OLLAMA_EMBED_MODEL);
}

// Selector — the one line a developer changes to swap embedding backends.
export function getEmbeddingProvider(): EmbeddingProvider {
  return new LocalEmbeddingProvider();
}

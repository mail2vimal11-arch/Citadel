// ============================================================================
// EmbeddingProvider — the seam for the search / memory layer.
//
// Embeddings turn text into vectors so the assistant can later answer "find the
// email about the lien deadline" by meaning, not just keywords. Like the
// AIProvider, this MUST run on local or Canadian-controlled infrastructure so
// no email-derived data leaves sovereign control.
//
// TODO(production): serve the same local embedding model on Canadian-controlled
// infrastructure. Only the concrete implementation changes — this interface and
// every caller stay the same.
// ============================================================================
export interface EmbeddingProvider {
  readonly name: string;
  // Embed a single piece of text into a vector.
  embed(text: string): Promise<number[]>;
  // Embed many texts (default: just map over embed()).
  embedBatch(texts: string[]): Promise<number[][]>;
}

// Cosine similarity of two equal-length vectors, in [-1, 1]. Higher = closer.
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

import { loadInbox } from "@/lib/inbox";
import {
  getEmbeddingProvider,
  embeddingsAvailable,
} from "@/lib/embeddings/LocalEmbeddingProvider";
import { cosineSimilarity } from "@/lib/embeddings/EmbeddingProvider";
import type { InboxItem } from "@/lib/types";

export interface SearchHit {
  id: string;
  from: string;
  subject: string;
  summary: string;
  score: number; // 0..1, higher is closer
}

export interface SearchResult {
  mode: "semantic" | "keyword";
  provider: string;
  hits: SearchHit[];
}

// Demonstrates the EmbeddingProvider seam: rank ACTIVE items by meaning.
//
// Everything here is IN-MEMORY ONLY. We decrypt active summaries just long
// enough to embed them and never persist the vectors — so search adds nothing
// new to forget/shred. Forgotten items have no content and are never searched.
export async function searchInbox(query: string): Promise<SearchResult> {
  const q = query.trim();
  const active = (await loadInbox()).filter(
    (i): i is InboxItem => i.status === "ACTIVE"
  );

  if (!q || active.length === 0) {
    return { mode: "keyword", provider: "none", hits: [] };
  }

  const docText = (i: InboxItem) =>
    `${i.payload.subject}\n${i.payload.summary}\n${i.payload.triageLabel}`;

  // Prefer real local semantic search; fall back to keyword match offline.
  if (await embeddingsAvailable()) {
    const embedder = getEmbeddingProvider();
    const [qVec, docVecs] = await Promise.all([
      embedder.embed(q),
      embedder.embedBatch(active.map(docText)),
    ]);
    const hits = active
      .map((i, idx) => ({
        id: i.id,
        from: i.payload.from,
        subject: i.payload.subject,
        summary: i.payload.summary,
        // Map cosine [-1,1] to [0,1] for a friendlier score.
        score: (cosineSimilarity(qVec, docVecs[idx]) + 1) / 2,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    return { mode: "semantic", provider: embedder.name, hits };
  }

  // Keyword fallback (no Ollama embeddings available).
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = active
    .map((i) => {
      const hay = docText(i).toLowerCase();
      const matched = terms.filter((t) => hay.includes(t)).length;
      return {
        id: i.id,
        from: i.payload.from,
        subject: i.payload.subject,
        summary: i.payload.summary,
        score: terms.length ? matched / terms.length : 0,
      };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  return { mode: "keyword", provider: "offline keyword match", hits };
}

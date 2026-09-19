import { NextResponse } from "next/server";
import { searchInbox } from "@/lib/search";
import { runForgetSweep } from "@/lib/forget/forgetEngine";
import { requireUserId } from "@/lib/apiUser";

export const dynamic = "force-dynamic";

// GET /api/search?q=... — semantic search over ACTIVE items using the local
// EmbeddingProvider (falls back to keyword match when Ollama embeddings are off).
// Runs a forget sweep first so expired items are never searchable.
export async function GET(req: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  await runForgetSweep(userId);
  const result = await searchInbox(userId, q);
  return NextResponse.json(result);
}

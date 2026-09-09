import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/apiUser";
import { searchInbox } from "@/lib/search";
import { resolveAIProvider } from "@/lib/ai";
import { runForgetSweep } from "@/lib/forget/forgetEngine";

export const dynamic = "force-dynamic";

// POST /api/ask { question } — Ask AI (RAG over the inbox).
// Retrieval reuses the local semantic search (in-memory; keyword fallback), then
// the local model answers grounded ONLY in the retrieved items' NON-sensitive
// derived fields (from/subject/summary). Nothing is persisted; raw bodies are
// never involved. We sweep first so forgotten items are never used as context.
export async function POST(req: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await req.json().catch(() => ({}));
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ ok: false, error: "Provide a question." }, { status: 400 });
  }

  await runForgetSweep(userId);

  // Retrieve the most relevant active items, then answer from them.
  const retrieval = await searchInbox(userId, question);
  const contexts = retrieval.hits.map((h) => ({ from: h.from, subject: h.subject, summary: h.summary }));

  const ai = await resolveAIProvider();
  const answer = await ai.answer(question, contexts);

  return NextResponse.json({
    ok: true,
    answer,
    sources: retrieval.hits.map((h) => ({ id: h.id, subject: h.subject, from: h.from })),
    mode: retrieval.mode,
    aiProvider: ai.name,
  });
}

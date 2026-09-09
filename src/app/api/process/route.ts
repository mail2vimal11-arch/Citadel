import { NextResponse } from "next/server";
import { processInbox } from "@/lib/pipeline";
import { runForgetSweep } from "@/lib/forget/forgetEngine";
import { requireUserId } from "@/lib/apiUser";

export const dynamic = "force-dynamic";

// POST /api/process — run the AI pipeline over this user's not-yet-processed
// emails. Streams newline-delimited JSON so a slow (CPU) run shows live progress:
//   {"type":"progress","current":3,"total":10}
//   …
//   {"type":"done", processed, skipped, capped, plan, aiProvider, emailSource}
// (or {"type":"error","error":"…"}). A forget sweep runs first so state is consistent.
export async function POST() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (obj: unknown) => controller.enqueue(enc.encode(JSON.stringify(obj) + "\n"));
      try {
        await runForgetSweep(userId);
        const result = await processInbox(userId, undefined, (p) =>
          send({ type: "progress", current: p.current, total: p.total })
        );
        send({ type: "done", ...result });
      } catch (e) {
        send({ type: "error", error: e instanceof Error ? e.message : "Processing failed." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}

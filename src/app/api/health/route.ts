import { NextResponse } from "next/server";

// ============================================================================
// GET /api/health — liveness probe for the container orchestrator.
//
// Deliberately cheap and dependency-free: it does NOT touch the database, the
// KMS, Ollama, or any user data. It only proves the Next.js server is up and
// answering, which is exactly what a Docker/Compose healthcheck should test
// (liveness, not readiness of every downstream). Keeping it content-free also
// means it can never leak anything — same discipline as the audit log.
// ============================================================================
export const dynamic = "force-dynamic"; // never cache; always reflect "now"
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    { ok: true, service: "citadel", status: "alive" },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

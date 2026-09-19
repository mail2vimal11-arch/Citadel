import type { AIProvider } from "./AIProvider";
import { LocalHeuristicProvider } from "./LocalHeuristicProvider";
import { ApertusLocalProvider } from "./ApertusLocalProvider";
import { OLLAMA_MODEL, ollamaModelReady } from "./ollamaClient";

// ============================================================================
// Single place that chooses which AIProvider the app uses.
//
// AI_PROVIDER env var:
//   "auto"      (default) — use local Apertus via Ollama IF it's reachable and
//                           the model is pulled; otherwise fall back to the
//                           offline rule-based placeholder (and say so loudly).
//   "apertus"             — force local Apertus (errors surface if Ollama is down).
//   "heuristic"           — force the offline placeholder (handy for a no-Ollama demo).
//
// Either way the rest of the app only ever sees the AIProvider interface.
// TODO(production): select an Apertus instance served on Canadian-controlled
// infrastructure here (e.g. by customer/region config). Only this file changes.
// ============================================================================

export type AIProviderMode = "auto" | "apertus" | "heuristic";

function mode(): AIProviderMode {
  const m = (process.env.AI_PROVIDER || "auto").toLowerCase();
  return m === "apertus" || m === "heuristic" ? m : "auto";
}

let warnedFallback = false;

// Async resolver: in "auto" mode it pings the local Ollama server so the demo
// keeps working whether or not the model is up yet.
export async function resolveAIProvider(): Promise<AIProvider> {
  const m = mode();
  if (m === "heuristic") return new LocalHeuristicProvider();
  if (m === "apertus") return new ApertusLocalProvider();

  // auto
  if (await ollamaModelReady(OLLAMA_MODEL)) {
    return new ApertusLocalProvider();
  }
  if (!warnedFallback) {
    warnedFallback = true;
    // Not an error — a deliberate, visible fallback so a non-technical user can
    // always run the demo. We never silently pretend the placeholder is real AI.
    console.warn(
      `[AI] Local Apertus model "${OLLAMA_MODEL}" not reachable on Ollama — ` +
        "falling back to the OFFLINE rule-based placeholder. " +
        "Start Ollama and pull the model to see real local AI (see README)."
    );
  }
  return new LocalHeuristicProvider();
}

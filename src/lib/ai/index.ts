import type { AIProvider } from "./AIProvider";
import { LocalHeuristicProvider } from "./LocalHeuristicProvider";

// Single place that chooses which AIProvider the app uses.
// TODO(production): select a Canadian-hosted or on-device provider here (e.g.
// based on an environment variable / customer configuration). The rest of the
// app only ever sees the AIProvider interface, so this is the only line that
// needs to change to swap backends.
export function getAIProvider(): AIProvider {
  return new LocalHeuristicProvider();
}

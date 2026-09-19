// Edge/client stand-in for the forget scheduler. The real scheduler pulls in
// node:fs / node:crypto / Prisma (via the KMS vault and forget engine), which
// the Edge bundler can't compile. instrumentation.ts only ever calls
// startForgetScheduler() on the Node.js runtime; for the Edge/client builds
// next.config swaps in this no-op so the node-only graph is never bundled there.
export function startForgetScheduler(): boolean {
  return false;
}

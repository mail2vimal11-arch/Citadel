// Next.js calls register() once when the server process starts (dev and
// production `next start`) — NOT during `next build`. We use it to launch the
// background forget scheduler so expired items are destroyed on time without
// anyone opening the app.
//
// The Prisma client only runs on the Node.js runtime (not Edge), so we guard on
// NEXT_RUNTIME and import the scheduler dynamically to keep it out of the Edge
// bundle entirely.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startForgetScheduler } = await import("@/lib/forget/scheduler");
  startForgetScheduler();
}

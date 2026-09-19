import { runForgetSweepAll } from "./forgetEngine";

// ============================================================================
// Forget scheduler — the background worker that makes "forgets on schedule,
// even if you never open the app" literally true.
//
// The lazy, on-read sweep (runForgetSweep, called by the API routes) only fires
// when someone looks at their inbox. That is fine for a demo but it is NOT the
// promise: a forget deadline must be honoured whether or not the user ever logs
// in again. This worker runs the all-users sweep on a fixed interval so expired
// items are destroyed close to their deadline with zero user interaction.
//
// It is deliberately tiny and dependency-free (just setInterval). One process
// runs it; it is idempotent and safe to call repeatedly.
//
// TODO(production): with multiple app instances behind a load balancer, move
// this to a single leader (advisory lock) or an external scheduler/cron/queue so
// the sweep runs exactly once per tick. The forget logic itself is already
// idempotent, so duplicate ticks are harmless — they would just do redundant work.
// ============================================================================

// Default cadence: once a minute. Tunable via FORGET_SWEEP_INTERVAL_MS; set to 0
// (or negative) to disable the worker entirely (used in tests/CI and any context
// that relies solely on the on-read sweep).
export const DEFAULT_SWEEP_INTERVAL_MS = 60_000;

export function sweepIntervalMs(): number {
  const raw = process.env.FORGET_SWEEP_INTERVAL_MS;
  if (raw === undefined || raw === "") return DEFAULT_SWEEP_INTERVAL_MS;
  const n = Number(raw);
  return Number.isFinite(n) ? n : DEFAULT_SWEEP_INTERVAL_MS;
}

// Module-level guard so we never start two timers in one process (Next.js can
// import this more than once across its runtimes / hot reloads).
let timer: NodeJS.Timeout | null = null;

export function isSchedulerRunning(): boolean {
  return timer !== null;
}

export function startForgetScheduler(): boolean {
  if (timer) return false; // already running
  const interval = sweepIntervalMs();
  if (interval <= 0) {
    // Explicitly disabled — rely on the on-read sweep only.
    console.log("[forget] scheduler disabled (FORGET_SWEEP_INTERVAL_MS<=0)");
    return false;
  }

  const tick = async () => {
    try {
      const n = await runForgetSweepAll();
      // Content-free: only a count, never anything about the items themselves.
      if (n > 0) console.log(`[forget] scheduled sweep forgot ${n} item(s)`);
    } catch (err) {
      // Never let a sweep failure crash the process; just note it and retry next tick.
      console.error("[forget] scheduled sweep failed:", err instanceof Error ? err.message : err);
    }
  };

  timer = setInterval(tick, interval);
  // Don't keep the event loop alive solely for the sweep (clean shutdown).
  if (typeof timer.unref === "function") timer.unref();
  console.log(`[forget] scheduler started (every ${interval}ms)`);
  // Kick once shortly after boot so a long-overdue item doesn't wait a full tick.
  void tick();
  return true;
}

export function stopForgetScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

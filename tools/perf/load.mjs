// Load test — sustained, realistic concurrency against the running app.
//
// Answers "does it hold steady under normal traffic?" Run against a started
// instance:  BASE_URL=http://127.0.0.1:3100 node tools/perf/load.mjs
// Non-functional / performance + load layer (see TESTING.md). Exits non-zero on
// any non-2xx/3xx response or if p99 latency blows past the budget.
import autocannon from "autocannon";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const DURATION = Number(process.env.PERF_DURATION ?? 20); // seconds
const CONNECTIONS = Number(process.env.PERF_CONNECTIONS ?? 50);
const P99_BUDGET_MS = Number(process.env.PERF_P99_BUDGET_MS ?? 800);

console.log(`[load] ${CONNECTIONS} connections for ${DURATION}s against ${BASE}`);

const result = await autocannon({
  url: BASE,
  connections: CONNECTIONS,
  duration: DURATION,
  // Mix the static landing page and the cheap health endpoint.
  requests: [{ path: "/" }, { path: "/api/health" }],
});

console.log(autocannon.printResult(result));

const non2xx = result.non2xx ?? 0;
const p99 = result.latency?.p99 ?? 0;
console.log(`[load] p99=${p99}ms  non-2xx=${non2xx}  req/s(avg)=${result.requests?.average}`);

let failed = false;
if (non2xx > 0) {
  console.error(`[load] FAIL: ${non2xx} non-2xx responses under load`);
  failed = true;
}
if (p99 > P99_BUDGET_MS) {
  console.error(`[load] FAIL: p99 ${p99}ms exceeds budget ${P99_BUDGET_MS}ms`);
  failed = true;
}
process.exit(failed ? 1 : 0);

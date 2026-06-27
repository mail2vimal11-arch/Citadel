// Stress test — push well beyond normal load to find the breaking point and
// confirm the app degrades gracefully (errors out / queues) rather than crashing.
//
//   BASE_URL=http://127.0.0.1:3100 node tools/perf/stress.mjs
//
// Non-functional / stress layer (see TESTING.md). This is exploratory: it REPORTS
// behaviour under overload and only fails if the server stopped responding
// entirely (all requests errored), which would indicate a hard crash rather than
// graceful degradation.
import autocannon from "autocannon";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const DURATION = Number(process.env.STRESS_DURATION ?? 30); // seconds
const CONNECTIONS = Number(process.env.STRESS_CONNECTIONS ?? 250); // deliberately high

console.log(`[stress] ${CONNECTIONS} connections for ${DURATION}s against ${BASE}`);

const result = await autocannon({
  url: BASE,
  connections: CONNECTIONS,
  duration: DURATION,
  pipelining: 4,
  requests: [{ path: "/" }, { path: "/api/health" }],
});

console.log(autocannon.printResult(result));

const ok = (result["2xx"] ?? 0) + (result["3xx"] ?? 0);
const errors = result.errors ?? 0;
const timeouts = result.timeouts ?? 0;
console.log(`[stress] 2xx/3xx=${ok}  errors=${errors}  timeouts=${timeouts}  p99=${result.latency?.p99}ms`);

if (ok === 0) {
  console.error("[stress] FAIL: server served zero successful responses — likely a hard failure under overload");
  process.exit(1);
}
console.log("[stress] server stayed responsive under overload (some shedding is expected)");
process.exit(0);

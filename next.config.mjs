import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable src/instrumentation.ts so the background forget scheduler starts
    // when the server boots (Next 14.2 gates this behind a flag; stable in 15+).
    instrumentationHook: true,
  },
  webpack: (config, { nextRuntime, webpack }) => {
    // instrumentation.ts is compiled for the Edge runtime too, and webpack walks
    // a dynamic import's module graph at build time — before the NEXT_RUNTIME
    // guard can dead-code it. The forget scheduler pulls in node:fs/node:crypto
    // (Prisma, KMS), which the Edge/client bundler rejects. It only ever runs on
    // the Node.js runtime, so for every other build swap it for a no-op stub so
    // the node-only graph is never bundled there.
    if (nextRuntime !== "nodejs") {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /forget[\\/]scheduler$/,
          path.resolve(__dirname, "src/lib/forget/scheduler.stub.ts")
        )
      );
    }
    return config;
  },
};

export default nextConfig;

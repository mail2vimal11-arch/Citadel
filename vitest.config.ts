import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests run in Node (the crypto/forget/parse logic is all server-side).
// The "@/..." alias mirrors tsconfig so tests import modules the same way the
// app does.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

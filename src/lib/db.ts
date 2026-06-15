import { PrismaClient } from "@prisma/client";

// Single shared Prisma client. The `globalThis` guard avoids creating a new
// connection on every hot-reload during development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log warnings/errors. We deliberately do NOT enable query logging,
    // which could otherwise capture ciphertext or parameters.
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

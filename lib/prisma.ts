import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function buildPrismaClient(): PrismaClient {
  const log: ("error" | "warn")[] =
    process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

  // Append connection pool params if not already present
  const rawUrl = process.env.DATABASE_URL ?? "";
  const url = rawUrl.includes("connection_limit")
    ? rawUrl
    : `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}connection_limit=10&pool_timeout=30`;

  return new PrismaClient({ log, datasources: { db: { url } } });
}

// Only instantiate Prisma if DATABASE_URL is defined
export const prisma: PrismaClient | null =
  process.env.DATABASE_URL
    ? (globalForPrisma.prisma ?? buildPrismaClient())
    : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}

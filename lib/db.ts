import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

let db: PrismaClient | null = null;

// Only initialize Prisma in Node.js runtime, not at edge
if (typeof window === "undefined" && hasDatabaseUrl) {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  db = global.prisma;
}

export { db };

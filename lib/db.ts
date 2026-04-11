import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export const db = hasDatabaseUrl
  ? global.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
  : null;

if (process.env.NODE_ENV !== "production" && db) {
  global.prisma = db;
}

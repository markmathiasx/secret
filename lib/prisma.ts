import { PrismaClient } from "@prisma/client";

declare global {
  var __mdhPrisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient();
}

// Lazy singleton — defers construction until first property access.
// This prevents PrismaClientInitializationError during `next build` when
// DATABASE_URL is a placeholder or not set in the build environment.
let _prismaInstance: PrismaClient | null = null;

function getPrismaInstance(): PrismaClient {
  if (!_prismaInstance) {
    _prismaInstance = global.__mdhPrisma ?? createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      global.__mdhPrisma = _prismaInstance;
    }
  }
  return _prismaInstance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_: PrismaClient, prop: string | symbol) {
    return (getPrismaInstance() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function isBuildTime() {
  const phase = `${process.env.NEXT_PHASE ?? ""} ${process.env.npm_lifecycle_event ?? ""}`;
  return /build/i.test(phase);
}

let dbHealthPromise: Promise<boolean> | null = null;

export async function canConnectToDatabase() {
  if (isBuildTime()) return false;
  if (!isDatabaseConfigured()) return false;

  if (!dbHealthPromise) {
    dbHealthPromise = prisma
      .$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        setTimeout(() => {
          dbHealthPromise = null;
        }, 10_000);
      });
  }

  return dbHealthPromise;
}

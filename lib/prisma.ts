import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __mdhPrisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient();
}

export const prisma = global.__mdhPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__mdhPrisma = prisma;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

let dbHealthPromise: Promise<boolean> | null = null;

export async function canConnectToDatabase() {
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

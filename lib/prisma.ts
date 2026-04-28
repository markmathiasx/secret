import { PrismaClient } from "@prisma/client";
import { getDatabaseUrlStatus } from "@/lib/env";

declare global {
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
  return getDatabaseUrlStatus().ok;
}

export function getDatabaseConfigurationStatus() {
  return getDatabaseUrlStatus();
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

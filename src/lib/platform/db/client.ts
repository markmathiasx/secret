import { prisma } from "@/lib/prisma";
import { assertRuntimeDatabasePolicy } from "@/src/lib/platform/db/runtime";

declare global {
  var __mdhPlatformDbClient: typeof prisma | undefined;
}

export function getPlatformDatabaseClient() {
  assertRuntimeDatabasePolicy();
  if (!global.__mdhPlatformDbClient) {
    global.__mdhPlatformDbClient = prisma;
  }
  return global.__mdhPlatformDbClient;
}

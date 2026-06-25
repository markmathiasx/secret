export const databaseMigrationsPolicy = {
  runtimeUsesDatabaseUrl: true,
  migrationUsesDirectUrl: true,
  directUrlAllowedInRequestRuntime: false,
  prismaPattern: "DATABASE_URL for pooled runtime, DIRECT_URL for CLI/migrations only.",
} as const;

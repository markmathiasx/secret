import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";

declare global {
  // eslint-disable-next-line no-var
  var __mdh_sql__: postgres.Sql | undefined;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada.");
  }

  if (!globalThis.__mdh_sql__) {
    globalThis.__mdh_sql__ = postgres(process.env.DATABASE_URL, {
      max: process.env.NODE_ENV === "production" ? 10 : 1,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false
    });
  }

  return globalThis.__mdh_sql__;
}

export function getDb() {
  return drizzle(getClient(), { schema });
}

export type Db = ReturnType<typeof getDb>;

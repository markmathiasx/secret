import pg from "pg";
import { readdir, readFile } from "node:fs/promises";
if (!process.env.DATABASE_URL)
  throw new Error("DATABASE_URL required; use an isolated reviewed database");
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
try {
  const directory = new URL("../migrations/", import.meta.url);
  const migrations = (await readdir(directory))
    .filter((name) => /^\d+_[a-z0-9_-]+\.sql$/i.test(name))
    .sort();
  for (const migration of migrations) {
    await db.query(await readFile(new URL(migration, directory), "utf8"));
    console.log(`applied ${migration}`);
  }
} finally {
  await db.end();
}

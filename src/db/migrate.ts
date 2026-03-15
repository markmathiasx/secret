import { migrate } from "drizzle-orm/postgres-js/migrator";
import { getDb } from "@/db/client";

async function main() {
  const db = getDb();
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations aplicadas com sucesso.");
}

main().catch((error) => {
  console.error("Falha ao aplicar migrations:", error);
  process.exit(1);
});

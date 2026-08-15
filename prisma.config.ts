import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const localDatabaseUrl = "postgresql://mdh3d:mdh3d@127.0.0.1:5432/mdh3d";

function unquoteEnvValue(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function loadEnvFile(fileName: string) {
  const filePath = path.join(projectRoot, fileName);
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (!process.env[key]) {
      process.env[key] = unquoteEnvValue(rawValue);
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

process.env.DATABASE_URL ||= localDatabaseUrl;
process.env.DIRECT_URL ||= process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
});

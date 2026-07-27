import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const cwd = process.cwd();
const prismaCli = path.join(cwd, "node_modules", "prisma", "build", "index.js");
const engineDir = path.join(cwd, "node_modules", "prisma", "node_modules", "@prisma", "engines");

function firstExisting(paths) {
  return paths.find((candidate) => fs.existsSync(candidate)) || null;
}

function loadEnvFallbacks() {
  for (const fileName of [".env.local", ".env", ".env.vercel.pull"]) {
    const filePath = path.join(cwd, fileName);
    if (!fs.existsSync(filePath)) continue;

    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*(DATABASE_URL|DIRECT_URL)\s*=\s*(.+?)\s*$/);
      if (!match) continue;

      const key = match[1];
      const value = match[2].replace(/^['"]|['"]$/g, "");
      if (!process.env[key] && !env[key]) {
        env[key] = value;
      }
    }
  }
}

function getSchemaEnginePath() {
  return firstExisting([
    path.join(engineDir, "schema-engine-windows.exe"),
    path.join(engineDir, "schema-engine-linux-musl"),
    path.join(engineDir, "schema-engine-linux"),
    path.join(engineDir, "schema-engine-darwin"),
    path.join(engineDir, "schema-engine-darwin-arm64"),
  ]);
}

function getQueryEnginePath() {
  return firstExisting([
    path.join(engineDir, "query_engine-windows.dll.node"),
    path.join(engineDir, "libquery_engine-linux-musl.so.node"),
    path.join(engineDir, "libquery_engine-linux.so.node"),
    path.join(engineDir, "libquery_engine-darwin.dylib.node"),
    path.join(engineDir, "libquery_engine-darwin-arm64.dylib.node"),
  ]);
}

if (!fs.existsSync(prismaCli)) {
  console.error("Prisma CLI local não encontrado em node_modules/prisma/build/index.js.");
  process.exit(1);
}

const env = {
  ...process.env,
  PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING || "1",
};

loadEnvFallbacks();
if (!env.DATABASE_URL) {
  env.DATABASE_URL = "postgresql://mdh3d:mdh3d@127.0.0.1:5432/mdh3d";
}
if (!env.DIRECT_URL && env.DATABASE_URL) {
  env.DIRECT_URL = env.DATABASE_URL;
}

const schemaEnginePath = getSchemaEnginePath();
if (schemaEnginePath && !env.PRISMA_SCHEMA_ENGINE_BINARY) {
  env.PRISMA_SCHEMA_ENGINE_BINARY = schemaEnginePath;
}

const queryEnginePath = getQueryEnginePath();
if (queryEnginePath && !env.PRISMA_QUERY_ENGINE_LIBRARY) {
  env.PRISMA_QUERY_ENGINE_LIBRARY = queryEnginePath;
}

const args = process.argv.slice(2);
const result = spawnSync(process.execPath, [prismaCli, ...args], {
  cwd,
  env,
  stdio: "inherit",
});

process.exit(result.status ?? 1);

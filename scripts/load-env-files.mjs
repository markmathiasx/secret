import fs from "node:fs";
import path from "node:path";

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const entries = {};
  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const normalized = line.startsWith("export ") ? line.slice(7).trim() : line;
    const match = normalized.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    entries[match[1]] = unquote(match[2]);
  }
  return entries;
}

export function loadEnvFiles(root = process.cwd()) {
  const candidates = [
    ".env",
    ".env.local",
    ".env.production.local",
    path.join(".vercel", ".env.production.local"),
  ];

  const loaded = {};
  for (const candidate of candidates) {
    Object.assign(loaded, parseEnvFile(path.join(root, candidate)));
  }

  for (const [key, value] of Object.entries(loaded)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }

  return loaded;
}

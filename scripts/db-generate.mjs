import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const result = spawnSync(process.execPath, ["scripts/prisma-local-cli.mjs", "generate"], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if (result.status === 0) {
  process.exit(0);
}

function normalizeSchema(source) {
  const lines = source
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => canonicalizeSchemaLine(line.trim().replace(/\s+/g, " ")))
    .filter(Boolean);

  return sortBlockAttributes(lines).join("\n");
}

function splitPrismaAttributes(line) {
  const attrs = [];
  let prefixEnd = line.indexOf("@");
  if (prefixEnd < 0) return { prefix: line, attrs };

  let prefix = line.slice(0, prefixEnd).trim();
  let index = prefixEnd;
  while (index < line.length) {
    if (line[index] !== "@") {
      prefix = `${prefix} ${line.slice(index).trim()}`.trim();
      break;
    }

    let depth = 0;
    let cursor = index;
    for (; cursor < line.length; cursor += 1) {
      const char = line[cursor];
      if (char === "(") depth += 1;
      if (char === ")") depth -= 1;
      if (cursor > index && depth === 0 && /\s/.test(char)) break;
    }
    attrs.push(line.slice(index, cursor).trim());
    index = cursor;
    while (line[index] === " ") index += 1;
  }

  return { prefix, attrs };
}

function canonicalizeSchemaLine(line) {
  if (!line || line.startsWith("//")) return line;
  const { prefix, attrs } = splitPrismaAttributes(line);
  if (!attrs.length) return prefix;
  return `${prefix} ${attrs.sort().join(" ")}`.trim();
}

function sortBlockAttributes(lines) {
  const output = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].startsWith("@@")) {
      output.push(lines[index]);
      continue;
    }

    const blockAttrs = [];
    while (index < lines.length && lines[index].startsWith("@@")) {
      blockAttrs.push(lines[index]);
      index += 1;
    }
    output.push(...blockAttrs.sort());
    index -= 1;
  }
  return output;
}

function generatedClientIsCurrent() {
  const root = process.cwd();
  const sourceSchema = path.join(root, "prisma", "schema.prisma");
  const generatedSchema = path.join(root, "node_modules", ".prisma", "client", "schema.prisma");
  const requiredArtifacts = [
    path.join(root, "node_modules", ".prisma", "client", "index.js"),
    path.join(root, "node_modules", ".prisma", "client", "default.js"),
    path.join(root, "node_modules", "@prisma", "client", "index.js"),
  ];

  if (!existsSync(sourceSchema) || !existsSync(generatedSchema)) return false;
  if (!requiredArtifacts.every((artifact) => existsSync(artifact))) return false;

  return normalizeSchema(readFileSync(sourceSchema, "utf8")) === normalizeSchema(readFileSync(generatedSchema, "utf8"));
}

const output = `${result.stdout || ""}\n${result.stderr || ""}`;
const blockedByLockedClient = /EPERM:\s+operation not permitted,\s+unlink[\s\S]*node_modules[\\/]\.prisma[\\/]client/i.test(output);

if (result.error && generatedClientIsCurrent()) {
  console.warn(`Prisma generate não pôde iniciar neste ambiente (${result.error.message}), mas o client existente está sincronizado com prisma/schema.prisma.`);
  process.exit(0);
}

if (!output.trim() && generatedClientIsCurrent()) {
  console.warn("Prisma generate terminou sem saída neste ambiente, mas o client existente está sincronizado com prisma/schema.prisma.");
  process.exit(0);
}

if (blockedByLockedClient && generatedClientIsCurrent()) {
  console.warn("Prisma generate não conseguiu substituir o client por EPERM, mas o client existente está sincronizado com prisma/schema.prisma.");
  process.exit(0);
}

process.exit(result.status ?? 1);

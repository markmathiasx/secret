import { spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { loadEnvFiles } from "./load-env-files.mjs";

const root = process.cwd();
loadEnvFiles(root);

const standaloneDir = join(root, ".next", "standalone");
const standaloneServer = join(standaloneDir, "server.js");
const staticSource = join(root, ".next", "static");
const staticTarget = join(standaloneDir, ".next", "static");
const publicSource = join(root, "public");
const publicTarget = join(standaloneDir, "public");
const prismaClientSource = join(root, "node_modules", ".prisma", "client");
const prismaClientTarget = join(standaloneDir, "node_modules", ".prisma", "client");

if (!existsSync(standaloneServer)) {
  console.error("Standalone build não encontrada. Rode `npm run build` antes de `npm run start`.");
  process.exit(1);
}

if (existsSync(staticSource)) {
  mkdirSync(dirname(staticTarget), { recursive: true });
  cpSync(staticSource, staticTarget, { recursive: true, force: true });
}

if (existsSync(publicSource)) {
  cpSync(publicSource, publicTarget, { recursive: true, force: true });
}

if (existsSync(prismaClientSource)) {
  mkdirSync(dirname(prismaClientTarget), { recursive: true });
  cpSync(prismaClientSource, prismaClientTarget, { recursive: true, force: true });
}

const child = spawn(process.execPath, [standaloneServer], {
  cwd: standaloneDir,
  stdio: "inherit",
  env: process.env,
});

function shutdown(signal) {
  if (!child.killed) {
    child.kill(signal);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

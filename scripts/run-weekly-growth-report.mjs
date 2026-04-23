#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const token = process.env.CRON_SECRET || "";
const requestUrl = new URL(`${baseUrl}/api/cron/weekly-growth`);

if (token) {
  requestUrl.searchParams.set("token", token);
}

const response = await fetch(requestUrl);
if (!response.ok) {
  const body = await response.text();
  console.error("Falha ao gerar dashboard semanal:", body);
  process.exit(1);
}

const payload = await response.json();
const outputPath = path.join(process.cwd(), "reports", "weekly-growth-dashboard.local.json");
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(payload.report, null, 2), "utf8");

console.log(`Dashboard semanal salvo em ${outputPath}`);

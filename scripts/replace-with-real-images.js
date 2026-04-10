#!/usr/bin/env tsx

import { replaceCatalogImages } from "../lib/server/catalog-image-replacement.ts";

function readArg(flag) {
  const index = process.argv.findIndex((value) => value === flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function main() {
  const manifestPath = readArg("--manifest");
  const sourceDir = readArg("--source-dir");
  const dryRun = process.argv.includes("--dry-run");

  const report = await replaceCatalogImages({
    manifestPath,
    sourceDir,
    dryRun,
  });

  const summary = [
    `Produtos do catálogo: ${report.totalProducts}`,
    `Prompts lidos: ${report.promptCatalogCount}`,
    `Produtos com fonte real detectada: ${report.sourceCandidates}`,
    `Produtos atualizados: ${report.replacedProducts}`,
    `Arquivos gerados/substituídos: ${report.replacedFiles}`,
    `Produtos sem fonte real local ainda: ${report.missingIds.length}`,
  ].join("\n");

  console.log(summary);

  if (report.replacedIds.length) {
    console.log(`\nAtualizados: ${report.replacedIds.join(", ")}`);
  }

  if (report.missingIds.length) {
    console.log(`\nPendentes: ${report.missingIds.slice(0, 40).join(", ")}${report.missingIds.length > 40 ? " ..." : ""}`);
  }
}

main().catch((error) => {
  console.error("Falha ao substituir imagens reais:", error);
  process.exitCode = 1;
});

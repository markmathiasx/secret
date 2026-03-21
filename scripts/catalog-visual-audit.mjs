import fs from "node:fs";
import path from "node:path";

const catalogPath = path.join(process.cwd(), "lib", "catalog.ts");
const reportJsonPath = path.join(process.cwd(), "CATALOG_VISUAL_AUDIT.json");
const reportMdPath = path.join(process.cwd(), "CATALOG_VISUAL_AUDIT.md");

const referenceMap = {
  "proj-103": {
    query: "3d printed foldable eyeglasses stand",
    expectedShape:
      "Suporte de mesa dobravel com base compacta e berco ou apoio inclinado para apoiar uma armacao de oculos sem tombar.",
    sourceUrls: [
      "https://makerworld.com/en/search/models?keyword=eyeglasses%20stand",
      "https://www.printables.com/search/models?q=eyeglasses%20stand",
    ],
  },
  "proj-104": {
    query: "3d printed xbox controller desk stand",
    expectedShape:
      "Suporte de mesa com berco curvo ou encaixe central para apoiar controle Xbox ou gamepad de formato similar em posicao estavel.",
    sourceUrls: [
      "https://makerworld.com/en/search/models?keyword=xbox%20controller%20stand",
      "https://www.printables.com/search/models?q=xbox%20controller%20stand",
    ],
  },
  "proj-107": {
    query: "3d printed desk cable organizer rail",
    expectedShape:
      "Trilho ou conjunto de clips impressos em 3D para guiar cabos na mesa, geralmente com canaletas ou encaixes repetidos.",
    sourceUrls: [
      "https://makerworld.com/en/search/models?keyword=cable%20organizer",
      "https://www.printables.com/search/models?q=desk%20cable%20organizer",
    ],
  },
  "proj-108": {
    query: "3d printed exoskeleton phone stand",
    expectedShape:
      "Suporte de celular com laterais estruturais em formato de exoesqueleto, apoiando um smartphone em angulo de mesa.",
    sourceUrls: [
      "https://makerworld.com/en/search/models?keyword=phone%20stand",
      "https://www.printables.com/search/models?q=exoskeleton%20phone%20stand",
    ],
  },
  "proj-109": {
    query: "3d printed watch and smartwatch stand",
    expectedShape:
      "Suporte vertical ou em arco para relogio e smartwatch, com area de apoio para pulseira e base limpa de mesa.",
    sourceUrls: [
      "https://makerworld.com/en/search/models?keyword=watch%20stand",
      "https://www.printables.com/search/models?q=smartwatch%20stand",
    ],
  },
  "geek-002": {
    query: "3d printed articulated owl figurine",
    expectedShape:
      "Coruja pequena com olhos grandes e corpo segmentado ou articulado, com leitura clara de miniatura impressa em 3D.",
    sourceUrls: [
      "https://makerworld.com/en/search/models?keyword=owl%20articulated",
      "https://www.printables.com/search/models?q=articulated%20owl",
    ],
  },
  "geek-003": {
    query: "3d printed european dragon mini figurine",
    expectedShape:
      "Dragao europeu compacto com asas abertas, corpo musculoso e leitura de miniatura fantasy.",
    sourceUrls: [
      "https://makerworld.com/en/search/models?keyword=european%20dragon",
      "https://www.printables.com/search/models?q=european%20dragon%20miniature",
    ],
  },
  "geek-004": {
    query: "3d printed articulated oriental dragon collectible",
    expectedShape:
      "Dragao oriental comprido com corpo segmentado e leitura serpentina, semelhante a dragao asiatico articulado.",
    sourceUrls: [
      "https://makerworld.com/en/search/models?keyword=articulated%20dragon",
      "https://www.printables.com/search/models?q=articulated%20oriental%20dragon",
    ],
  },
  "geek-013": {
    query: "3d printed sasuke chibi figurine",
    expectedShape:
      "Miniatura chibi de ninja anime com cabelo preto espetado, faixa na testa e espada nas costas.",
    sourceUrls: [
      "https://makerworld.com/en/search/models?keyword=sasuke",
      "https://www.printables.com/search/models?q=sasuke%20chibi",
    ],
  },
  "geek-016": {
    query: "3d printed shark mini figurine",
    expectedShape:
      "Mini tubarao simpatico, compacto, com corpo suave e leitura clara de mascote marinho impresso em 3D.",
    sourceUrls: [
      "https://makerworld.com/en/search/models?keyword=articulated%20shark",
      "https://www.printables.com/search/models?q=mini%20shark%203d%20print",
    ],
  },
};

function extractCreateProductObjects(source) {
  const items = [];
  const token = "createProduct({";
  let cursor = 0;

  while (true) {
    const tokenIndex = source.indexOf(token, cursor);
    if (tokenIndex === -1) break;

    const start = source.indexOf("{", tokenIndex);
    if (start === -1) break;

    let depth = 0;
    let quote = null;
    let escaped = false;
    let end = -1;

    for (let i = start; i < source.length; i += 1) {
      const char = source[i];

      if (quote) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === "\\") {
          escaped = true;
          continue;
        }
        if (char === quote) {
          quote = null;
        }
        continue;
      }

      if (char === "'" || char === '"' || char === "`") {
        quote = char;
        continue;
      }

      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;

      if (depth === 0) {
        end = i;
        break;
      }
    }

    if (end === -1) break;

    const objectLiteral = source.slice(start, end + 1);
    // The catalog is repository-controlled data, so evaluating the literal here is acceptable for audit generation.
    const parsed = Function(`return (${objectLiteral});`)();
    items.push(parsed);
    cursor = end + 1;
  }

  return items;
}

function extractCatalogSeedArrays(source) {
  const matches = [];
  const pattern = /const\s+([A-Za-z0-9_]+)\s*:\s*CatalogSeed\[\]\s*=\s*\[/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const arrayStart = source.indexOf("[", match.index + match[0].length - 1);
    if (arrayStart === -1) continue;

    let depth = 0;
    let quote = null;
    let escaped = false;
    let arrayEnd = -1;

    for (let i = arrayStart; i < source.length; i += 1) {
      const char = source[i];

      if (quote) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === "\\") {
          escaped = true;
          continue;
        }
        if (char === quote) {
          quote = null;
        }
        continue;
      }

      if (char === "'" || char === '"' || char === "`") {
        quote = char;
        continue;
      }

      if (char === "[") depth += 1;
      if (char === "]") depth -= 1;

      if (depth === 0) {
        arrayEnd = i;
        break;
      }
    }

    if (arrayEnd === -1) continue;
    matches.push(source.slice(arrayStart + 1, arrayEnd));
  }
  return matches;
}

function extractTopLevelObjects(block) {
  const items = [];
  let depth = 0;
  let quote = null;
  let escaped = false;
  let objectStart = -1;

  for (let i = 0; i < block.length; i += 1) {
    const char = block[i];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") {
      if (depth === 0) objectStart = i;
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0 && objectStart !== -1) {
        const objectLiteral = block.slice(objectStart, i + 1);
        const parsed = Function(`return (${objectLiteral});`)();
        items.push(parsed);
        objectStart = -1;
      }
    }
  }

  return items;
}

function toPublicFile(publicPath) {
  return path.join(process.cwd(), "public", publicPath.replace(/^\/+/, ""));
}

function fileState(publicPath) {
  const fsPath = toPublicFile(publicPath);
  return {
    publicPath,
    fsPath,
    exists: fs.existsSync(fsPath),
  };
}

function effectiveVisualKind(item) {
  if (item.visualKind) return item.visualKind;
  return String(item.id).startsWith("real-") ? "real_photo" : "concept_image";
}

function buildAuditEntry(item) {
  const visualKind = effectiveVisualKind(item);
  const imageFiles = [item.imageSrc, ...(item.gallery ?? [])].map(fileState);
  const missingFiles = imageFiles.filter((image) => !image.exists);
  const reference = referenceMap[item.id] ?? null;

  let status = "ok_real_photo";
  let recommendation = "Manter como ativo.";

  if (missingFiles.length > 0) {
    status = "missing_image_file";
    recommendation = "Repor arquivo fisico antes de publicar ou fazer deploy.";
  } else if (visualKind === "concept_image") {
    status = reference ? "concept_needs_real_curation" : "concept_needs_review";
    recommendation = reference
      ? "Validar forma do objeto com as referencias e substituir por foto real propria quando disponivel."
      : "Revisar o ativo e substituir por foto real propria ou render fiel ancorado em referencia tecnica.";
  }

  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    category: item.category ?? "",
    imageHint: item.imageHint ?? "",
    visualKind,
    status,
    recommendation,
    imageFiles,
    missingCount: missingFiles.length,
    referenceQuery: reference?.query ?? "",
    expectedShape: reference?.expectedShape ?? "",
    referenceUrls: reference?.sourceUrls ?? [],
  };
}

function buildMarkdown(summary, entries) {
  const lines = [];
  lines.push("# CATALOG_VISUAL_AUDIT");
  lines.push("");
  lines.push(`Gerado em: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Resumo");
  lines.push("");
  lines.push(`- Itens auditados: ${summary.total}`);
  lines.push(`- Fotos reais: ${summary.realPhoto}`);
  lines.push(`- Conceituais ou sem prova visual propria: ${summary.concept}`);
  lines.push(`- Arquivos faltando: ${summary.missingFiles}`);
  lines.push("");
  lines.push("## Itens que precisam de curadoria");
  lines.push("");

  const needsCuration = entries.filter((entry) => entry.status !== "ok_real_photo");
  if (needsCuration.length === 0) {
    lines.push("- Nenhum item pendente.");
  } else {
    for (const entry of needsCuration) {
      lines.push(`### ${entry.name} (${entry.id})`);
      lines.push(`- Status: ${entry.status}`);
      lines.push(`- SKU: ${entry.sku}`);
      lines.push(`- Visual atual: ${entry.visualKind}`);
      lines.push(`- Image hint: ${entry.imageHint || "n/a"}`);
      lines.push(`- Recomendacao: ${entry.recommendation}`);
      if (entry.expectedShape) {
        lines.push(`- Forma esperada: ${entry.expectedShape}`);
      }
      if (entry.referenceQuery) {
        lines.push(`- Query de validacao: ${entry.referenceQuery}`);
      }
      if (entry.referenceUrls.length > 0) {
        lines.push("- Fontes:");
        for (const url of entry.referenceUrls) {
          lines.push(`  - ${url}`);
        }
      }
      if (entry.missingCount > 0) {
        lines.push("- Arquivos faltando:");
        for (const image of entry.imageFiles.filter((image) => !image.exists)) {
          lines.push(`  - ${image.publicPath}`);
        }
      }
      lines.push("");
    }
  }

  lines.push("## Nota operacional");
  lines.push("");
  lines.push(
    "- A auditoria separa `foto real` de `imagem conceitual` e nao deve promover imagem de terceiro para a vitrine publica sem licenca ou autorizacao.",
  );
  lines.push(
    "- As referencias externas abaixo servem para validar a forma correta do objeto e orientar foto propria ou geracao ancorada no item real.",
  );
  lines.push("");

  return `${lines.join("\n")}\n`;
}

const source = fs.readFileSync(catalogPath, "utf8");
const directProducts = extractCreateProductObjects(source);
const seedProducts = extractCatalogSeedArrays(source).flatMap(extractTopLevelObjects);
const catalogItems = [...directProducts, ...seedProducts].filter(
  (item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index,
);
const auditEntries = catalogItems.map(buildAuditEntry);
const summary = {
  total: auditEntries.length,
  realPhoto: auditEntries.filter((entry) => entry.visualKind === "real_photo" && entry.status === "ok_real_photo").length,
  concept: auditEntries.filter((entry) => entry.visualKind === "concept_image").length,
  missingFiles: auditEntries.reduce((acc, entry) => acc + entry.missingCount, 0),
};

const payload = {
  generatedAt: new Date().toISOString(),
  summary,
  entries: auditEntries,
};

fs.writeFileSync(reportJsonPath, JSON.stringify(payload, null, 2), "utf8");
fs.writeFileSync(reportMdPath, buildMarkdown(summary, auditEntries), "utf8");

console.log(`Audit JSON: ${reportJsonPath}`);
console.log(`Audit MD: ${reportMdPath}`);
console.log(JSON.stringify(summary));

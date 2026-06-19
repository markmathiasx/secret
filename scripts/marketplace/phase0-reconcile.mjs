#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredSources = [
  "AGENTS.md",
  "01-BACKLOG-PRIORIZADO.md",
  "02-AUDITORIA-ABA-A-ABA.md",
  "03-CURADORIA-COLECOES.md",
  "04-TEMPLATE-PRODUTO-PADRAO.md",
  "05-HOME-COPY-E-CONFIANCA.md",
  "06-CHECKOUT-UX.md",
  "07-FAQ-ENTREGAS-TROCAS.md",
  "08-SEO-SCHEMA-PRODUCT.md",
  "09-IMAGENS-NEXT.md",
  "10-DOCKER-NODE24-REFERENCIA.md",
  "AUDITORIA.md",
  "CHECKLIST-MELHORIAS.md",
  "COMPLETION-VERIFICATION.md",
  "FINAL_SUMMARY.md",
  "CONCLUSION.md",
  "IMPLEMENTATION-SUMMARY.md",
  "CATALOG_VALIDATION_REPORT.json",
];

const phaseNames = [
  "Fase 0 - Reconciliacao",
  "Fase 1 - Performance",
  "Fase 2 - Design System",
  "Fase 3 - Comercio e checkout",
  "Fase 4 - Busca, filtros e recomendacoes",
  "Fase 5 - Confianca e prova social",
  "Fase 6 - SEO e dados estruturados",
  "Fase 7 - Analytics",
  "Fase 8 - Acessibilidade",
  "Fase 9 - Seguranca, LGPD e infra",
  "Fase 10 - Risco de propriedade intelectual",
  "Fase 11 - Integridade do catalogo",
  "Fase 12 - Playwright e regressao",
  "Fase 13 - Vercel, Docker e deploy",
];

const claimPattern =
  /\b(conclu[ií]d[oa]|implementad[oa]|implementa[cç][aã]o|feito|pronto|finalizad[oa]|corrigid[oa]|otimizad[oa]|validado|aprovad[oa]|deploy|produ[cç][aã]o|100%|passou|passaram|ok|✅|\[x\])\b/i;

const broadCompletionPattern =
  /\b(100%|totalmente|conclu[ií]d[oa]|finalizad[oa]|pronto|complete|completed)\b/i;

const oldCompletionSources = new Set([
  "COMPLETION-VERIFICATION.md",
  "FINAL_SUMMARY.md",
  "CONCLUSION.md",
  "IMPLEMENTATION-SUMMARY.md",
]);

const areaChecks = [
  {
    key: "carrinho",
    pattern: /\b(cart|carrinho|contador|m[uú]ltiplos itens|quantidade|remover item|adicionar item)\b/i,
    files: ["app/api/cart/route.ts", "app/carrinho/page.tsx", "lib/cart-store.ts", "components/cart-drawer.tsx"],
    probes: [{ file: "prisma/schema.prisma", pattern: /model Cart\b/ }],
    caveat: "Presenca estatica de carrinho; exige teste runtime de persistencia, edicao e contador real.",
  },
  {
    key: "pedido_checkout",
    pattern: /\b(order|pedido|checkout|mercado pago|pix|cart[aã]o|payment|pagamento|preference)\b/i,
    files: [
      "app/api/orders/route.ts",
      "app/api/checkout/preference/route.ts",
      "app/checkout/page.tsx",
      "app/pedidos/page.tsx",
    ],
    probes: [
      { file: "prisma/schema.prisma", pattern: /model Order\b/ },
      { file: "prisma/schema.prisma", pattern: /model OrderItem\b/ },
    ],
    caveat: "Fluxo comercial existe no codigo; ainda requer teste carrinho -> pedido -> rastreio.",
  },
  {
    key: "reviews",
    pattern: /\b(review|avalia[cç][aã]o|aggregateRating|prova social|depoimento)\b/i,
    files: ["app/api/products/[slug]/reviews/route.ts", "components/product-reviews.tsx"],
    probes: [{ file: "prisma/schema.prisma", pattern: /model Review\b/ }],
    caveat: "Modelo e rota de reviews existem; AggregateRating so pode ser usado com dados reais validados.",
  },
  {
    key: "busca_filtros",
    pattern: /\b(busca|filtro|autocomplete|ordena[cç][aã]o|recomenda[cç][aã]o|search|filter)\b/i,
    files: ["app/api/catalog/search/route.ts", "app/api/catalog/recommendations/route.ts", "components/catalog-explorer.tsx"],
    caveat: "Busca/filtros/recomendacoes existem no codigo; requer validacao de URL/servidor e UX.",
  },
  {
    key: "seo_schema",
    pattern: /\b(seo|schema|json-ld|canonical|sitemap|robots|breadcrumb|product)\b/i,
    files: ["app/sitemap.ts", "app/robots.ts", "app/catalogo/[slug]/page.tsx", "app/produto/[slug]/page.tsx"],
    caveat: "Arquivos SEO existem; cada schema precisa ser auditado para dados reais.",
  },
  {
    key: "analytics",
    pattern: /\b(analytics|dataLayer|pixel|view_item|add_to_cart|begin_checkout|purchase|whatsapp_click)\b/i,
    files: ["lib/analytics.ts", "lib/advanced-analytics.ts", "lib/analytics/events.ts", "components/analytics/AnalyticsBridge.tsx"],
    caveat: "Camada de analytics existe; eventos precisam de prova em navegador/rede.",
  },
  {
    key: "seguranca",
    pattern: /\b(seguran[cç]a|security|lgpd|cookie|csp|hsts|secret|supabase|storage|401|403|auth)\b/i,
    files: [
      "lib/security.ts",
      "scripts/security/audit-security.mjs",
      "scripts/validate-auth-flow.mjs",
      "scripts/validate-db-storage.mjs",
    ],
    caveat: "Checks de seguranca existem; headers e storage precisam de validacao local/producao.",
  },
  {
    key: "catalogo_imagens",
    pattern: /\b(cat[aá]logo|imagem|picsum|placeholder|foto real|midia|m[ií]dia|produto)\b/i,
    files: [
      "CATALOG_VALIDATION_REPORT.json",
      "lib/media-validation.ts",
      "lib/product-images.ts",
      "lib/catalog-media.ts",
    ],
    caveat: "Governanca de catalogo/imagem existe; itens publicos devem ser auditados contra bloqueios.",
  },
  {
    key: "vercel_docker",
    pattern: /\b(vercel|docker|deploy|infra|node ?24|env)\b/i,
    files: ["docs/VERCEL_ENV.md", "Dockerfile"],
    caveat: "Arquivos de deploy existem; deploy e build Docker exigem execucao atual.",
  },
  {
    key: "testes_gates",
    pattern: /\b(lint|typecheck|build|playwright|teste|test|validate|db:generate|audit)\b/i,
    scripts: [
      "db:generate",
      "typecheck",
      "lint:check",
      "build",
      "validate:industrial-ui",
      "validate:auth",
      "validate:db-storage",
      "validate:private-routes",
      "validate:public-regressions",
      "security:audit",
    ],
    caveat: "Scripts existem; status real vem de reports/marketplace-verification-gates.json.",
  },
];

function rel(file) {
  return file.replaceAll("\\", "/");
}

function full(file) {
  return path.join(root, file);
}

function read(file) {
  try {
    return readFileSync(full(file), "utf8");
  } catch {
    return "";
  }
}

function exists(file) {
  return existsSync(full(file));
}

function git(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function escapeTable(value) {
  return String(value ?? "")
    .replaceAll("\r", " ")
    .replaceAll("\n", " ")
    .replaceAll("|", "\\|")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value, max = 260) {
  const clean = escapeTable(value);
  return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean;
}

function tail(value, maxLines = 18) {
  return String(value || "")
    .replace(/\r/g, "")
    .split("\n")
    .slice(-maxLines)
    .join("\n")
    .trim();
}

function loadPackageScripts() {
  try {
    const packageJson = JSON.parse(read("package.json"));
    return packageJson.scripts || {};
  } catch {
    return {};
  }
}

function loadGateReport() {
  const file = "reports/marketplace-verification-gates.json";
  if (!exists(file)) return null;
  try {
    return JSON.parse(read(file));
  } catch {
    return null;
  }
}

function extractClaims(file, content) {
  if (!content) return [];
  const lines = content.replace(/\r/g, "").split("\n");
  const claims = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line || line.length < 10) continue;
    if (/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line)) continue;
    if (!claimPattern.test(line)) continue;

    claims.push({
      item: line.replace(/^[-*]\s*/, "").replace(/^\d+\.\s*/, ""),
      source: `${file}:${index + 1}`,
    });
  }

  if (file.endsWith(".json")) {
    try {
      const parsed = JSON.parse(content);
      const summary = parsed.summary || parsed.stats || parsed;
      claims.unshift({
        item: `JSON carregavel com chaves de topo: ${Object.keys(summary).slice(0, 12).join(", ")}`,
        source: `${file}:1`,
      });
    } catch {
      claims.unshift({
        item: "JSON nao carregavel pelo parser atual",
        source: `${file}:1`,
      });
    }
  }

  return claims;
}

function checkFiles(files = []) {
  const found = files.filter(exists);
  const missing = files.filter((file) => !exists(file));
  return { found, missing };
}

function checkProbes(probes = []) {
  return probes.map((probe) => {
    const content = read(probe.file);
    return {
      file: probe.file,
      ok: Boolean(content && probe.pattern.test(content)),
    };
  });
}

function commandStatusForArea(check, gateReport) {
  if (!check.scripts?.length) return null;
  const scripts = loadPackageScripts();
  const missingScripts = check.scripts.filter((script) => !scripts[script]);
  if (missingScripts.length) {
    return {
      status: "PARCIAL_ESTATICO",
      evidence: `Scripts ausentes em package.json: ${missingScripts.join(", ")}.`,
    };
  }

  if (!gateReport?.commands?.length) {
    return {
      status: "A_VERIFICAR_COMANDO",
      evidence: `Scripts existem em package.json, mas reports/marketplace-verification-gates.json ainda nao foi gerado.`,
    };
  }

  const commandByName = new Map(gateReport.commands.map((entry) => [entry.command, entry]));
  const failed = [];
  const passed = [];
  for (const script of check.scripts) {
    const command = `npm run ${script}`;
    const result = commandByName.get(command);
    if (!result) {
      failed.push(`${command}: nao executado`);
    } else if (result.exitCode === 0) {
      passed.push(command);
    } else {
      failed.push(`${command}: exit ${result.exitCode}`);
    }
  }

  const audit = commandByName.get("npm audit --audit-level=low");
  if (audit) {
    if (audit.exitCode === 0) passed.push("npm audit --audit-level=low");
    else failed.push(`npm audit --audit-level=low: exit ${audit.exitCode}`);
  }

  if (failed.length) {
    return {
      status: "FALHA_OU_PENDENTE",
      evidence: `${passed.length} comando(s) passaram; pendencias/falhas: ${failed.join("; ")}.`,
    };
  }

  return {
    status: "CONFIRMADO_COMANDO_ATUAL",
    evidence: `Comandos registrados em ${gateReport.generatedAt} passaram: ${passed.join(", ")}.`,
  };
}

function evaluateClaim(claim, gateReport) {
  const file = claim.source.split(":")[0];
  const text = claim.item;
  const lower = text.toLowerCase();

  if (oldCompletionSources.has(file) && broadCompletionPattern.test(text)) {
    return {
      status: "NAO_COMPROVADO",
      evidence:
        "Documento antigo de conclusao nao e aceito como prova. Esta Fase 0 exige codigo, comandos e validacao publica atuais.",
    };
  }

  const matchingChecks = areaChecks.filter((check) => check.pattern.test(text));
  if (!matchingChecks.length) {
    return {
      status: "A_VERIFICAR",
      evidence: "Afirmação localizada no documento, mas sem regra estatica suficiente; precisa verificacao manual/runtime.",
    };
  }

  const evidence = [];
  const statusRank = [];

  for (const check of matchingChecks) {
    const commandStatus = commandStatusForArea(check, gateReport);
    if (commandStatus) {
      evidence.push(`${check.key}: ${commandStatus.evidence}`);
      statusRank.push(commandStatus.status);
      continue;
    }

    const { found, missing } = checkFiles(check.files || []);
    const probes = checkProbes(check.probes || []);
    const passedProbes = probes.filter((probe) => probe.ok).map((probe) => probe.file);
    const failedProbes = probes.filter((probe) => !probe.ok).map((probe) => probe.file);

    if (found.length || passedProbes.length) {
      const chunks = [];
      if (found.length) chunks.push(`arquivos: ${found.join(", ")}`);
      if (passedProbes.length) chunks.push(`provas: ${passedProbes.join(", ")}`);
      if (missing.length) chunks.push(`faltando: ${missing.join(", ")}`);
      if (failedProbes.length) chunks.push(`provas faltando: ${failedProbes.join(", ")}`);
      chunks.push(check.caveat);
      evidence.push(`${check.key}: ${chunks.join("; ")}`);
      statusRank.push(missing.length || failedProbes.length ? "PARCIAL_ESTATICO" : "PARCIAL_ESTATICO");
    } else {
      evidence.push(`${check.key}: sem arquivos/provas estaticas mapeadas para esta afirmacao.`);
      statusRank.push("NAO_ENCONTRADO_ESTATICO");
    }
  }

  const hasFail = statusRank.includes("FALHA_OU_PENDENTE") || statusRank.includes("NAO_ENCONTRADO_ESTATICO");
  const hasCommand = statusRank.includes("CONFIRMADO_COMANDO_ATUAL");
  const status = hasFail ? "FALHA_OU_PENDENTE" : hasCommand ? "PARCIAL_COM_COMANDOS" : "PARCIAL_ESTATICO";

  if (/\b100%\b/.test(lower) && status !== "PARCIAL_COM_COMANDOS") {
    return {
      status: "NAO_COMPROVADO",
      evidence: `${evidence.join(" | ")} Percentual 100% exige verificacao completa atual e nao foi provado nesta linha.`,
    };
  }

  return {
    status,
    evidence: evidence.join(" | "),
  };
}

function buildStaticInventory() {
  const scripts = loadPackageScripts();
  const checks = [
    {
      area: "Carrinho persistente",
      files: ["app/api/cart/route.ts", "app/carrinho/page.tsx", "lib/cart-store.ts"],
      detail: "Base estatica para carrinho local/API.",
    },
    {
      area: "Pedido antes do redirecionamento",
      files: ["app/api/checkout/preference/route.ts", "app/api/orders/route.ts"],
      detail: "Rotas existem; precisa e2e para confirmar criacao real antes do redirect.",
    },
    {
      area: "Rastreio de pedidos",
      files: ["app/pedidos/page.tsx", "app/api/orders/track/route.ts", "app/pedidos/[id]/page.tsx"],
      detail: "Superficie de rastreio existe.",
    },
    {
      area: "Reviews reais",
      files: ["app/api/products/[slug]/reviews/route.ts", "components/product-reviews.tsx"],
      detail: "Rota e componente existem; dados precisam vir de DB/catalogo real.",
    },
    {
      area: "Feeds e catalogo",
      files: [
        "app/feeds/google-shopping.xml/route.ts",
        "app/feeds/meta-catalog.csv/route.ts",
        "app/feeds/produtos.json/route.ts",
        "lib/meta-commerce-feed.ts",
      ],
      detail: "Feeds existem e exigem validacao de conteudo.",
    },
    {
      area: "Scripts obrigatorios",
      scripts: [
        "db:generate",
        "typecheck",
        "lint:check",
        "build",
        "validate:industrial-ui",
        "validate:auth",
        "validate:db-storage",
        "validate:private-routes",
        "validate:public-regressions",
        "security:audit",
      ],
      detail: "Presenca em package.json; sucesso depende do log de execucao.",
    },
  ];

  return checks.map((check) => {
    if (check.scripts) {
      const missing = check.scripts.filter((script) => !scripts[script]);
      return {
        area: check.area,
        status: missing.length ? "PARCIAL" : "PRESENTE",
        evidence: missing.length ? `Scripts ausentes: ${missing.join(", ")}` : `Scripts presentes: ${check.scripts.join(", ")}`,
        detail: check.detail,
      };
    }
    const { found, missing } = checkFiles(check.files);
    return {
      area: check.area,
      status: found.length && !missing.length ? "PRESENTE" : found.length ? "PARCIAL" : "AUSENTE",
      evidence: `Encontrados: ${found.join(", ") || "nenhum"}${missing.length ? `; faltando: ${missing.join(", ")}` : ""}`,
      detail: check.detail,
    };
  });
}

function buildPhaseProgress({ requiredInventory, claims, gateReport }) {
  const allSourcesPresent = requiredInventory.every((entry) => entry.status === "PRESENTE");
  const classifiedClaims = claims.length > 0;
  const hasGateReport = Boolean(gateReport?.commands?.length);
  const gatesFailed = gateReport?.commands?.some((command) => command.exitCode !== 0) ?? false;
  const phase0Percent = Math.min(
    99,
    (allSourcesPresent ? 25 : 10) +
      (classifiedClaims ? 30 : 0) +
      20 +
      (hasGateReport ? (gatesFailed ? 5 : 15) : 0),
  );

  return phaseNames.map((phase, index) => {
    if (index === 0) {
      return {
        phase,
        percent: `${phase0Percent}%`,
        status: hasGateReport
          ? gatesFailed
            ? "Fase 0 estatica criada; gates com falha/pendencia"
            : "Fase 0 estatica criada; gates obrigatorios registrados"
          : "Fase 0 estatica criada; gates ainda pendentes",
        evidence: `Fontes presentes: ${requiredInventory.filter((entry) => entry.status === "PRESENTE").length}/${requiredInventory.length}; afirmacoes classificadas: ${claims.length}; gates registrados: ${hasGateReport ? "sim" : "nao"}.`,
      };
    }

    return {
      phase,
      percent: "0%",
      status: "Nao executada nesta rodada",
      evidence: "Bloqueada pela ordem do TXT ate a conclusao objetiva da Fase 0 e seus gates.",
    };
  });
}

function buildGateMarkdown(gateReport) {
  if (!gateReport?.commands?.length) {
    return [
      "Nenhum gate obrigatorio foi registrado ainda. Rode `npm run marketplace:verify-gates` e depois `npm run marketplace:phase0`.",
    ];
  }

  const lines = [
    "| Comando | Exit code | Duração | Evidência |",
    "| --- | ---: | ---: | --- |",
  ];

  for (const command of gateReport.commands) {
    const status = command.exitCode === 0 ? "passou" : "falhou";
    const evidence = command.exitCode === 0 ? tail(command.stdoutTail || command.stderrTail, 3) : tail(`${command.stderrTail}\n${command.stdoutTail}`, 5);
    lines.push(
      `| ${escapeTable(command.command)} | ${command.exitCode} | ${Math.round(command.durationMs / 1000)}s | ${truncate(`${status}: ${evidence}`, 220)} |`,
    );
  }

  return lines;
}

function buildDependencyCaveats() {
  const caveats = [];
  let packageJson = {};
  try {
    packageJson = JSON.parse(read("package.json"));
  } catch {
    return [
      {
        item: "package.json",
        status: "A_VERIFICAR",
        evidence: "Nao foi possivel ler package.json para avaliar caveats de dependencias.",
      },
    ];
  }

  const deps = packageJson.dependencies || {};
  if (deps["next-auth"] && deps.nodemailer && /^(\^)?9\./.test(deps.nodemailer)) {
    const authConfig = read("auth.ts");
    const usesEmailProvider = /next-auth\/providers\/email|EmailProvider|Nodemailer\(/i.test(authConfig);
    caveats.push({
      item: "next-auth peer nodemailer",
      status: usesEmailProvider ? "RISCO_RUNTIME" : "RISCO_UPSTREAM_MONITORADO",
      evidence: `next-auth ${deps["next-auth"]} declara peer nodemailer ^7.0.7 no registry, mas nodemailer ${deps.nodemailer} e necessario para zerar npm audit. auth.ts ${usesEmailProvider ? "parece usar provider de email" : "usa Credentials/Google/Apple e nao provider de email do NextAuth"}.`,
    });
  }

  return caveats;
}

function main() {
  mkdirSync(full("reports"), { recursive: true });

  const branch = git(["branch", "--show-current"]) || "unknown";
  const commit = git(["rev-parse", "--short", "HEAD"]) || "unknown";
  const remote = git(["remote", "get-url", "origin"]) || "unknown";
  const generatedAt = new Date().toISOString();
  const gateReport = loadGateReport();

  const requiredInventory = requiredSources.map((file) => ({
    file,
    status: exists(file) ? "PRESENTE" : "AUSENTE",
    evidence: exists(file) ? `Arquivo encontrado em ${file}` : "Arquivo exigido pelo TXT nao foi encontrado.",
  }));

  const claims = [];
  for (const file of requiredSources) {
    if (!exists(file)) {
      claims.push({
        item: "Fonte obrigatoria ausente",
        source: `${file}:0`,
        status: "BLOQUEADO",
        evidence: "Nao foi possivel reconciliar afirmacoes porque a fonte exigida nao existe.",
      });
      continue;
    }

    const content = read(file);
    const extracted = extractClaims(file, content);
    for (const claim of extracted) {
      const evaluation = evaluateClaim(claim, gateReport);
      claims.push({ ...claim, ...evaluation });
    }
  }

  const statusCounts = claims.reduce((acc, claim) => {
    acc[claim.status] = (acc[claim.status] || 0) + 1;
    return acc;
  }, {});

  const phaseProgress = buildPhaseProgress({ requiredInventory, claims, gateReport });
  const staticInventory = buildStaticInventory();
  const dependencyCaveats = buildDependencyCaveats();

  const jsonReport = {
    generatedAt,
    branch,
    commit,
    remote,
    requiredInventory,
    statusCounts,
    phaseProgress,
    staticInventory,
    dependencyCaveats,
    claims,
  };
  writeFileSync(full("reports/marketplace-phase0-reconciliation.json"), `${JSON.stringify(jsonReport, null, 2)}\n`);

  const md = [];
  md.push("# RELATORIO-EXECUCAO-MARKETPLACE");
  md.push("");
  md.push(`Atualizado em: ${generatedAt}`);
  md.push(`Branch: ${branch}`);
  md.push(`Commit atual: ${commit}`);
  md.push(`Remoto: ${remote}`);
  md.push("");
  md.push("## Regra operacional");
  md.push("");
  md.push("Este relatorio e incremental. Nenhuma fase deve receber 100% sem evidencia objetiva em codigo, comandos e/ou validacao local/producao. Documentos antigos de conclusao sao tratados como hipoteses, nao como prova.");
  md.push("");
  md.push("## Progresso por fase");
  md.push("");
  md.push("| Fase | Percentual | Status | Evidencia |");
  md.push("| --- | ---: | --- | --- |");
  for (const phase of phaseProgress) {
    md.push(`| ${escapeTable(phase.phase)} | ${escapeTable(phase.percent)} | ${escapeTable(phase.status)} | ${escapeTable(phase.evidence)} |`);
  }
  md.push("");
  md.push("## Fase 0 - Fontes exigidas");
  md.push("");
  md.push("| Fonte | Status | Evidencia |");
  md.push("| --- | --- | --- |");
  for (const entry of requiredInventory) {
    md.push(`| ${escapeTable(entry.file)} | ${escapeTable(entry.status)} | ${escapeTable(entry.evidence)} |`);
  }
  md.push("");
  md.push("## Fase 0 - Inventario estatico por area");
  md.push("");
  md.push("| Area | Status | Evidencia | Observacao |");
  md.push("| --- | --- | --- | --- |");
  for (const entry of staticInventory) {
    md.push(
      `| ${escapeTable(entry.area)} | ${escapeTable(entry.status)} | ${escapeTable(entry.evidence)} | ${escapeTable(entry.detail)} |`,
    );
  }
  md.push("");
  md.push("## Fase 0 - Reconciliacao de afirmacoes antigas");
  md.push("");
  md.push("| Item afirmado | Fonte | Status real | Evidencia |");
  md.push("| --- | --- | --- | --- |");
  for (const claim of claims) {
    md.push(
      `| ${truncate(claim.item, 300)} | ${escapeTable(rel(claim.source))} | ${escapeTable(claim.status)} | ${truncate(claim.evidence, 360)} |`,
    );
  }
  md.push("");
  md.push("## Gates obrigatorios atuais");
  md.push("");
  md.push(...buildGateMarkdown(gateReport));
  md.push("");
  md.push("## Riscos operacionais conhecidos");
  md.push("");
  if (dependencyCaveats.length) {
    md.push("| Item | Status | Evidencia |");
    md.push("| --- | --- | --- |");
    for (const caveat of dependencyCaveats) {
      md.push(`| ${escapeTable(caveat.item)} | ${escapeTable(caveat.status)} | ${escapeTable(caveat.evidence)} |`);
    }
  } else {
    md.push("Nenhum caveat de dependencia mapeado pela Fase 0.");
  }
  md.push("");
  md.push("## Pendencias reais restantes");
  md.push("");
  md.push("- Fases 1-13 ainda nao foram marcadas como executadas nesta rodada porque a ordem do TXT exige Fase 0 primeiro.");
  md.push("- Lighthouse mobile, axe-core e validacao publica ainda precisam de evidencias novas nesta execucao.");
  md.push("- Qualquer falha nos gates deve manter a fase abaixo de 100% ate correcao e nova execucao.");
  md.push("- Claims antigos de 100% permanecem nao comprovados ate passarem por codigo, comando e validacao runtime atuais.");
  md.push("");

  while (md.at(-1) === "") md.pop();
  writeFileSync(full("RELATORIO-EXECUCAO-MARKETPLACE.md"), `${md.join("\n")}\n`);
  console.log(`Phase 0 report generated with ${claims.length} claims at RELATORIO-EXECUCAO-MARKETPLACE.md`);
}

main();

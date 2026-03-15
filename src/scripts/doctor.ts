import postgres from "postgres";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

type CheckStatus = "ok" | "warn" | "fail";

type CheckResult = {
  label: string;
  status: CheckStatus;
  detail: string;
};

function parseDatabaseUrl() {
  const raw = process.env.DATABASE_URL || "";

  if (!raw) {
    return { raw, valid: false as const, reason: "DATABASE_URL ausente." };
  }

  try {
    const parsed = new URL(raw);
    return { raw, valid: true as const, parsed };
  } catch {
    return { raw, valid: false as const, reason: "DATABASE_URL inválida." };
  }
}

function getProjectRef(hostname: string) {
  return hostname.split(".")[1] || "";
}

function summarizeResult(result: CheckResult) {
  const prefix = result.status === "ok" ? "[ok]" : result.status === "warn" ? "[warn]" : "[fail]";
  console.log(`${prefix} ${result.label}: ${result.detail}`);
}

async function checkDatabaseConnection(): Promise<CheckResult> {
  const database = parseDatabaseUrl();

  if (!database.valid) {
    return {
      label: "Banco",
      status: "fail",
      detail: database.reason
    };
  }

  const host = database.parsed.hostname;
  const looksLikeDirectSupabaseHost = /^db\.[a-z0-9]+\.(supabase\.co|supabase\.in)$/i.test(host);
  const projectRef = getProjectRef(host);

  const sql = postgres(database.raw, {
    prepare: false,
    max: 1,
    idle_timeout: 5,
    connect_timeout: 8
  });

  try {
    const [row] = await sql<{ now: string }[]>`select now()::text as now`;
    return {
      label: "Banco",
      status: looksLikeDirectSupabaseHost ? "warn" : "ok",
      detail: looksLikeDirectSupabaseHost
        ? `Conexão funcionou em ${host}, mas esse host direto do Supabase pode falhar localmente sem IPv6. Prefira Session pooler IPv4 para estabilidade.${projectRef ? ` O usuario geralmente segue o padrao postgres.${projectRef}.` : ""}`
        : `Conexão OK em ${host}. Resposta em ${row.now}.`
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      label: "Banco",
      status: "fail",
      detail: looksLikeDirectSupabaseHost
        ? `Falha ao conectar em ${host}. Use a connection string Session pooler IPv4 do Supabase em Connect > Session pooler.${projectRef ? ` O usuario costuma ser postgres.${projectRef}.` : ""} Erro: ${message}`
        : `Falha ao conectar em ${host}. Erro: ${message}`
    };
  } finally {
    await sql.end({ timeout: 1 }).catch(() => {});
  }
}

function checkRequiredEnv(): CheckResult[] {
  const required = ["DATABASE_URL", "ADMIN_EMAIL", "ADMIN_PASSWORD_HASH", "ADMIN_SESSION_SECRET", "PIX_KEY"];
  const recommended = ["CUSTOMER_SESSION_SECRET", "FIELD_ENCRYPTION_KEY"];
  const optional = ["MERCADOPAGO_ACCESS_TOKEN", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

  const results: CheckResult[] = required.map((key) => ({
    label: `Env ${key}`,
    status: process.env[key] ? "ok" : "fail",
    detail: process.env[key] ? "presente" : "ausente"
  }));

  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || "";
  if (adminPasswordHash && !adminPasswordHash.startsWith("$2")) {
    results.push({
      label: "Hash admin",
      status: adminPasswordHash.startsWith("s2:") ? "warn" : "fail",
      detail: adminPasswordHash.startsWith("s2:")
        ? "formato legado detectado; o runtime aceita transitoriamente, mas o ideal e regenerar bcrypt com npm run admin:hash -- <senha>"
        : "formato nao reconhecido; regenere com npm run admin:hash -- <senha>"
    });
  }

  for (const key of recommended) {
    results.push({
      label: `Env ${key}`,
      status: process.env[key] ? "ok" : "warn",
      detail: process.env[key]
        ? "presente"
        : key === "FIELD_ENCRYPTION_KEY"
          ? "ausente; o runtime pode derivar fallback, mas para producao enterprise configure uma chave dedicada"
          : "ausente; o runtime pode derivar fallback, mas em deploy o recomendado e configurar explicitamente"
    });
  }

  for (const key of optional) {
    results.push({
      label: `Env ${key}`,
      status: process.env[key] ? "ok" : "warn",
      detail: process.env[key]
        ? "presente"
        : key === "MERCADOPAGO_ACCESS_TOKEN"
          ? "ausente; checkout segue com Pix/WhatsApp e cartao fica desativado"
          : "ausente; recurso opcional de conta publica nao sera exibido"
    });
  }

  return results;
}

function checkCatalogImages(): CheckResult {
  const catalogDir = resolve(process.cwd(), "public", "catalog-assets");
  const curatedCandidates = [
    "mdh-hello-kitty-organizer-desk.webp",
    "mdh-suporte-controle-duplo-desk.webp",
    "mdh-dragao-articulado-premium-plus.webp",
    "mdh-nome-3d-signature-collector.webp"
  ];
  const present = curatedCandidates.filter((file) => existsSync(resolve(catalogDir, file)));

  return {
    label: "Imagens do catalogo",
    status: present.length === curatedCandidates.length ? "ok" : present.length ? "warn" : "fail",
    detail:
      present.length === curatedCandidates.length
        ? "Arquivos locais principais encontrados em public/catalog-assets."
        : present.length
          ? "Parte das imagens locais existe, mas vale rodar npm run catalog:images antes do deploy."
          : "Nenhuma imagem local principal encontrada. Rode npm run catalog:images."
  };
}

async function main() {
  const checks = [...checkRequiredEnv(), checkCatalogImages()];
  const databaseCheck = await checkDatabaseConnection();
  const allChecks = [...checks, databaseCheck];

  console.log("MDH 3D doctor\n");
  allChecks.forEach(summarizeResult);

  const hasFailure = allChecks.some((item) => item.status === "fail");
  process.exitCode = hasFailure ? 1 : 0;
}

main().catch((error) => {
  console.error("[fail] Doctor:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});

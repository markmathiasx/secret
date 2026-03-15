function getDatabaseHost() {
  try {
    return process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : "";
  } catch {
    return "";
  }
}

function getDatabaseProjectRef() {
  const host = getDatabaseHost();
  const [, projectRef] = host.split(".");
  return projectRef || "";
}

export function isDirectSupabaseDatabaseHost() {
  const host = getDatabaseHost();
  return /^db\.[a-z0-9]+\.(supabase\.co|supabase\.in)$/i.test(host);
}

export function getDatabaseUnavailableMessage() {
  if (isDirectSupabaseDatabaseHost()) {
    const projectRef = getDatabaseProjectRef();
    return `Banco de dados indisponível no momento. A DATABASE_URL atual usa o host direto do Supabase, que pode depender de IPv6. Troque pela connection string Session pooler IPv4 em Connect > Session pooler antes de operar pedidos reais e painel.${projectRef ? ` No Supabase, o usuario costuma seguir o padrao postgres.${projectRef}.` : ""}`;
  }

  return "Banco de dados indisponível no momento. Revise a DATABASE_URL do Postgres/Supabase antes de operar pedidos reais e painel.";
}

export const databaseUnavailableMessage = getDatabaseUnavailableMessage();

export function isDatabaseRuntimeError(error: unknown) {
  const text =
    error instanceof Error
      ? `${error.name} ${error.message}`.toLowerCase()
      : String(error).toLowerCase();

  return [
    "database_url",
    "drizzlequeryerror",
    "failed query",
    "getaddrinfo",
    "tenant or user not found",
    "econnrefused",
    "connect_timeout",
    "connection terminated"
  ].some((fragment) => text.includes(fragment));
}

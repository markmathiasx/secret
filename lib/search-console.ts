import { createSign } from "crypto";

type SearchConsoleRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type SearchConsoleResponse = {
  rows?: SearchConsoleRow[];
};

function getSearchConsoleEnv() {
  return {
    clientEmail: (
      process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL ||
      process.env.GSC_CLIENT_EMAIL ||
      ""
    ).trim(),
    privateKey: (
      process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY ||
      process.env.GSC_PRIVATE_KEY ||
      ""
    )
      .replace(/\\n/g, "\n")
      .trim(),
    siteUrl: (
      process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ||
      process.env.GSC_SITE_URL ||
      ""
    ).trim(),
  };
}

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function buildServiceAccountJwt(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  );
  const unsigned = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256").update(unsigned).end().sign(privateKey, "base64url");
  return `${unsigned}.${signature}`;
}

async function getSearchConsoleAccessToken() {
  const { clientEmail, privateKey } = getSearchConsoleEnv();
  const assertion = buildServiceAccountJwt(clientEmail, privateKey);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao autenticar no Google Search Console: ${body}`);
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) {
    throw new Error("Token do Google Search Console ausente.");
  }

  return payload.access_token;
}

async function querySearchConsole<T extends SearchConsoleResponse>(
  token: string,
  body: Record<string, unknown>
) {
  const { siteUrl } = getSearchConsoleEnv();
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao consultar Search Console: ${text}`);
  }

  return (await response.json()) as T;
}

export function isSearchConsoleConfigured() {
  const { clientEmail, privateKey, siteUrl } = getSearchConsoleEnv();
  return Boolean(clientEmail && privateKey && siteUrl);
}

export async function getWeeklySearchConsoleSnapshot(input?: { startDate?: string; endDate?: string }) {
  if (!isSearchConsoleConfigured()) {
    return {
      configured: false,
      available: false,
      note: "Configure GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL, GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY e GOOGLE_SEARCH_CONSOLE_SITE_URL para habilitar Search Console.",
      clicks: 0,
      impressions: 0,
      ctr: 0,
      avgPosition: 0,
      topQueries: [] as Array<{ label: string; clicks: number; impressions: number; ctr: number; position: number }>,
      topPages: [] as Array<{ label: string; clicks: number; impressions: number; ctr: number; position: number }>,
    };
  }

  const end = input?.endDate ? new Date(`${input.endDate}T00:00:00`) : new Date();
  const start = input?.startDate
    ? new Date(`${input.startDate}T00:00:00`)
    : new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);
  const token = await getSearchConsoleAccessToken();

  const [overview, topQueries, topPages] = await Promise.all([
    querySearchConsole<SearchConsoleResponse>(token, {
      startDate,
      endDate,
      dimensions: ["date"],
      rowLimit: 7,
    }),
    querySearchConsole<SearchConsoleResponse>(token, {
      startDate,
      endDate,
      dimensions: ["query"],
      rowLimit: 5,
    }),
    querySearchConsole<SearchConsoleResponse>(token, {
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit: 5,
    }),
  ]);

  const overviewRows = overview.rows || [];
  const clicks = overviewRows.reduce((sum, row) => sum + Number(row.clicks || 0), 0);
  const impressions = overviewRows.reduce((sum, row) => sum + Number(row.impressions || 0), 0);
  const ctr = impressions > 0 ? clicks / impressions : 0;
  const weightedPosition =
    impressions > 0
      ? overviewRows.reduce((sum, row) => sum + Number(row.position || 0) * Number(row.impressions || 0), 0) / impressions
      : 0;

  function mapRows(rows: SearchConsoleRow[] = []) {
    return rows.map((row) => ({
      label: row.keys?.[0] || "Sem chave",
      clicks: Number(row.clicks || 0),
      impressions: Number(row.impressions || 0),
      ctr: Number(row.ctr || 0),
      position: Number(row.position || 0),
    }));
  }

  return {
    configured: true,
    available: true,
    startDate,
    endDate,
    clicks,
    impressions,
    ctr,
    avgPosition: weightedPosition,
    topQueries: mapRows(topQueries.rows),
    topPages: mapRows(topPages.rows),
  };
}

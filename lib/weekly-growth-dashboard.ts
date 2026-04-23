import { getConversionMetrics } from "@/lib/advanced-analytics";
import { isOrderBlobConfigured, readSecureBlobJson, writeSecureBlobJson } from "@/lib/blob-store";
import { getWeeklySearchConsoleSnapshot } from "@/lib/search-console";
import { getAdminDashboardSnapshot } from "@/lib/server-store";

export type WeeklyGrowthDashboard = {
  generatedAt: string;
  window: {
    startDate: string;
    endDate: string;
    label: string;
  };
  searchConsole: {
    configured: boolean;
    available: boolean;
    note?: string;
    clicks: number;
    impressions: number;
    ctr: number;
    avgPosition: number;
    topQueries: Array<{ label: string; clicks: number; impressions: number; ctr: number; position: number }>;
    topPages: Array<{ label: string; clicks: number; impressions: number; ctr: number; position: number }>;
  };
  internal: {
    orders: number;
    quotes: number;
    openRequests: number;
    revenuePix: number;
    revenueCard: number;
    totalViews: number;
    uniqueVisitors: number;
    addToCartRate: number;
    purchaseRate: number;
    averageSessionValue: number;
  };
  actions: string[];
};

const WEEKLY_GROWTH_REPORT_PATH = "reports/weekly-growth-dashboard.json";

export async function buildWeeklyGrowthDashboard(): Promise<WeeklyGrowthDashboard> {
  const today = new Date();
  const endDate = today.toISOString().slice(0, 10);
  const startDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [searchConsole, commerceSnapshot, conversionMetrics] = await Promise.all([
    getWeeklySearchConsoleSnapshot({ startDate, endDate }).catch((error) => ({
      configured: true,
      available: false,
      note: error instanceof Error ? error.message : "Falha ao consultar Search Console.",
      clicks: 0,
      impressions: 0,
      ctr: 0,
      avgPosition: 0,
      topQueries: [] as WeeklyGrowthDashboard["searchConsole"]["topQueries"],
      topPages: [] as WeeklyGrowthDashboard["searchConsole"]["topPages"],
    })),
    getAdminDashboardSnapshot(),
    getConversionMetrics(7).catch(() => ({
      total_views: 0,
      unique_visitors: 0,
      add_to_cart_rate: 0,
      purchase_rate: 0,
      average_session_value: 0,
      conversion_funnel: { view: 0, click: 0, cart: 0, purchase: 0 },
    })),
  ]);

  const actions = [
    searchConsole.available && searchConsole.ctr < 0.03
      ? "Revisar titles, metas e promessa comercial das páginas com mais impressões e CTR baixa."
      : "Manter revisão semanal de CTR nas páginas com maior exposição orgânica.",
    commerceSnapshot.metrics.openRequests > commerceSnapshot.metrics.totalQuotes
      ? "Reduzir atrito entre briefing e orçamento nas páginas de projeto sob medida."
      : "Empurrar mais tráfego para páginas com prova visual e CTA direto de orçamento.",
    conversionMetrics.purchase_rate < 0.25
      ? "Refinar FAQ, prova e faixa inicial nas páginas que geram mais clique e pouco fechamento."
      : "Aproveitar páginas com melhor taxa de compra para alimentar Reels, carrossel e blog.",
  ];

  return {
    generatedAt: new Date().toISOString(),
    window: {
      startDate,
      endDate,
      label: `${startDate} -> ${endDate}`,
    },
    searchConsole,
    internal: {
      orders: commerceSnapshot.metrics.totalOrders,
      quotes: commerceSnapshot.metrics.totalQuotes,
      openRequests: commerceSnapshot.metrics.openRequests,
      revenuePix: commerceSnapshot.metrics.totalRevenuePix,
      revenueCard: commerceSnapshot.metrics.totalRevenueCard,
      totalViews: conversionMetrics.total_views,
      uniqueVisitors: conversionMetrics.unique_visitors,
      addToCartRate: conversionMetrics.add_to_cart_rate,
      purchaseRate: conversionMetrics.purchase_rate,
      averageSessionValue: conversionMetrics.average_session_value,
    },
    actions,
  };
}

export async function readStoredWeeklyGrowthDashboard() {
  if (!isOrderBlobConfigured()) return null;
  return readSecureBlobJson<WeeklyGrowthDashboard>(WEEKLY_GROWTH_REPORT_PATH);
}

export async function persistWeeklyGrowthDashboard(report: WeeklyGrowthDashboard) {
  if (!isOrderBlobConfigured()) {
    return {
      stored: false,
      path: null,
    };
  }

  await writeSecureBlobJson(WEEKLY_GROWTH_REPORT_PATH, report);
  return {
    stored: true,
    path: WEEKLY_GROWTH_REPORT_PATH,
  };
}

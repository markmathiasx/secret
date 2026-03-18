import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

type OrderRow = {
  id: string;
  order_code: string;
  product_name: string;
  customer_name: string;
  email: string;
  payment_method: string;
  payment_status: string | null;
  payment_reference: string | null;
  quantity: number;
  total_pix: number | null;
  total_card: number | null;
  status: string;
  created_at: string;
};

type QuoteRow = {
  id: string;
  quote_id: string;
  product_name: string;
  customername: string;
  paymentmethod: string;
  estimated_total_pix: number | null;
  created_at: string;
};

type QuoteRequestRow = {
  id: string;
  quote_id: string | null;
  request_type: string | null;
  customer_name: string | null;
  phone: string | null;
  email: string | null;
  source: string | null;
  status: string | null;
  created_at: string;
};

function getSupabaseAdmin() {
  const { url, serviceRole } = getSupabaseEnv();
  if (!url || !serviceRole) return null;

  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function getTableName(kind: "orders" | "quotes" | "quoteRequests") {
  if (kind === "orders") return process.env.SUPABASE_ORDERS_TABLE || "orders";
  if (kind === "quoteRequests") return process.env.SUPABASE_QUOTE_REQUESTS_TABLE || "quote_requests";
  return process.env.SUPABASE_QUOTES_TABLE || "quotes";
}

export async function getAdminDashboardSnapshot() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      metrics: {
        totalOrders: 0,
        totalQuotes: 0,
        openRequests: 0,
        totalRevenuePix: 0,
        totalRevenueCard: 0
      },
      recentOrders: [] as OrderRow[],
      recentQuotes: [] as QuoteRow[],
      recentQuoteRequests: [] as QuoteRequestRow[]
    };
  }

  const [ordersRes, quotesRes, quoteRequestsRes] = await Promise.all([
    supabase
      .from(getTableName("orders"))
      .select("id, order_code, product_name, customer_name, email, payment_method, payment_status, payment_reference, quantity, total_pix, total_card, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from(getTableName("quotes"))
      .select("id, quote_id, product_name, customername, paymentmethod, estimated_total_pix, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from(getTableName("quoteRequests"))
      .select("id, quote_id, request_type, customer_name, phone, email, source, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10)
  ]);

  const recentOrders = (ordersRes.error ? [] : ordersRes.data || []) as OrderRow[];
  const recentQuotes = (quotesRes.error ? [] : quotesRes.data || []) as QuoteRow[];
  const recentQuoteRequests = (quoteRequestsRes.error ? [] : quoteRequestsRes.data || []) as QuoteRequestRow[];

  const totalRevenuePix = recentOrders.reduce((acc, item) => acc + Number(item.total_pix || 0), 0);
  const totalRevenueCard = recentOrders.reduce((acc, item) => acc + Number(item.total_card || 0), 0);

  return {
    metrics: {
      totalOrders: recentOrders.length,
      totalQuotes: recentQuotes.length,
      openRequests: recentQuoteRequests.filter((item) => (item.status || "recebido") !== "concluido").length,
      totalRevenuePix,
      totalRevenueCard
    },
    recentOrders,
    recentQuotes,
    recentQuoteRequests
  };
}

export async function getCustomerOrdersByEmail(email: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !email.trim()) return [];

  const { data, error } = await supabase
    .from(getTableName("orders"))
    .select("id, order_code, product_name, payment_method, payment_status, payment_reference, quantity, total_pix, total_card, status, created_at")
    .eq("email", email.trim().toLowerCase())
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) return [];
  return (data || []) as Array<Pick<OrderRow, "id" | "order_code" | "product_name" | "payment_method" | "payment_status" | "payment_reference" | "quantity" | "total_pix" | "total_card" | "status" | "created_at">>;
}

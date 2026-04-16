import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

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

type FinanceOrderRow = {
  id: string;
  order_code: string;
  customer_name: string;
  payment_method: string;
  payment_status: string | null;
  order_status: string;
  total: number;
  estimated_cost: number;
  estimated_profit: number;
  created_at: string;
};

function getSupabaseAdmin() {
  const { url, serviceRole } = getSupabaseEnv();
  if (!url || !serviceRole) return null;

  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getTableName(kind: "orders" | "quotes" | "quoteRequests") {
  if (kind === "orders") return process.env.SUPABASE_ORDERS_TABLE || "orders";
  if (kind === "quoteRequests") return process.env.SUPABASE_QUOTE_REQUESTS_TABLE || "quote_requests";
  return process.env.SUPABASE_QUOTES_TABLE || "quotes";
}

async function getPrismaAdminDashboardSnapshot() {
  const [orders, quotes, quoteRequests] = await Promise.all([
    prisma.order.findMany({
      include: {
        items: {
          take: 1,
        },
        payments: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
    prisma.quoteEstimate.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
    prisma.quoteRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
  ]);

  const recentOrders: OrderRow[] = orders.map((order) => {
    const item = order.items[0];
    const payment = order.payments[0];
    return {
      id: order.id,
      order_code: order.orderNumber,
      product_name: item?.title || "Pedido sem item",
      customer_name: order.customerName || "Cliente não identificado",
      email: order.customerEmail || "",
      payment_method: order.paymentMethod.toLowerCase(),
      payment_status: payment?.status.toLowerCase() || null,
      payment_reference: payment?.providerPaymentId || payment?.externalReference || null,
      quantity: item?.quantity || 0,
      total_pix: Number(order.grandTotal),
      total_card: payment?.method === "CARD" ? Number(payment.amount) : Number(order.grandTotal),
      status: order.status.toLowerCase(),
      created_at: order.createdAt.toISOString(),
    };
  });

  const recentQuotes: QuoteRow[] = quotes.map((quote) => ({
    id: quote.id,
    quote_id: quote.quoteCode,
    product_name: quote.product?.title || "Projeto sob medida",
    customername: quote.customerName,
    paymentmethod: quote.paymentMethod.toLowerCase(),
    estimated_total_pix: Number(quote.estimatedTotalPix),
    created_at: quote.createdAt.toISOString(),
  }));

  const recentQuoteRequests: QuoteRequestRow[] = quoteRequests.map((quoteRequest) => ({
    id: quoteRequest.id,
    quote_id: quoteRequest.quoteCode,
    request_type: quoteRequest.requestType,
    customer_name: quoteRequest.customerName,
    phone: quoteRequest.phone,
    email: quoteRequest.email,
    source: quoteRequest.source,
    status: quoteRequest.status,
    created_at: quoteRequest.createdAt.toISOString(),
  }));

  const totalRevenuePix = recentOrders
    .filter((item) => item.payment_method === "pix")
    .reduce((acc, item) => acc + Number(item.total_pix || 0), 0);
  const totalRevenueCard = recentOrders
    .filter((item) => item.payment_method === "card")
    .reduce((acc, item) => acc + Number(item.total_card || 0), 0);

  return {
    metrics: {
      totalOrders: recentOrders.length,
      totalQuotes: recentQuotes.length,
      openRequests: recentQuoteRequests.filter((item) => (item.status || "recebido") !== "concluido").length,
      totalRevenuePix,
      totalRevenueCard,
    },
    recentOrders,
    recentQuotes,
    recentQuoteRequests,
  };
}

export async function getAdminDashboardSnapshot() {
  if (await canConnectToDatabase()) {
    return getPrismaAdminDashboardSnapshot();
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      metrics: {
        totalOrders: 0,
        totalQuotes: 0,
        openRequests: 0,
        totalRevenuePix: 0,
        totalRevenueCard: 0,
      },
      recentOrders: [] as OrderRow[],
      recentQuotes: [] as QuoteRow[],
      recentQuoteRequests: [] as QuoteRequestRow[],
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
      .limit(10),
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
      totalRevenueCard,
    },
    recentOrders,
    recentQuotes,
    recentQuoteRequests,
  };
}

function isApprovedOrder(input: { orderStatus: string; paymentStatus: string | null }) {
  const orderStatus = input.orderStatus.toLowerCase();
  const paymentStatus = (input.paymentStatus || "").toLowerCase();
  return (
    paymentStatus === "paid" ||
    ["paid", "printing", "ready_to_ship", "shipped", "delivered"].includes(orderStatus)
  );
}

function isPendingOrder(input: { orderStatus: string; paymentStatus: string | null }) {
  const orderStatus = input.orderStatus.toLowerCase();
  const paymentStatus = (input.paymentStatus || "").toLowerCase();
  return !isApprovedOrder(input) && !["canceled", "refunded"].includes(orderStatus) && !["failed", "canceled", "refunded"].includes(paymentStatus);
}

async function getPrismaAdminFinanceSnapshot() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 40,
  });

  const recentOrders: FinanceOrderRow[] = orders.map((order) => {
    const payment = order.payments[0];
    const estimatedCost = order.items.reduce((sum, item) => {
      const productCost = item.product?.estimatedUnitCost ? Number(item.product.estimatedUnitCost) : Number(item.unitPrice) * 0.6;
      return sum + productCost * item.quantity;
    }, 0);
    const total = Number(order.grandTotal);

    return {
      id: order.id,
      order_code: order.orderNumber,
      customer_name: order.customerName || "Cliente não identificado",
      payment_method: order.paymentMethod.toLowerCase(),
      payment_status: payment?.status.toLowerCase() || null,
      order_status: order.status.toLowerCase(),
      total,
      estimated_cost: Number(estimatedCost.toFixed(2)),
      estimated_profit: Number((total - estimatedCost).toFixed(2)),
      created_at: order.createdAt.toISOString(),
    };
  });

  const approvedOrders = recentOrders.filter((order) => isApprovedOrder({ orderStatus: order.order_status, paymentStatus: order.payment_status }));
  const pendingOrders = recentOrders.filter((order) => isPendingOrder({ orderStatus: order.order_status, paymentStatus: order.payment_status }));
  const approvedRevenue = approvedOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingRevenue = pendingOrders.reduce((sum, order) => sum + order.total, 0);
  const estimatedProfit = approvedOrders.reduce((sum, order) => sum + order.estimated_profit, 0);
  const pixRevenue = approvedOrders.filter((order) => order.payment_method === "pix").reduce((sum, order) => sum + order.total, 0);
  const cardRevenue = approvedOrders.filter((order) => order.payment_method === "card").reduce((sum, order) => sum + order.total, 0);

  return {
    metrics: {
      approvedRevenue,
      pendingRevenue,
      averageTicket: approvedOrders.length ? approvedRevenue / approvedOrders.length : 0,
      estimatedProfit,
      pixRevenue,
      cardRevenue,
      paidOrders: approvedOrders.length,
      pendingOrders: pendingOrders.length,
    },
    recentOrders,
  };
}

export async function getAdminFinanceSnapshot() {
  if (await canConnectToDatabase()) {
    return getPrismaAdminFinanceSnapshot();
  }

  const snapshot = await getAdminDashboardSnapshot();
  const recentOrders: FinanceOrderRow[] = snapshot.recentOrders.map((order) => {
    const total = Number(order.payment_method === "card" ? order.total_card || order.total_pix || 0 : order.total_pix || order.total_card || 0);
    const estimatedCost = Number((total * 0.6).toFixed(2));
    return {
      id: order.id,
      order_code: order.order_code,
      customer_name: order.customer_name || "Cliente não identificado",
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      order_status: order.status,
      total,
      estimated_cost: estimatedCost,
      estimated_profit: Number((total - estimatedCost).toFixed(2)),
      created_at: order.created_at,
    };
  });

  const approvedOrders = recentOrders.filter((order) => isApprovedOrder({ orderStatus: order.order_status, paymentStatus: order.payment_status }));
  const pendingOrders = recentOrders.filter((order) => isPendingOrder({ orderStatus: order.order_status, paymentStatus: order.payment_status }));
  const approvedRevenue = approvedOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingRevenue = pendingOrders.reduce((sum, order) => sum + order.total, 0);
  const estimatedProfit = approvedOrders.reduce((sum, order) => sum + order.estimated_profit, 0);

  return {
    metrics: {
      approvedRevenue,
      pendingRevenue,
      averageTicket: approvedOrders.length ? approvedRevenue / approvedOrders.length : 0,
      estimatedProfit,
      pixRevenue: approvedOrders.filter((order) => order.payment_method === "pix").reduce((sum, order) => sum + order.total, 0),
      cardRevenue: approvedOrders.filter((order) => order.payment_method === "card").reduce((sum, order) => sum + order.total, 0),
      paidOrders: approvedOrders.length,
      pendingOrders: pendingOrders.length,
    },
    recentOrders,
  };
}

export async function getCustomerOrdersByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return [];

  if (await canConnectToDatabase()) {
    const orders = await prisma.order.findMany({
      where: {
        customerEmail: normalizedEmail,
      },
      include: {
        items: {
          take: 1,
        },
        payments: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
    });

    return orders.map((order) => {
      const item = order.items[0];
      const payment = order.payments[0];
      return {
        id: order.id,
        order_code: order.orderNumber,
        product_name: item?.title || "Pedido sem item",
        payment_method: order.paymentMethod.toLowerCase(),
        payment_status: payment?.status.toLowerCase() || null,
        payment_reference: payment?.providerPaymentId || payment?.externalReference || null,
        quantity: item?.quantity || 0,
        total_pix: Number(order.grandTotal),
        total_card: payment?.method === "CARD" ? Number(payment.amount) : Number(order.grandTotal),
        status: order.status.toLowerCase(),
        created_at: order.createdAt.toISOString(),
      };
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(getTableName("orders"))
    .select("id, order_code, product_name, payment_method, payment_status, payment_reference, quantity, total_pix, total_card, status, created_at")
    .eq("email", normalizedEmail)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) return [];
  return data || [];
}

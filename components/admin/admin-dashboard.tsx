"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import {
  ArrowRight,
  Boxes,
  ImageUp,
  LoaderCircle,
  MessageCircleMore,
  PackageCheck,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import type { AdminCatalogProduct } from "@/lib/server/admin-catalog-store";
import { formatCurrency } from "@/lib/utils";

type AdminDashboardProps = {
  initialProducts: AdminCatalogProduct[];
  commerceSnapshot: {
    metrics: {
      totalOrders: number;
      totalQuotes: number;
      openRequests: number;
      totalRevenuePix: number;
      totalRevenueCard: number;
    };
    recentOrders?: Array<{
      id: string;
      order_code: string;
      product_name: string;
      customer_name: string;
      email: string;
      payment_method: string;
      payment_status: string | null;
      total_pix: number | null;
      total_card: number | null;
      status: string;
      created_at: string;
    }>;
    recentQuoteRequests?: Array<{
      id: string;
      quote_id: string | null;
      request_type: string | null;
      customer_name: string | null;
      phone: string | null;
      email: string | null;
      source: string | null;
      status: string | null;
      created_at: string;
    }>;
  };
};

type ReplaceReport = {
  totalProducts: number;
  sourceCandidates: number;
  replacedProducts: number;
  replacedFiles: number;
  missingIds: string[];
};

function stageLabel(stage: AdminCatalogProduct["productionStage"]) {
  if (stage === "imprimindo") return "Imprimindo";
  if (stage === "pronto") return "Pronto";
  return "Recebido";
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeOrderValue(order: NonNullable<AdminDashboardProps["commerceSnapshot"]["recentOrders"]>[number]) {
  return Number(order.total_pix || order.total_card || 0);
}

export function AdminDashboard({ initialProducts, commerceSnapshot }: AdminDashboardProps) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"todos" | "Pronta entrega" | "Sob encomenda">("todos");
  const [stageFilter, setStageFilter] = useState<"todos" | "recebido" | "imprimindo" | "pronto">("todos");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [replaceBusy, setReplaceBusy] = useState(false);
  const [replaceManifestPath, setReplaceManifestPath] = useState("");
  const [replaceSourceDir, setReplaceSourceDir] = useState("");
  const [replaceReport, setReplaceReport] = useState<ReplaceReport | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      if (pendingOnly && !product.imagePending) return false;
      if (lowStockOnly && product.stock > 3) return false;
      if (statusFilter !== "todos" && product.status !== statusFilter) return false;
      if (stageFilter !== "todos" && product.productionStage !== stageFilter) return false;
      if (!normalizedQuery) return true;

      return `${product.id} ${product.title} ${product.category} ${product.collection} ${product.material}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [lowStockOnly, pendingOnly, products, query, stageFilter, statusFilter]);

  const summary = useMemo(() => {
    const pending = products.filter((item) => item.imagePending).length;
    const ready = products.filter((item) => item.readyToShip).length;
    const printing = products.filter((item) => item.productionStage === "imprimindo").length;

    return {
      total: products.length,
      pending,
      ready,
      printing,
    };
  }, [products]);

  const queueColumns = useMemo(
    () => [
      { id: "recebido", label: "Recebido", items: products.filter((item) => item.productionStage === "recebido") },
      { id: "imprimindo", label: "Imprimindo", items: products.filter((item) => item.productionStage === "imprimindo") },
      { id: "pronto", label: "Pronto", items: products.filter((item) => item.productionStage === "pronto") },
    ],
    [products]
  );
  const recentOrders = commerceSnapshot.recentOrders || [];
  const recentQuoteRequests = commerceSnapshot.recentQuoteRequests || [];
  const totalObservedRevenue = commerceSnapshot.metrics.totalRevenuePix + commerceSnapshot.metrics.totalRevenueCard;
  const pendingOrders = recentOrders.filter((order) => {
    const status = `${order.status} ${order.payment_status || ""}`.toLowerCase();
    return !/(paid|delivered|shipped|canceled|refunded)/.test(status);
  }).length;
  const averageObservedTicket = recentOrders.length
    ? recentOrders.reduce((sum, order) => sum + normalizeOrderValue(order), 0) / recentOrders.length
    : 0;

  function updateRow(productId: string, patch: Partial<AdminCatalogProduct>) {
    setProducts((current) =>
      current.map((item) => {
        if (item.id !== productId) return item;
        return { ...item, ...patch };
      })
    );
  }

  async function refreshProducts() {
    const refresh = await fetch("/api/admin/catalog", { cache: "no-store" });
    const payload = await refresh.json().catch(() => ({}));
    if (refresh.ok && Array.isArray(payload?.products)) {
      setProducts(payload.products);
    }
  }

  async function saveProduct(product: AdminCatalogProduct) {
    setSavingId(product.id);
    setStatusMessage("");

    try {
      const response = await fetch(`/api/admin/catalog/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          costBase: product.costBase,
          stock: product.stock,
          status: product.status,
          featured: product.featured,
          readyToShip: product.readyToShip,
          customizable: product.customizable,
          productionStage: product.productionStage,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.product) {
        throw new Error(data?.error || "Falha ao salvar o produto.");
      }

      setProducts((current) => current.map((item) => (item.id === product.id ? data.product : item)));
      setStatusMessage(`Produto ${product.id} atualizado com Pix pelo valor base e cartão + R$ 1.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Não foi possível salvar o produto.");
    } finally {
      setSavingId(null);
    }
  }

  async function triggerReplaceImages() {
    setReplaceBusy(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/admin/catalog/replace-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          manifestPath: replaceManifestPath || undefined,
          sourceDir: replaceSourceDir || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.report) {
        throw new Error(data?.error || "Falha ao importar o lote de imagens.");
      }

      setReplaceReport(data.report);
      setStatusMessage(`Importação concluída: ${data.report.replacedProducts} produtos receberam galeria local real.`);
      startTransition(() => {
        void refreshProducts();
      });
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Não foi possível importar as imagens.");
    } finally {
      setReplaceBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),rgba(15,23,42,0.98))] p-8 shadow-[0_28px_120px_rgba(2,8,23,0.42)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">Seller Central MDH 3D</p>
            <h1 className="mt-3 text-4xl font-black text-white">Operação de catálogo, preço e produção em um só painel.</h1>
            <p className="mt-4 text-sm leading-7 text-white/68">
              A lista abaixo usa Pix pelo valor base da peça, cartão com acréscimo fixo de R$ 1, status de produção e triagem de imagens pendentes para o time fechar o catálogo sem sair do fluxo.
            </p>
          </div>

          <div className="grid min-w-[280px] gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/48">Receita Pix observada</p>
              <p className="mt-3 text-3xl font-black text-white">{formatCurrency(commerceSnapshot.metrics.totalRevenuePix)}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/48">Pedidos + cotações</p>
              <p className="mt-3 text-3xl font-black text-white">
                {commerceSnapshot.metrics.totalOrders + commerceSnapshot.metrics.totalQuotes}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Produtos", value: summary.total, icon: Warehouse },
            { label: "Imagens pendentes", value: summary.pending, icon: ImageUp },
            { label: "Pronta entrega", value: summary.ready, icon: PackageCheck },
            { label: "Imprimindo", value: summary.printing, icon: Boxes },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/48">{item.label}</p>
                    <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 p-3 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[30px] border border-white/10 bg-black/20 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-100">
                <TrendingUp className="h-5 w-5" />
                <p className="text-xs uppercase tracking-[0.18em]">Vendas e dinheiro</p>
              </div>
              <h2 className="mt-2 text-2xl font-black text-white">Pedidos recentes, valores e próximos fechamentos</h2>
              <p className="mt-2 text-sm leading-7 text-white/60">
                Use este bloco como cockpit diário: confirmar pagamento, abrir pedido, responder cliente e puxar carrinho pendente para fechamento.
              </p>
            </div>
            <Link href="/admin/orders" className="btn-secondary gap-2">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              { label: "Receita observada", value: formatCurrency(totalObservedRevenue), tone: "text-emerald-100" },
              { label: "Ticket médio", value: formatCurrency(averageObservedTicket), tone: "text-white" },
              { label: "Pedidos recentes", value: recentOrders.length, tone: "text-cyan-100" },
              { label: "Pendentes", value: pendingOrders, tone: "text-amber-100" },
            ].map((item) => (
              <div key={item.label} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{item.label}</p>
                <p className={`mt-2 text-2xl font-black ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10">
            <div className="grid grid-cols-[1fr_0.55fr_0.5fr_0.42fr] gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              <span>Pedido</span>
              <span>Cliente</span>
              <span className="text-right">Valor</span>
              <span className="text-right">Ação</span>
            </div>
            {recentOrders.slice(0, 6).map((order) => (
              <div key={order.id} className="grid grid-cols-[1fr_0.55fr_0.5fr_auto] gap-3 border-b border-white/10 px-4 py-4 text-sm last:border-b-0">
                <div className="min-w-0">
                  <p className="font-mono font-semibold text-white">{order.order_code}</p>
                  <p className="mt-1 truncate text-xs text-white/55">{order.product_name}</p>
                  <p className="mt-1 text-xs text-white/38">{formatDateTime(order.created_at)}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white/84">{order.customer_name}</p>
                  <p className="mt-1 truncate text-xs text-white/45">{order.email || "sem e-mail"}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-100">{formatCurrency(normalizeOrderValue(order))}</p>
                  <p className="mt-1 text-xs text-white/45">{order.payment_method} • {order.payment_status || order.status}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Link href={`/admin/orders/${order.id}`} className="btn-glass inline-flex px-3 py-2 text-xs">
                    Abrir
                  </Link>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Olá ${order.customer_name || ""}! Sobre seu pedido #${order.order_code} na MDH 3D — `)}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    title="Responder via WhatsApp"
                    className="inline-flex items-center gap-1 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:border-emerald-400/50 hover:bg-emerald-400/20"
                  >
                    <MessageCircleMore className="h-3.5 w-3.5" />
                    WA
                  </a>
                </div>
              </div>
            ))}
            {!recentOrders.length ? (
              <div className="px-4 py-8 text-center text-sm text-white/45">
                Nenhum pedido recente encontrado neste ambiente.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-black/20 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-100">
                <MessageCircleMore className="h-5 w-5" />
                <p className="text-xs uppercase tracking-[0.18em]">Atendimento que vira pedido</p>
              </div>
              <h2 className="mt-2 text-2xl font-black text-white">Clientes para responder agora</h2>
              <p className="mt-2 text-sm leading-7 text-white/60">
                Cotações e mensagens entram no mesmo fluxo do inbox. Responder rápido reduz abandono.
              </p>
            </div>
            <Link href="/admin/inbox" className="btn-secondary gap-2">
              Abrir inbox
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {recentQuoteRequests.slice(0, 6).map((request) => (
              <article key={request.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {request.customer_name || request.email || request.phone || "Lead sem nome"}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-cyan-100/70">
                      {request.request_type || "pedido comercial"} • {request.status || "recebido"}
                    </p>
                    <p className="mt-2 text-xs text-white/45">{formatDateTime(request.created_at)}</p>
                  </div>
                  <ReceiptText className="h-5 w-5 shrink-0 text-white/35" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/admin/inbox`} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                    Responder
                  </Link>
                  {request.phone ? (
                    <a
                      href={`https://wa.me/${request.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
            {!recentQuoteRequests.length ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/45">
                Nenhuma cotação recente. Use o catálogo, WhatsApp e páginas de lote para puxar leads novos.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[30px] border border-white/10 bg-black/20 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/78">Importação em massa</p>
              <h2 className="mt-2 text-2xl font-black text-white">Substituir placeholders por mídias locais do produto</h2>
            </div>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
              Pipeline local
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-white/48">Manifest JSON opcional</span>
              <input
                value={replaceManifestPath}
                onChange={(event) => setReplaceManifestPath(event.target.value)}
                placeholder="C:\\imagens\\generated-image-urls.json"
                className="field-base mt-2"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-white/48">Pasta de lote opcional</span>
              <input
                value={replaceSourceDir}
                onChange={(event) => setReplaceSourceDir(event.target.value)}
                placeholder="C:\\imagens\\produto-gerado"
                className="field-base mt-2"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={triggerReplaceImages} disabled={replaceBusy} className="btn-primary gap-2 disabled:opacity-60">
              {replaceBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
              Importar lote real
            </button>
            <p className="text-sm text-white/55">
              Sem preencher nada, o painel reaproveita automaticamente todas as mídias locais já existentes no repositório.
            </p>
          </div>

          {replaceReport ? (
            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-white/72">
              <p className="font-semibold text-white">Último relatório de importação</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">Detectadas</p>
                  <p className="mt-2 text-xl font-black text-white">{replaceReport.sourceCandidates}</p>
                </div>
                <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">Atualizadas</p>
                  <p className="mt-2 text-xl font-black text-white">{replaceReport.replacedProducts}</p>
                </div>
                <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">Pendentes</p>
                  <p className="mt-2 text-xl font-black text-white">{replaceReport.missingIds.length}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[30px] border border-white/10 bg-black/20 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-100" />
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Fila de produção</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            {queueColumns.map((column) => (
              <div key={column.id} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{column.label}</p>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/60">
                    {column.items.length}
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {column.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-[14px] border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/72">
                      {item.title}
                    </div>
                  ))}
                  {!column.items.length ? <p className="text-sm text-white/45">Sem itens nesta etapa.</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-black/20 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/78">Catálogo operacional</p>
            <h2 className="mt-2 text-2xl font-black text-white">SKUs com preço Pix base, cartão + R$ 1 e edição rápida</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
              Pix valor base
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              Operação local
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-[1.2fr_repeat(4,0.7fr)]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar SKU, título, categoria ou material"
              className="field-base pl-11"
            />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="field-base">
            <option value="todos">Todos os status</option>
            <option value="Pronta entrega">Pronta entrega</option>
            <option value="Sob encomenda">Sob encomenda</option>
          </select>
          <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value as typeof stageFilter)} className="field-base">
            <option value="todos">Toda a fila</option>
            <option value="recebido">Recebido</option>
            <option value="imprimindo">Imprimindo</option>
            <option value="pronto">Pronto</option>
          </select>
          <button type="button" onClick={() => setPendingOnly((value) => !value)} className={`btn-glass justify-center ${pendingOnly ? "border-amber-300/35 text-amber-100" : ""}`}>
            {pendingOnly ? "Mostrando pendentes" : "Filtrar imagens pendentes"}
          </button>
          <button type="button" onClick={() => setLowStockOnly((value) => !value)} className={`btn-glass justify-center ${lowStockOnly ? "border-rose-300/35 text-rose-100" : ""}`}>
            {lowStockOnly ? "Mostrando baixo estoque" : "Filtrar baixo estoque"}
          </button>
        </div>

        {statusMessage ? (
          <div className="mt-5 rounded-[18px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-50">
            {statusMessage}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          {filteredProducts.map((product) => (
            <article key={product.id} className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
              <div className="grid gap-4 xl:grid-cols-[132px_1fr]">
                <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/20">
                  <div className="relative aspect-square">
                    <Image
                      src={product.imageGallery[0] || "/catalog-assets/product-placeholder.webp"}
                      alt={`Impressão 3D de ${product.title} - MDH 3D Store`}
                      fill
                      className="object-cover"
                      sizes="132px"
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/58">
                          {product.id}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${product.imagePending ? "border-amber-300/25 bg-amber-300/12 text-amber-100" : "border-emerald-300/25 bg-emerald-300/12 text-emerald-100"}`}>
                          {product.imagePending ? "Imagem pendente" : "Galeria validada"}
                        </span>
                        <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-cyan-100">
                          {stageLabel(product.productionStage)}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr]">
                        <label className="block">
                          <span className="text-xs uppercase tracking-[0.16em] text-white/45">Título</span>
                          <input
                            value={product.title}
                            onChange={(event) => updateRow(product.id, { title: event.target.value })}
                            className="field-base mt-2"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs uppercase tracking-[0.16em] text-white/45">Custo base</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={product.costBase}
                            onChange={(event) => updateRow(product.id, { costBase: Number(event.target.value) || 0 })}
                            className="field-base mt-2"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid min-w-[240px] gap-2 rounded-[20px] border border-white/10 bg-black/20 p-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-white/45">Preço antigo</p>
                        <p className="mt-1 text-sm font-semibold text-white/40 line-through">{formatCurrency(product.referencePrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/75">Preço Pix final</p>
                        <p className="mt-1 text-2xl font-black text-white">{formatCurrency(product.pricePix)}</p>
                        <p className="text-xs text-white/55">Cartão {formatCurrency(product.priceCard)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                          Cartão + R$ 1
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                          Operação local
                        </span>
                      </div>
                    </div>
                  </div>

                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.16em] text-white/45">Descrição</span>
                    <textarea
                      value={product.description}
                      onChange={(event) => updateRow(product.id, { description: event.target.value })}
                      className="field-base mt-2 min-h-[112px]"
                    />
                  </label>

                  <div className="grid gap-3 md:grid-cols-5">
                    <label className="block">
                      <span className="text-xs uppercase tracking-[0.16em] text-white/45">Status</span>
                      <select
                        value={product.status}
                        onChange={(event) => updateRow(product.id, { status: event.target.value as AdminCatalogProduct["status"] })}
                        className="field-base mt-2"
                      >
                        <option value="Pronta entrega">Pronta entrega</option>
                        <option value="Sob encomenda">Sob encomenda</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-[0.16em] text-white/45">Fila</span>
                      <select
                        value={product.productionStage}
                        onChange={(event) => updateRow(product.id, { productionStage: event.target.value as AdminCatalogProduct["productionStage"] })}
                        className="field-base mt-2"
                      >
                        <option value="recebido">Recebido</option>
                        <option value="imprimindo">Imprimindo</option>
                        <option value="pronto">Pronto</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-[0.16em] text-white/45">Estoque</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={product.stock}
                        onChange={(event) => updateRow(product.id, { stock: Number(event.target.value) || 0 })}
                        className="field-base mt-2"
                      />
                    </label>
                    <label className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/78">
                      <input
                        type="checkbox"
                        checked={product.readyToShip}
                        onChange={(event) => updateRow(product.id, { readyToShip: event.target.checked })}
                      />
                      Pronta entrega
                    </label>
                    <label className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/78">
                      <input
                        type="checkbox"
                        checked={product.featured}
                        onChange={(event) => updateRow(product.id, { featured: event.target.checked })}
                      />
                      Destacar vitrine
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2 text-xs text-white/55">
                      <span>{product.category}</span>
                      <span>•</span>
                      <span>{product.collection}</span>
                      <span>•</span>
                      <span>{product.material}</span>
                      {product.imageSourceType ? (
                        <>
                          <span>•</span>
                          <span>{product.imageSourceType}</span>
                        </>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => void saveProduct(product)}
                      disabled={savingId === product.id}
                      className="btn-primary min-w-[180px] justify-center gap-2 disabled:opacity-60"
                    >
                      {savingId === product.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Salvar produto
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

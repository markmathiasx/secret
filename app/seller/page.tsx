import Link from "next/link";
import { auth } from "@/auth";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

type SellerRecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  items: Array<{
    title: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SellerPage() {
  const session = await auth();
  const role = session?.user?.role || "guest";

  if (role !== "seller" && role !== "admin") {
    return (
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Seller Central</p>
        <h1 className="mt-3 text-4xl font-black text-white">Área do vendedor</h1>
        <p className="mt-4 max-w-2xl text-white/68">
          Entre com uma conta de seller ou admin para abrir o painel operacional da loja.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login?redirect=/seller" className="btn-primary">
            Entrar como seller
          </Link>
          <Link href="/admin" className="btn-secondary">
            Abrir admin
          </Link>
        </div>
      </section>
    );
  }

  const hasDatabase = await canConnectToDatabase();
  let productCount = 0;
  let orderCount = 0;
  let recentOrders: SellerRecentOrder[] = [];

  if (hasDatabase) {
    [productCount, orderCount, recentOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        include: {
          items: {
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
      }),
    ]);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="glass-panel p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Seller Central</p>
        <h1 className="mt-3 text-4xl font-black text-white">Operação do vendedor pronta para evoluir.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
          Este painel já entra ligado ao banco novo e serve como base para catálogo, pedidos, estoque, promoções e rastreio de produção.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="surface-stat rounded-[22px] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Produtos ativos</p>
            <p className="mt-3 text-3xl font-black text-white">{productCount}</p>
          </div>
          <div className="surface-stat rounded-[22px] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Pedidos</p>
            <p className="mt-3 text-3xl font-black text-white">{orderCount}</p>
          </div>
          <div className="surface-stat rounded-[22px] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Base pronta</p>
            <p className="mt-3 text-lg font-black text-white">{hasDatabase ? "Prisma online" : "Fallback local"}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-6">
            <p className="text-sm font-semibold text-white">Pedidos recentes</p>
            <div className="mt-4 grid gap-3">
              {recentOrders.length ? recentOrders.map((order) => (
                <div key={order.id} className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-sm text-white/78">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{order.items[0]?.title || "Pedido sem item"}</p>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/55">
                      {order.status.toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-2 text-white/58">{order.orderNumber}</p>
                </div>
              )) : <p className="text-sm text-white/60">Os pedidos aparecerão aqui assim que o banco estiver populado.</p>}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-6">
            <p className="text-sm font-semibold text-white">Próximos blocos</p>
            <div className="mt-4 grid gap-3 text-sm text-white/72">
              {[
                "CRUD de produtos e variantes",
                "Upload em massa de STL e mídia",
                "Fila de produção e rastreio",
                "Cupons, promoções e flash sales",
              ].map((item) => (
                <div key={item} className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

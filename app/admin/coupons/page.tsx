import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const connected = await canConnectToDatabase();
  const coupons: { id: string; code: string; title: string | null; type: string; value: unknown; active: boolean; usageLimit: number | null; usedCount: number; endsAt: Date | null }[] = connected
    ? await prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          code: true,
          title: true,
          type: true,
          value: true,
          active: true,
          usageLimit: true,
          usedCount: true,
          endsAt: true,
        },
      })
    : [];

  const fmt = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Promoções</p>
          <h2 className="section-title">Cupons</h2>
          <p className="section-copy">Gerencie cupons de desconto para o checkout.</p>
        </div>
        <Link href="/admin/coupons/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo cupom
        </Link>
      </div>

      {!connected && (
        <div className="mb-4 rounded-[20px] border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50">
          Banco de dados indisponível.
        </div>
      )}

      <div className="overflow-x-auto rounded-[24px] border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Código</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Tipo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Valor</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Usos</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Validade</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                  Nenhum cupom cadastrado.
                </td>
              </tr>
            )}
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="bg-white/[0.01] hover:bg-white/5">
                <td className="px-4 py-3">
                  <p className="font-mono font-semibold text-cyan-200">{coupon.code}</p>
                  <p className="text-xs text-white/40">{coupon.title}</p>
                </td>
                <td className="px-4 py-3 text-white/65">
                  {coupon.type === "PERCENT" ? "Percentual" : coupon.type === "FIXED" ? "Fixo" : "Frete grátis"}
                </td>
                <td className="px-4 py-3 text-right text-white">
                  {coupon.type === "PERCENT" ? `${Number(coupon.value)}%` : fmt(Number(coupon.value))}
                </td>
                <td className="px-4 py-3 text-right text-white/65">
                  {coupon.usedCount}{coupon.usageLimit !== null ? `/${coupon.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {coupon.endsAt ? new Date(coupon.endsAt).toLocaleDateString("pt-BR") : "Sem limite"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${coupon.active ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-white/10 bg-white/5 text-white/40"}`}>
                    {coupon.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

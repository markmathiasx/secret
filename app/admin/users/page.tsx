import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { AdminSendResetButton } from "@/components/admin/admin-send-reset-button";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const connected = await canConnectToDatabase();
  const users: { id: string; name: string | null; email: string | null; role: string; isActive: boolean; createdAt: Date; _count: { buyerOrders: number } }[] = connected
    ? await prisma.user.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { buyerOrders: true } },
        },
      })
    : [];

  const ROLE_COLORS: Record<string, string> = {
    ADMIN: "border-violet-300/30 bg-violet-300/10 text-violet-100",
    SELLER: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
    BUYER: "border-white/10 bg-white/5 text-white/60",
  };

  return (
    <section>
      <div className="mb-6">
        <p className="section-kicker">CRM</p>
        <h2 className="section-title">Usuários</h2>
        <p className="section-copy">Lista dos últimos 50 usuários cadastrados.</p>
      </div>

      {!connected && (
        <div className="mb-4 rounded-[20px] border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50">
          Banco de dados indisponível — mostrando lista vazia.
        </div>
      )}

      <div className="overflow-x-auto rounded-[24px] border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Usuário</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Perfil</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Pedidos</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Cadastro</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="bg-white/[0.01] transition hover:bg-white/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{u.name || "—"}</p>
                  <p className="text-xs text-white/40">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[u.role] || ROLE_COLORS.BUYER}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-white">{u._count.buyerOrders}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${u.isActive ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-rose-300/20 bg-rose-300/10 text-rose-200"}`}>
                    {u.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <AdminSendResetButton userId={u.id} userEmail={u.email || ""} userName={u.name || "—"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-right text-xs text-white/40">{users.length} usuário(s)</p>
    </section>
  );
}

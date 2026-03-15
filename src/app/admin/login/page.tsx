import { redirect } from "next/navigation";
import { getCurrentAdminSession } from "@/lib/admin-auth";
import { AdminLoginForm } from "./ui";

export default async function AdminLoginPage() {
  const session = await getCurrentAdminSession();
  if (session) redirect("/admin");

  return (
    <section className="mx-auto max-w-lg px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Admin</p>
      <h1 className="mt-3 text-4xl font-black text-white">Login do painel</h1>
      <p className="mt-4 text-white/65">Acesso privado para operação, pedidos, pagamentos e produção.</p>
      <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6">
        <AdminLoginForm />
      </div>
    </section>
  );
}

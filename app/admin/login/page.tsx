import { AdminLoginForm } from "./ui";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <section className="mx-auto max-w-lg px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Admin</p>
      <h1 className="mt-3 text-4xl font-black text-white">Login do painel</h1>
      <p className="mt-4 text-white/65">
        Use as credenciais de admin cadastradas no Auth.js para abrir o painel com a mesma sessão segura usada no restante do marketplace.
      </p>
      <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6">
        <AdminLoginForm />
      </div>
    </section>
  );
}

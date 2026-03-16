import { AdminLoginForm } from "./ui";
import { adminConfig } from "@/lib/admin-config";

export default function AdminLoginPage() {
  return (
    <section className="mx-auto max-w-lg px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Painel privado</p>
      <h1 className="mt-3 text-4xl font-black text-white">Login do administrador</h1>
      <p className="mt-4 text-white/65">Este acesso fica separado do site público. Admin atual: {adminConfig.email}</p>
      <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6">
        <AdminLoginForm />
      </div>
    </section>
  );
}

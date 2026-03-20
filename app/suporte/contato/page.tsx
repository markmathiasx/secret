import Link from "next/link";
import { supportEmail, whatsappNumber } from "@/lib/constants";

export default function SuporteContatoPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[32px] border border-[#ead8c1] bg-white p-6">
        <h1 className="text-3xl font-black text-slate-900">Contato</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Atendimento comercial e tecnico para compras unitarias, pedidos recorrentes e cadastro B2B.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <a href={`https://wa.me/${whatsappNumber}`} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">WhatsApp</p>
            <p className="mt-2 text-sm font-semibold text-emerald-800">+{whatsappNumber}</p>
          </a>
          <a href={`mailto:${supportEmail}`} className="rounded-2xl border border-[#e5d4be] bg-[#fff8ef] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Email</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{supportEmail}</p>
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Para B2B, informar CNPJ, volume mensal estimado e categoria de interesse.
        </p>
        <div className="mt-5">
          <Link href="/suporte" className="rounded-full border border-[#e5d4be] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700">
            Voltar para suporte
          </Link>
        </div>
      </div>
    </section>
  );
}


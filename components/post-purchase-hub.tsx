"use client";

import Link from "next/link";
import { Clock3, MessageCircleMore, RotateCcw, ShieldCheck, UserRound } from "lucide-react";
import { whatsappNumber } from "@/lib/constants";

export function PostPurchaseHub({
  orderCode,
  compact = false,
  title = "Próximos passos",
  body = "Rastreie, resolva trocas e volte para sua conta sem depender de atendimento manual.",
}: {
  orderCode?: string | null;
  compact?: boolean;
  title?: string;
  body?: string;
}) {
  const supportMessage = encodeURIComponent(
    [
      "Oi! Preciso de suporte com meu pedido.",
      orderCode ? `Pedido: ${orderCode}` : null,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return (
    <div className={`rounded-[28px] border border-white/10 bg-white/5 ${compact ? "p-4" : "p-5"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-cyan-100">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-xs uppercase tracking-[0.2em]">Pós-compra</p>
          </div>
          <h3 className={`mt-3 font-black text-white ${compact ? "text-xl" : "text-2xl"}`}>{title}</h3>
          <p className="mt-3 text-sm leading-7 text-white/68">{body}</p>
          {orderCode ? <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/45">Pedido {orderCode}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Rastreio fácil</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Trocas claras</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Suporte humano</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/rastrear" className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/80 transition hover:border-cyan-300/30">
          <div className="flex items-center gap-2 text-cyan-100">
            <Clock3 className="h-4 w-4" />
            <span className="font-semibold">Rastrear pedido</span>
          </div>
          <p className="mt-2 leading-6 text-white/62">Veja status, pagamento e rastreio em uma página só.</p>
        </Link>
        <Link href="/devolucoes" className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/80 transition hover:border-emerald-300/30">
          <div className="flex items-center gap-2 text-emerald-100">
            <RotateCcw className="h-4 w-4" />
            <span className="font-semibold">Trocas e devoluções</span>
          </div>
          <p className="mt-2 leading-6 text-white/62">Abra uma solicitação de forma simples e guiada.</p>
        </Link>
        <Link href="/conta" className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/80 transition hover:border-violet-300/30">
          <div className="flex items-center gap-2 text-violet-100">
            <UserRound className="h-4 w-4" />
            <span className="font-semibold">Minha conta</span>
          </div>
          <p className="mt-2 leading-6 text-white/62">Revise pedidos, favoritos e atalhos de recompra.</p>
        </Link>
        <a
          href={`https://wa.me/${whatsappNumber}?text=${supportMessage}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/80 transition hover:border-emerald-300/30"
        >
          <div className="flex items-center gap-2 text-emerald-100">
            <MessageCircleMore className="h-4 w-4" />
            <span className="font-semibold">Falar com a equipe</span>
          </div>
          <p className="mt-2 leading-6 text-white/62">Se precisar, a equipe entra no detalhe do pedido com você.</p>
        </a>
      </div>

      {orderCode ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Pedido vinculado</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Acompanhamento direto</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">MDH 3D</span>
        </div>
      ) : null}
    </div>
  );
}

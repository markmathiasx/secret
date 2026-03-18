"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Copy, QrCode, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const PIX_KEY = "21974137662";

export function PixPaymentCard({ title, amount }: { title: string; amount: number }) {
  const [payload, setPayload] = useState("");
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/pix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, amount })
    })
      .then((res) => res.json())
      .then((json) => setPayload(json?.payload || ""))
      .catch(() => setPayload(""));
  }, [amount, title]);

  useEffect(() => {
    if (!payload) return;
    QRCode.toDataURL(payload, { width: 320, margin: 1 }).then(setQr).catch(() => setQr(""));
  }, [payload]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-[30px] border border-emerald-400/20 bg-emerald-400/10 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">Pagamento instantâneo</p>
          <h3 className="mt-2 text-2xl font-black text-white">Pix com QR Code e copia e cola</h3>
          <p className="mt-3 text-sm leading-7 text-emerald-50/75">Gere o pagamento somente quando for fechar o pedido. O app do cliente confirma o recebedor com CPF final 85.</p>
        </div>
        <span className="rounded-2xl border border-white/10 bg-black/20 p-3 text-emerald-50">
          <QrCode className="h-6 w-6" />
        </span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
          {qr ? <Image src={qr} alt={`QR Code Pix de ${title}`} width={260} height={260} className="mx-auto w-full max-w-[260px] rounded-[20px] bg-white p-3" /> : <div className="flex h-[260px] items-center justify-center rounded-[20px] border border-dashed border-white/15 text-sm text-white/60">Gerando QR Code…</div>}
        </div>
        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
            <p className="text-sm text-white/55">Valor sugerido para este item</p>
            <p className="mt-1 text-3xl font-black text-white">{formatCurrency(amount)}</p>
            <p className="mt-2 text-sm text-white/60">Descrição do Pix: {title}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
            <p className="text-sm text-white/55">Copia e cola Pix</p>
            <textarea readOnly value={payload} className="mt-2 h-28 w-full rounded-2xl border border-white/10 bg-black/35 p-3 text-xs text-white/80 outline-none" />
            <button onClick={onCopy} className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
              <Copy className="h-4 w-4" />
              {copied ? "Copiado" : "Copiar código Pix"}
            </button>
          </div>
          <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-sm text-white/55">Chave Pix direta</p>
            <p className="mt-2 text-lg font-black tracking-[0.14em] text-white">{PIX_KEY}</p>
            <p className="mt-2 text-sm text-white/60">O cliente pode pagar pelo QR Code, pelo código copia e cola ou informando essa chave no app do banco.</p>
          </div>
          <div className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-200" />
            <p>Mostre a chave, o QR Code e o copia e cola no checkout. Isso reduz atrito, melhora confiança e acelera a aprovação do pagamento.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Calculator, FileUp, MessageCircleMore } from "lucide-react";
import { buildCustomQuoteWhatsappUrl } from "@/lib/mdh-store/links";
import { trackSmartStoreEvent } from "@/lib/mdh-store/analytics";
import { formatCurrency } from "@/lib/utils";

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".stl", ".obj", ".3mf"];

function estimateBase(material: string) {
  if (material === "PETG") return 42;
  if (material === "Resina") return 55;
  return 35;
}

export function CustomQuoteForm({ whatsappNumber, siteUrl }: { whatsappNumber: string; siteUrl: string }) {
  const [pieceType, setPieceType] = useState("Peça decorativa");
  const [dimensions, setDimensions] = useState("10 x 10 x 10 cm");
  const [color, setColor] = useState("Preto");
  const [material, setMaterial] = useState("PLA");
  const [quantity, setQuantity] = useState(1);
  const [usage, setUsage] = useState("Presente");
  const [urgency, setUrgency] = useState("Normal");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [fileError, setFileError] = useState("");

  const estimate = useMemo(() => {
    const qty = Math.max(1, quantity);
    const rush = urgency === "Urgente" ? 1.35 : 1;
    const quantityDiscount = qty >= 10 ? 0.82 : qty >= 3 ? 0.92 : 1;
    const personalization = /nome|logo|personal/i.test(notes + pieceType) ? 12 : 0;
    const estimatedPrice = (estimateBase(material) + personalization) * qty * rush * quantityDiscount;
    const estimatedDays = urgency === "Urgente" ? "1 a 3 dias úteis" : qty >= 10 ? "5 a 10 dias úteis" : "2 a 5 dias úteis";
    return { estimatedPrice, estimatedDays };
  }, [material, notes, pieceType, quantity, urgency]);

  const whatsappUrl = buildCustomQuoteWhatsappUrl(
    {
      pieceType,
      dimensions,
      color,
      material,
      quantity,
      usage,
      urgency,
      phone,
      files,
      estimatedPrice: estimate.estimatedPrice,
      estimatedDays: estimate.estimatedDays,
      pageUrl: `${siteUrl}/orcamento-personalizado`,
      notes,
    },
    { whatsappNumber }
  );

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/48">Tipo de peça</span>
            <select value={pieceType} onChange={(event) => setPieceType(event.target.value)} className="industrial-input">
              <option>Peça decorativa</option>
              <option>Suporte funcional</option>
              <option>Chaveiro personalizado</option>
              <option>Brinde em lote</option>
              <option>Peça técnica</option>
              <option>Arquivo STL próprio</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/48">Medidas aproximadas</span>
            <input value={dimensions} onChange={(event) => setDimensions(event.target.value)} className="industrial-input" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/48">Cor</span>
            <select value={color} onChange={(event) => setColor(event.target.value)} className="industrial-input">
              <option>Preto</option>
              <option>Branco</option>
              <option>Vermelho</option>
              <option>Azul</option>
              <option>Verde</option>
              <option>Sob consulta</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/48">Material</span>
            <select value={material} onChange={(event) => setMaterial(event.target.value)} className="industrial-input">
              <option>PLA</option>
              <option>PETG</option>
              <option>Resina</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/48">Quantidade</span>
            <input type="number" min={1} max={500} value={quantity} onChange={(event) => setQuantity(Number(event.target.value) || 1)} className="industrial-input" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/48">Uso da peça</span>
            <select value={usage} onChange={(event) => setUsage(event.target.value)} className="industrial-input">
              <option>Presente</option>
              <option>Setup gamer</option>
              <option>Casa e organização</option>
              <option>Pet</option>
              <option>Evento</option>
              <option>Empresa</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/48">Urgência</span>
            <select value={urgency} onChange={(event) => setUrgency(event.target.value)} className="industrial-input">
              <option>Normal</option>
              <option>Urgente</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/48">WhatsApp</span>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" className="industrial-input" placeholder="(21) 97413-7662" />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/48">
            <FileUp className="h-4 w-4" /> Referência ou arquivo 3D
          </span>
          <input
            type="file"
            multiple
            accept={allowedExtensions.join(",")}
            onChange={(event) => {
              const selected = Array.from(event.target.files || []);
              const invalid = selected.find((file) => !allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext)));
              if (invalid) {
                setFileError("Envie apenas JPG, PNG, WEBP, STL, OBJ ou 3MF.");
                setFiles([]);
                return;
              }
              setFileError("");
              setFiles(selected.map((file) => file.name).slice(0, 6));
            }}
            className="industrial-input"
          />
        </label>
        {fileError ? <p className="mt-2 text-sm font-bold text-rose-200">{fileError}</p> : null}

        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/48">Observações</span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="industrial-input min-h-28 resize-y" placeholder="Nome personalizado, logo, encaixe, acabamento, restrições..." />
        </label>
      </form>

      <aside className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5 lg:sticky lg:top-28 lg:self-start">
        <p className="section-kicker">Estimativa automática</p>
        <div className="mt-4 rounded-[8px] border border-emerald-300/18 bg-emerald-300/10 p-4">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-100/68">
            <Calculator className="h-4 w-4" /> Preço inicial
          </p>
          <p className="mt-2 text-4xl font-black text-white">{formatCurrency(estimate.estimatedPrice)}</p>
          <p className="mt-2 text-sm leading-6 text-white/62">Prazo estimado: {estimate.estimatedDays}. O valor final depende do arquivo, acabamento e fila de impressão.</p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackSmartStoreEvent("purchase_lead", { source: "custom_quote", value: estimate.estimatedPrice, currency: "BRL" })}
          className="btn-whatsapp mt-4 flex min-h-12 justify-center gap-2"
        >
          Enviar orçamento no WhatsApp <MessageCircleMore className="h-4 w-4" />
        </a>
        <div className="mt-4 rounded-[8px] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/62">
          <p className="font-black text-white">Checklist Bambu Lab A1 Mini</p>
          <p>Peças até cerca de 18 x 18 x 18 cm tendem a caber melhor. Medidas maiores podem exigir divisão, encaixe ou outra estratégia.</p>
        </div>
      </aside>
    </section>
  );
}

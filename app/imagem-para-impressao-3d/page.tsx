"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, FileUp, ImageUp, MessageCircleMore, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

type ServiceTab = "prototipagem" | "resina" | "engenharia";

type FormState = {
  name: string;
  whatsapp: string;
  email: string;
  description: string;
  size: string;
  material: string;
  color: string;
  deadline: string;
  quantity: string;
};

const serviceContent: Record<ServiceTab, { label: string; title: string; items: string[]; blurb: string }> = {
  prototipagem: {
    label: "🔹 Prototipagem",
    title: "PLA com janela rápida para validação visual",
    blurb: "Ideal para mockups, estudos formais e peças de apresentação com acabamento limpo e custo mais leve.",
    items: ["PLA Premium", "24-48h", "Peças leves", "Setup e mockups", "Correção rápida", "Acabamento clean"],
  },
  resina: {
    label: "💎 Resina",
    title: "Resina 4K/8K para detalhes finos e miniaturas",
    blurb: "Perfeito para bustos, colecionáveis e pequenas peças com detalhes mais refinados e acabamento de exposição.",
    items: ["Resina 4K/8K", "3-5 dias", "Miniaturas", "Detalhes finos", "Acabamento premium", "Pós-cura dedicada"],
  },
  engenharia: {
    label: "⚙️ Engenharia",
    title: "PETG e peças técnicas para uso funcional",
    blurb: "Indicado para suportes, protótipos funcionais e itens utilitários que exigem mais resistência e estabilidade.",
    items: ["PETG técnico", "5-7 dias", "Suportes", "Peças funcionais", "Uso prático", "Revisão dimensional"],
  },
};

const acceptedImage = ["image/jpeg", "image/png", "image/webp"];
const acceptedModel = ["model/stl", "application/sla", "application/octet-stream", "model/obj", "model/gltf-binary", "application/vnd.ms-pki.stl"];
const IMAGE_TO_3D_DRAFT_KEY = "mdh:image-to-3d-draft";
const briefTemplates = [
  {
    label: "Miniatura geek",
    description: "Quero transformar uma referência em miniatura colecionável com foco em acabamento visual.",
    material: "PLA",
    deadline: "Sem pressa, priorizo acabamento",
  },
  {
    label: "Peça funcional",
    description: "Preciso de uma peça utilitária com encaixe, resistência e revisão dimensional.",
    material: "PETG",
    deadline: "Quero validar prazo e medidas",
  },
  {
    label: "Presente personalizado",
    description: "Quero uma peça para presente com boa apresentação e possibilidade de ajuste visual.",
    material: "PLA",
    deadline: "Tenho uma data específica para receber",
  },
  {
    label: "Protótipo rápido",
    description: "Preciso validar forma, escala e leitura visual antes de partir para uma versão final.",
    material: "PLA",
    deadline: "Tenho urgência para validar",
  },
];

export default function ImageTo3DPage() {
  const [tab, setTab] = useState<ServiceTab>("prototipagem");
  const [state, setState] = useState<FormState>({
    name: "",
    whatsapp: "",
    email: "",
    description: "",
    size: "",
    material: "PLA",
    color: "",
    deadline: "",
    quantity: "1",
  });
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [successId, setSuccessId] = useState<string>("");
  const [draftLoaded, setDraftLoaded] = useState(false);

  const whatsappHref = useMemo(() => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, []);
  const readiness = [
    Boolean(state.name.trim()),
    Boolean(state.whatsapp.trim()),
    Boolean(state.email.trim()),
    Boolean(state.description.trim()),
    Boolean(referenceImage),
  ].filter(Boolean).length;
  const readinessPercent = Math.round((readiness / 5) * 100);
  const recommendation = useMemo(() => {
    if (tab === "resina") {
      return "Boa rota para bustos, miniaturas e peças de detalhe fino. Vale mandar a melhor referência frontal possível.";
    }
    if (tab === "engenharia") {
      return "Boa rota para encaixe, suporte e uso funcional. Se tiver medida, foto da peça real e contexto de uso ajudam bastante.";
    }
    return "Boa rota para validação visual, mockup e peças de apresentação. Se houver urgência, isso costuma simplificar a produção.";
  }, [tab]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(IMAGE_TO_3D_DRAFT_KEY);
      if (!raw) {
        setDraftLoaded(true);
        return;
      }
      const parsed = JSON.parse(raw) as { tab?: ServiceTab; state?: Partial<FormState> };
      if (parsed.tab && parsed.tab in serviceContent) {
        setTab(parsed.tab);
      }
      if (parsed.state && typeof parsed.state === "object") {
        const draftState = parsed.state;
        setState((current) => ({
          ...current,
          ...Object.fromEntries(
            Object.entries(draftState).filter(([, value]) => typeof value === "string")
          ),
        }));
      }
    } catch {
      // ignore malformed local draft
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !draftLoaded) return;
    window.localStorage.setItem(
      IMAGE_TO_3D_DRAFT_KEY,
      JSON.stringify({
        tab,
        state,
      })
    );
  }, [draftLoaded, state, tab]);

  function applyTemplate(template: (typeof briefTemplates)[number]) {
    setState((current) => ({
      ...current,
      description: template.description,
      material: template.material,
      deadline: template.deadline,
    }));
  }

  function validateFile(file: File, kind: "image" | "model") {
    if (kind === "image") {
      const validType = acceptedImage.includes(file.type) || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
      if (!validType) return "Envie uma imagem JPG, PNG ou WEBP.";
      if (file.size > 10 * 1024 * 1024) return "A imagem de referência deve ter no máximo 10MB.";
      return "";
    }
    const validType = acceptedModel.includes(file.type) || /\.(stl|obj|3mf)$/i.test(file.name);
    if (!validType) return "Envie um arquivo STL, OBJ ou 3MF.";
    if (file.size > 50 * 1024 * 1024) return "O arquivo 3D deve ter no máximo 50MB.";
    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessId("");

    if (!state.name || !state.whatsapp || !state.email || !state.description || !referenceImage) {
      setError("Preencha os campos obrigatórios e envie pelo menos uma imagem de referência.");
      return;
    }

    const imageError = referenceImage ? validateFile(referenceImage, "image") : "";
    const modelError = modelFile ? validateFile(modelFile, "model") : "";
    if (imageError || modelError) {
      setError(imageError || modelError);
      return;
    }

    const formData = new FormData();
    Object.entries(state).forEach(([key, value]) => formData.append(key, value));
    formData.append("referenceImage", referenceImage);
    if (modelFile) formData.append("modelFile", modelFile);

    try {
      setSending(true);
      const response = await fetch("/api/quote", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Não foi possível registrar sua solicitação agora.");
        return;
      }
      const requestId = data?.quoteId || "MDH-ORCAMENTO";
      setSuccessId(requestId);
      const message = `Oi! Vim pelo site da MDH 3D e quero um orçamento.

📋 Solicitação #${requestId}
👤 Nome: ${state.name}
📱 WhatsApp: ${state.whatsapp}
📧 Email: ${state.email}
📁 Arquivos anexados: ${modelFile ? 2 : 1}
📝 Descrição: ${state.description}
📏 Tamanho: ${state.size || "A definir"}
🎨 Material: ${state.material}
🎯 Cor: ${state.color || "A definir"}
⏰ Prazo: ${state.deadline || "A combinar"}
🔢 Quantidade: ${state.quantity}`;
      window.location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    } catch {
      setError("Falha de rede ao registrar sua solicitação. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_25%),linear-gradient(135deg,rgba(5,10,20,0.95),rgba(4,7,15,0.98))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.3)]">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <span className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">📍 Produção Local no RJ</span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">Envie sua imagem e transformamos em projeto 3D</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">Orçamento com análise humana, validação de arquivo e encaminhamento direto para o WhatsApp da MDH 3D.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {Object.entries(serviceContent).map(([key, value]) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key as ServiceTab)}
                    className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${active ? "border-cyan-300/40 bg-cyan-400/12 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.16)]" : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"}`}
                  >
                    {value.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/75">{serviceContent[tab].label}</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{serviceContent[tab].title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/65">{serviceContent[tab].blurb}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {serviceContent[tab].items.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">{item}</div>
                ))}
              </div>
            </div>
            <div className="mt-6 rounded-[28px] border border-emerald-300/20 bg-emerald-400/10 p-6">
              <div className="flex items-center gap-2 text-emerald-100">
                <Sparkles className="h-4 w-4" />
                <p className="text-xs uppercase tracking-[0.18em]">Rota sugerida</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-emerald-50">{recommendation}</p>
            </div>
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Modelos rápidos de briefing</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {briefTemplates.map((template) => (
                  <button
                    key={template.label}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-cyan-300/25 hover:text-cyan-100"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link href="/catalogo" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white/80 transition hover:text-white">Voltar para o catálogo</Link>
              <a href={whatsappHref} className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-5 py-3 font-semibold text-emerald-100 transition hover:bg-emerald-400/20">Falar com atendimento</a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_48px_rgba(2,8,23,0.28)]">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">Prontidão da solicitação</p>
                <span className="text-sm font-semibold text-cyan-100">{readinessPercent}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${readinessPercent}%` }} />
              </div>
              <div className="mt-3 grid gap-2 text-xs text-white/58 sm:grid-cols-2">
                <span>{state.description.trim() ? "Descricao pronta" : "Falta explicar o projeto"}</span>
                <span>{referenceImage ? "Imagem anexada" : "Falta imagem de referencia"}</span>
                <span>{modelFile ? "Arquivo 3D anexado" : "Arquivo 3D opcional ausente"}</span>
                <span>{state.deadline.trim() ? "Prazo informado" : "Prazo ainda aberto"}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/70">Nome completo<input value={state.name} onChange={(e) => update('name', e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" required /></label>
              <label className="text-sm text-white/70">WhatsApp<input value={state.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="5521..." required /></label>
              <label className="text-sm text-white/70 md:col-span-2">Email<input type="email" value={state.email} onChange={(e) => update('email', e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" required /></label>
              <label className="text-sm text-white/70 md:col-span-2">Descrição do projeto<textarea value={state.description} onChange={(e) => update('description', e.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" required /></label>
              <label className="text-sm text-white/70">Tamanho aproximado (cm)<input value={state.size} onChange={(e) => update('size', e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" /></label>
              <label className="text-sm text-white/70">Material preferido<select value={state.material} onChange={(e) => update('material', e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"><option>PLA</option><option>PETG</option><option>Resina</option></select></label>
              <label className="text-sm text-white/70">Cor preferida<input value={state.color} onChange={(e) => update('color', e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" /></label>
              <label className="text-sm text-white/70">Prazo desejado<input value={state.deadline} onChange={(e) => update('deadline', e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="Ex.: até sexta" /></label>
              <label className="text-sm text-white/70">Quantidade<input value={state.quantity} onChange={(e) => update('quantity', e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" inputMode="numeric" /></label>
              <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
                <label className="rounded-[24px] border border-dashed border-cyan-300/25 bg-cyan-400/5 p-4 text-sm text-white/70">
                  <div className="flex items-center gap-2 text-cyan-100"><ImageUp className="h-4 w-4" /> Imagem de referência *</div>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp" className="mt-3 block w-full text-sm text-white/70" onChange={(e) => setReferenceImage(e.target.files?.[0] || null)} required />
                  <p className="mt-2 text-xs text-white/45">JPG, PNG ou WEBP com até 10MB.</p>
                  {referenceImage ? <p className="mt-2 text-xs text-emerald-200">{referenceImage.name}</p> : null}
                </label>
                <label className="rounded-[24px] border border-dashed border-white/15 bg-white/5 p-4 text-sm text-white/70">
                  <div className="flex items-center gap-2 text-white"><FileUp className="h-4 w-4" /> Arquivo STL / OBJ / 3MF</div>
                  <input type="file" accept=".stl,.obj,.3mf" className="mt-3 block w-full text-sm text-white/70" onChange={(e) => setModelFile(e.target.files?.[0] || null)} />
                  <p className="mt-2 text-xs text-white/45">Opcional, até 50MB.</p>
                  {modelFile ? <p className="mt-2 text-xs text-emerald-200">{modelFile.name}</p> : null}
                </label>
              </div>
            </div>

            {error ? <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div> : null}
            {successId ? <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />Solicitação {successId} registrada.</div> : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button type="submit" disabled={sending} className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/15 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-60"><UploadCloud className="h-4 w-4" />{sending ? 'Enviando...' : 'Registrar e enviar no WhatsApp'}</button>
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white/55"><ShieldCheck className="h-4 w-4" />Arquivos não são armazenados</div>
            </div>
            <p className="mt-4 text-xs leading-6 text-white/45">Ao continuar, você envia a solicitação para a MDH 3D e recebe o resumo direto no WhatsApp para acelerar o atendimento humano.</p>
          </form>
        </div>
      </div>
    </section>
  );
}

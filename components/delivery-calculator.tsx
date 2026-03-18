"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { deliveryZones } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { loadGoogleMapsPlaces } from "@/lib/google-maps";

type CepResult = {
  cep: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

function formatCep(value: string) {
  const digits = onlyDigits(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function inferZone(cep: string) {
  const prefix = Number(onlyDigits(cep).slice(0, 3));
  if (!Number.isFinite(prefix)) return deliveryZones[4];
  if (prefix >= 200 && prefix <= 209) return deliveryZones[0];
  if (prefix >= 210 && prefix <= 219) return deliveryZones[1];
  if (prefix >= 220 && prefix <= 229) return deliveryZones[2];
  if (prefix >= 230 && prefix <= 239) return deliveryZones[3];
  return deliveryZones[4];
}

export function DeliveryCalculator({ adminMode = false }: { adminMode?: boolean }) {
  const [cep, setCep] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [data, setData] = useState<CepResult | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleAttempted, setGoogleAttempted] = useState(false);
  const autocompleteRef = useRef<HTMLInputElement | null>(null);

  const zone = useMemo(() => (data?.cep ? inferZone(data.cep) : null), [data]);

  useEffect(() => {
    const hasKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
    if (!hasKey || !autocompleteRef.current) return;

    loadGoogleMapsPlaces().then((ok) => {
      setGoogleAttempted(true);
      setGoogleReady(ok);
      if (!ok || !autocompleteRef.current || !window.google?.maps?.places) return;

      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        componentRestrictions: { country: "br" },
        fields: ["address_components"],
        types: ["address"]
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const components = (place.address_components || []) as Array<{ long_name: string; types: string[] }>;
        const code = components.find((item) => item.types.includes("postal_code"))?.long_name || "";
        if (code) setCep(formatCep(code));
      });
    });
  }, []);

  async function onSearch() {
    const clean = onlyDigits(cep);
    if (clean.length !== 8) {
      setStatus("error");
      setMessage("Digite um CEP válido com 8 números.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");
      const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const json = (await response.json()) as CepResult;
      if (!response.ok || json.erro) {
        throw new Error("CEP não encontrado.");
      }
      if (json.uf && json.uf !== "RJ") {
        throw new Error("No momento a entrega está limitada ao Rio de Janeiro (RJ).");
      }
      setData({ ...json, cep: formatCep(clean) });
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setData(null);
      setMessage(error instanceof Error ? error.message : "Não foi possível calcular o frete.");
    }
  }

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Calcule seu frete aqui</p>
      <h2 className="mt-2 text-2xl font-black text-white">Entrega local no Rio de Janeiro</h2>
      <p className="mt-3 text-sm leading-7 text-white/60">
        Informe seu CEP para receber uma estimativa inicial de frete normal e prazo. O valor final pode variar se a peça for muito volumosa.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={formatCep(cep)}
          onChange={(e) => setCep(e.target.value)}
          placeholder="Ex: 20081-250"
          className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />
        <button onClick={onSearch} className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950">
          {status === "loading" ? "Calculando..." : "Calcular frete"}
        </button>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/65">
        <input
          ref={autocompleteRef}
          placeholder="Opcional: buscar endereço com Google Maps"
          className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none"
        />
        <p className="mt-2">
          {googleReady
            ? "Google Places ativo: ao selecionar endereço, o CEP é preenchido automaticamente."
            : googleAttempted
              ? "Google indisponível agora. Continue com CEP manual (fallback ativo)."
              : "Autocomplete Google é opcional e só ativa quando NEXT_PUBLIC_GOOGLE_MAPS_API_KEY estiver configurada."}
        </p>
      </div>

      {status === "error" ? <p className="mt-4 text-sm text-rose-200">{message}</p> : null}

      {zone && data ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-white/55">Destino</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{data.bairro || "Bairro não informado"}</h3>
            <p className="mt-1 text-sm text-white/60">{data.localidade} - {data.uf} • CEP {data.cep}</p>
            <p className="mt-4 text-sm text-white/55">Faixa estimada</p>
            <p className="mt-1 text-2xl font-black text-cyan-100">{zone.region}</p>
          </div>

          <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 p-5">
            <p className="text-sm text-cyan-100/70">Frete normal estimado</p>
            <p className="mt-1 text-3xl font-black text-cyan-50">{formatCurrency(zone.fee)}</p>
            <p className="mt-2 text-sm text-cyan-100/75">Prazo normal: {zone.eta}</p>
            <p className="mt-3 text-xs leading-6 text-cyan-100/70">
              Produção e agenda de rota podem ajustar o prazo para 1, 2 ou 3 dias úteis no checkout.
              {adminMode ? ` Expresso interno sugerido: ${formatCurrency(zone.fee * 2)}.` : " Expresso disponível sob consulta."}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

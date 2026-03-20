"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { catalog, getProductUrl, type Product } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

type FilamentProfile = "pla" | "petg" | "abrasivo";
type Goal = "detalhe" | "equilibrado" | "velocidade";
type Diameter = "0.2" | "0.4" | "0.6" | "0.8";

export default function ConfiguradorNozzleHotendPage() {
  const [filament, setFilament] = useState<FilamentProfile>("pla");
  const [goal, setGoal] = useState<Goal>("equilibrado");
  const [diameter, setDiameter] = useState<Diameter>("0.4");

  const [kitItems, setKitItems] = useState<string[]>([]);

  const recommendation = useMemo(() => {
    if (goal === "detalhe" || diameter === "0.2") {
      return "Use bico 0.2 mm para detalhe maximo e velocidade menor.";
    }
    if (goal === "velocidade" || diameter === "0.8") {
      return "Use bico 0.8 mm para vazao alta e pecas grandes.";
    }
    if (filament === "abrasivo") {
      return "Prefira bico em aco endurecido para materiais abrasivos.";
    }
    if (diameter === "0.6") {
      return "0.6 mm e um bom ponto entre vazao e acabamento.";
    }
    return "0.4 mm e a configuracao padrao para uso geral na A1 Mini.";
  }, [diameter, filament, goal]);

  const suggestedProducts = useMemo(() => {
    const byType = catalog.filter((item) => {
      if (filament === "abrasivo") return item.technical.typeProduct !== "accessory";
      if (goal === "velocidade") return ["upgrade", "consumable", "kit"].includes(item.technical.typeProduct);
      if (goal === "detalhe") return ["spare_part", "kit", "accessory"].includes(item.technical.typeProduct);
      return true;
    });
    return byType.slice(0, 6);
  }, [filament, goal]);

  const availableKit = catalog.filter((item) => ["consumable", "upgrade", "kit"].includes(item.technical.typeProduct));
  const selectedKitProducts = availableKit.filter((item) => kitItems.includes(item.id));
  const kitTotal = selectedKitProducts.reduce((sum, item) => sum + item.pricePix, 0);

  const toggleKitItem = (productId: string) => {
    setKitItems((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  };

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Configurador A1 Mini</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Assistente de nozzle/hotend + monte seu kit</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Regras base: hotend ate 300C, filamento 1.75 mm e diametros 0.2/0.4/0.6/0.8 mm.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[30px] border border-[#e8dac7] bg-white p-6">
          <h2 className="text-2xl font-black text-slate-900">1) Assistente de escolha</h2>

          <div className="mt-5 space-y-4">
            <FormSelect label="Filamento principal" value={filament} onChange={(value) => setFilament(value as FilamentProfile)}>
              <option value="pla">PLA / PLA Silk</option>
              <option value="petg">PETG</option>
              <option value="abrasivo">Abrasivo (ex.: fibra)</option>
            </FormSelect>

            <FormSelect label="Objetivo" value={goal} onChange={(value) => setGoal(value as Goal)}>
              <option value="detalhe">Maximo detalhe</option>
              <option value="equilibrado">Equilibrado</option>
              <option value="velocidade">Velocidade</option>
            </FormSelect>

            <FormSelect label="Diametro desejado" value={diameter} onChange={(value) => setDiameter(value as Diameter)}>
              <option value="0.2">0.2 mm</option>
              <option value="0.4">0.4 mm</option>
              <option value="0.6">0.6 mm</option>
              <option value="0.8">0.8 mm</option>
            </FormSelect>
          </div>

          <div className="mt-6 rounded-2xl border border-[#eadcc8] bg-[#fff8ef] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recomendacao</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{recommendation}</p>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-800">Produtos sugeridos</p>
            <div className="mt-3 grid gap-3">
              {suggestedProducts.map((item) => (
                <SuggestionRow key={item.id} product={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-[#e8dac7] bg-white p-6">
          <h2 className="text-2xl font-black text-slate-900">2) Monte seu kit</h2>
          <p className="mt-2 text-sm text-slate-600">Selecione consumiveis, upgrades e kits para fechar em um carrinho tecnico.</p>

          <div className="mt-4 max-h-[420px] space-y-3 overflow-auto pr-1">
            {availableKit.map((item) => {
              const checked = kitItems.includes(item.id);
              return (
                <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${checked ? "border-orange-300 bg-orange-50" : "border-[#eadcc8] bg-[#fffdf9]"}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleKitItem(item.id)} className="mt-1 h-4 w-4 accent-orange-500" />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{item.name}</span>
                    <span className="mt-1 block text-xs text-slate-500">{item.sku}</span>
                    <span className="mt-1 block text-xs text-slate-500">Pix: {formatCurrency(item.pricePix)}</span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-[#eadcc8] bg-[#fff8ef] p-4">
            <p className="text-sm text-slate-600">Itens selecionados: {selectedKitProducts.length}</p>
            <p className="mt-1 text-2xl font-black text-slate-900">Total Pix: {formatCurrency(kitTotal)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/checkout" className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                Ir para checkout
              </Link>
              <Link href="/catalogo" className="rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm text-slate-700">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-[#e7d8c3] bg-white px-4 text-sm text-slate-900 outline-none focus:border-orange-400">
        {children}
      </select>
    </label>
  );
}

function SuggestionRow({ product }: { product: Product }) {
  return (
    <Link href={getProductUrl(product)} className="rounded-2xl border border-[#eadcc8] bg-[#fffdf9] p-3 hover:bg-[#fff7ec]">
      <p className="text-sm font-semibold text-slate-900">{product.name}</p>
      <p className="mt-1 text-xs text-slate-500">{product.sku}</p>
      <p className="mt-1 text-xs text-slate-500">Pix: {formatCurrency(product.pricePix)}</p>
    </Link>
  );
}

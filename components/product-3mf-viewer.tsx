"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock3, Download, Layers3, Mouse, ScanSearch, Weight, Waves } from "lucide-react";
import type { CatalogModelPlateEntry, CatalogModelPreviewEntry } from "@/lib/catalog-photo-manifest";

type Props = {
  modelUrl: string;
  productName: string;
  preview?: CatalogModelPreviewEntry | null;
};

type ViewMode = "preview" | "previewNoLight" | "top" | "pick";

const mainViewerSizes = "(min-width: 1024px) 54vw, 96vw";
const plateThumbSizes = "(min-width: 1280px) 140px, (min-width: 768px) 16vw, 26vw";
const wheelThreshold = 80;

function getPlateViews(plate: CatalogModelPlateEntry | null) {
  if (!plate) return [];

  return [
    { key: "preview" as const, label: "Bandeja" },
    { key: "previewNoLight" as const, label: "Tecnica" },
    { key: "top" as const, label: "Topo" },
    { key: "pick" as const, label: "Pick" },
  ].filter((view) => Boolean(plate[view.key]));
}

function formatPrediction(seconds?: number) {
  if (!Number.isFinite(seconds) || !seconds || seconds <= 0) return null;
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

function formatWeight(weightGrams?: number) {
  if (!Number.isFinite(weightGrams) || !weightGrams || weightGrams <= 0) return null;
  return `${weightGrams.toFixed(weightGrams >= 100 ? 0 : 1)} g`;
}

function formatFilamentMeters(filamentMeters?: number) {
  if (!Number.isFinite(filamentMeters) || !filamentMeters || filamentMeters <= 0) return null;
  return `${filamentMeters.toFixed(filamentMeters >= 10 ? 1 : 2)} m`;
}

function formatPrintableArea(preview?: CatalogModelPreviewEntry | null) {
  if (!preview?.printableArea) return null;
  const { width, depth, height } = preview.printableArea;
  const base = `${Math.round(width)} x ${Math.round(depth)} mm`;
  return height ? `${base} x ${Math.round(height)} mm` : base;
}

function MetricPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-black/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-50/90">
      <span className="text-cyan-200">{icon}</span>
      <span className="text-white/58">{label}</span>
      <span className="text-white">{value}</span>
    </span>
  );
}

export function Product3MFViewer({ modelUrl, productName, preview }: Props) {
  const plates = preview?.plates || [];
  const [activePlate, setActivePlate] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const wheelAccumulatorRef = useRef(0);
  const wheelZoneRef = useRef<HTMLDivElement | null>(null);

  const currentPlate = plates[activePlate] || null;
  const views = useMemo(() => getPlateViews(currentPlate), [currentPlate]);
  const currentView = views.find((view) => view.key === viewMode) || views[0] || null;
  const currentSrc = currentView && currentPlate ? currentPlate[currentView.key] : "";
  const printableArea = formatPrintableArea(preview);
  const currentPrediction = formatPrediction(currentPlate?.predictionSeconds);
  const currentWeight = formatWeight(currentPlate?.weightGrams);
  const currentFilament = formatFilamentMeters(currentPlate?.filamentMeters);

  useEffect(() => {
    if (!currentView) return;
    if (currentView.key !== viewMode) {
      setViewMode(currentView.key);
    }
  }, [currentView, viewMode]);

  const handleWheelDelta = useCallback((deltaY: number) => {
    wheelAccumulatorRef.current += deltaY;
    if (Math.abs(wheelAccumulatorRef.current) < wheelThreshold) return;

    const direction = Math.sign(wheelAccumulatorRef.current);
    wheelAccumulatorRef.current = 0;

    setActivePlate((current) => {
      const next = current + direction;
      if (next < 0) return 0;
      if (next > plates.length - 1) return plates.length - 1;
      return next;
    });
  }, [plates.length]);

  useEffect(() => {
    const zone = wheelZoneRef.current;
    if (!zone || plates.length <= 1) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      handleWheelDelta(event.deltaY);
    };

    zone.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      zone.removeEventListener("wheel", onWheel);
    };
  }, [handleWheelDelta, plates.length]);

  const goToPlate = (index: number) => {
    wheelAccumulatorRef.current = 0;
    setActivePlate(index);
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/20 bg-[radial-gradient(circle_at_top_left,rgba(3,233,244,0.18),transparent_28%),linear-gradient(180deg,rgba(3,10,18,0.94),rgba(5,10,20,0.98))] shadow-[0_22px_70px_rgba(3,233,244,0.12)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_32%,rgba(123,44,191,0.08)_100%)]" />

      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/80">Bandejas reais do arquivo 3MF</p>
          <h3 className="mt-2 text-lg font-bold text-white">{productName}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {plates.length ? (
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-50">
              <Layers3 className="mr-2 inline h-4 w-4" />
              {plates.length} {plates.length === 1 ? "bandeja" : "bandejas"}
            </span>
          ) : null}
          <a href={modelUrl} download className="btn-glass text-xs">
            <Download className="h-4 w-4" />
            Baixar 3MF
          </a>
        </div>
      </div>

      <div className="relative grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div
          ref={wheelZoneRef}
          data-3mf-wheel-zone
          className="group relative overflow-hidden rounded-[28px] border border-cyan-300/22 bg-[linear-gradient(180deg,rgba(8,18,28,0.98),rgba(7,14,24,0.96))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_28px_70px_rgba(2,8,23,0.34)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(3,233,244,0.14),transparent_44%),linear-gradient(180deg,transparent,rgba(123,44,191,0.08))]" />
          <div className="relative flex flex-wrap items-center justify-between gap-3 px-1 pb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Visual de impressao</p>
              <p data-3mf-active-plate-label className="mt-2 text-sm font-semibold text-white">
                {plates.length ? `Bandeja ${activePlate + 1} de ${plates.length}` : "Preview do arquivo"}
              </p>
              {currentPlate?.name ? (
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-cyan-100/70">{currentPlate.name}</p>
              ) : null}
            </div>
            {plates.length > 1 ? (
              <div className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/72">
                <Mouse className="mr-2 inline h-4 w-4 text-cyan-200" />
                role o mouse para trocar
              </div>
            ) : null}
          </div>

          <div className="relative aspect-square overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(5,12,20,0.96),rgba(7,14,22,0.88))]">
            <div className="pointer-events-none absolute inset-5 rounded-[20px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(10,24,36,0.7),rgba(5,10,18,0.94))] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),0_0_0_1px_rgba(3,233,244,0.05)]" />
            {currentSrc ? (
              <Image
                src={currentSrc}
                alt={`${productName} - bandeja ${activePlate + 1}`}
                fill
                className="relative z-[1] object-contain p-6 transition-transform duration-500 group-hover:scale-[1.015]"
                sizes={mainViewerSizes}
                priority
              />
            ) : (
              <div className="relative z-[1] flex h-full items-center justify-center px-6 text-center text-sm leading-7 text-white/65">
                Este arquivo 3MF foi anexado, mas ainda nao trouxe a imagem de bandeja do fatiamento. O download continua disponivel.
              </div>
            )}
          </div>

          <div className="relative mt-4 flex flex-wrap gap-2">
            {views.map((view) => (
              <button
                key={view.key}
                type="button"
                onClick={() => setViewMode(view.key)}
                className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                  currentView?.key === view.key
                    ? "border-cyan-300/45 bg-cyan-300/12 text-cyan-50 shadow-[0_0_28px_rgba(3,233,244,0.18)]"
                    : "border-white/10 bg-white/5 text-white/72 hover:border-cyan-300/25 hover:text-cyan-50"
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          <div className="relative mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-white/62">
              <ScanSearch className="h-4 w-4 text-cyan-200" />
              preview salvo no proprio 3MF
            </span>
            {preview?.printerModel ? (
              <MetricPill icon={<Layers3 className="h-4 w-4" />} label="Printer" value={preview.printerModel} />
            ) : null}
            {printableArea ? (
              <MetricPill icon={<Waves className="h-4 w-4" />} label="Area" value={printableArea} />
            ) : null}
            {currentPrediction ? (
              <MetricPill icon={<Clock3 className="h-4 w-4" />} label="Tempo" value={currentPrediction} />
            ) : null}
            {currentWeight ? (
              <MetricPill icon={<Weight className="h-4 w-4" />} label="Peso" value={currentWeight} />
            ) : null}
            {currentFilament ? (
              <MetricPill icon={<Waves className="h-4 w-4" />} label="Filamento" value={currentFilament} />
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-[24px] border border-white/10 bg-black/22 p-4 text-sm leading-7 text-white/68">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Como funciona</p>
            <p className="mt-2">
              O site esta exibindo a bandeja real salva no arquivo da Bambu. Se o projeto tiver mais de uma placa, o
              scroll dentro do viewer desce ou sobe entre elas igual a uma pilha de tabuleiros.
            </p>
          </div>

          {plates.length ? (
            <div className="space-y-3">
              {plates.map((plate, index) => {
                const thumbSrc = plate.previewNoLight || plate.preview || plate.top || plate.pick;
                const thumbPrediction = formatPrediction(plate.predictionSeconds);
                const thumbWeight = formatWeight(plate.weightGrams);
                return (
                  <button
                    key={plate.index}
                    type="button"
                    onClick={() => goToPlate(index)}
                    className={`group block w-full overflow-hidden rounded-[24px] border text-left transition-all duration-300 ${
                      index === activePlate
                        ? "border-cyan-300/38 bg-cyan-300/10 shadow-[0_0_36px_rgba(3,233,244,0.15)]"
                        : "border-white/10 bg-white/5 hover:border-cyan-300/24 hover:bg-white/8"
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden border-b border-white/10 bg-[linear-gradient(180deg,rgba(7,14,22,0.94),rgba(6,12,18,0.96))]">
                      {thumbSrc ? (
                        <Image
                          src={thumbSrc}
                          alt={`${productName} - miniatura da bandeja ${plate.index}`}
                          fill
                          className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes={plateThumbSizes}
                        />
                      ) : null}
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold text-white">
                        {plate.name || `Bandeja ${plate.index}`}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/55">
                        {plate.previewNoLight ? "visual tecnico disponivel" : "visual principal do slicer"}
                      </p>
                      {thumbPrediction || thumbWeight ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {thumbPrediction ? (
                            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/75">
                              {thumbPrediction}
                            </span>
                          ) : null}
                          {thumbWeight ? (
                            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/75">
                              {thumbWeight}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-white/10 bg-black/22 p-4 text-sm leading-7 text-white/68">
              Nenhuma bandeja de slicing foi encontrada dentro deste 3MF. O arquivo continua disponivel para download.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

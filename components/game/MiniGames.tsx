"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Factory,
  Gauge,
  Layers,
  Package,
  Palette,
  Pause,
  Play,
  Puzzle,
  RotateCcw,
  Shield,
  Target,
  Trophy,
  Truck,
  Zap,
} from "lucide-react";

type RunState = "ready" | "running" | "paused" | "won" | "lost";
export type MiniGameId =
  | "filament-catcher"
  | "layer-stack"
  | "nozzle-dodge"
  | "bed-level-master"
  | "support-breaker"
  | "color-swap"
  | "delivery-dash-3d"
  | "stl-puzzle"
  | "print-tycoon-mini";

type Point = { x: number; y: number };

export const miniGameCatalog: Array<{
  id: MiniGameId;
  title: string;
  desc: string;
  icon: typeof Package;
  difficulty: string;
}> = [
  { id: "filament-catcher", title: "Filament Catcher", desc: "Pegue bobinas antes que toquem o chão.", icon: Package, difficulty: "Reflexo" },
  { id: "layer-stack", title: "Layer Stack", desc: "Empilhe camadas no timing certo.", icon: Layers, difficulty: "Precisão" },
  { id: "nozzle-dodge", title: "Nozzle Dodge", desc: "Desvie de falhas e mantenha a extrusão limpa.", icon: Zap, difficulty: "Ação" },
  { id: "bed-level-master", title: "Bed Level Master", desc: "Calibre a mesa sem perder aderência.", icon: Gauge, difficulty: "Técnico" },
  { id: "support-breaker", title: "Support Breaker", desc: "Remova suportes sem quebrar a peça.", icon: Shield, difficulty: "Memória" },
  { id: "color-swap", title: "Color Swap", desc: "Troque cores no ponto exato da camada.", icon: Palette, difficulty: "Ritmo" },
  { id: "delivery-dash-3d", title: "Delivery Dash 3D", desc: "Entregue pedidos antes do prazo acabar.", icon: Truck, difficulty: "Rota" },
  { id: "stl-puzzle", title: "STL Puzzle", desc: "Monte a peça certa a partir de pistas.", icon: Puzzle, difficulty: "Puzzle" },
  { id: "print-tycoon-mini", title: "Print Tycoon Mini", desc: "Gerencie pedidos e impressoras por 60s.", icon: Factory, difficulty: "Gestão" },
];

const palette = {
  cyan: "border-cyan-300/30 bg-cyan-300/15 text-cyan-100",
  emerald: "border-emerald-300/30 bg-emerald-300/15 text-emerald-100",
  amber: "border-amber-300/30 bg-amber-300/15 text-amber-100",
  rose: "border-rose-300/30 bg-rose-300/15 text-rose-100",
  violet: "border-violet-300/30 bg-violet-300/15 text-violet-100",
};

function samePoint(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function useGameKeys(enabled: boolean, handler: (event: KeyboardEvent) => void) {
  useEffect(() => {
    if (!enabled) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      handler(event);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, handler]);
}

function StatusPill({ state }: { state: RunState }) {
  const label =
    state === "ready" ? "Pronto" : state === "running" ? "Rodando" : state === "paused" ? "Pausado" : state === "won" ? "Concluído" : "Fim";
  const tone = state === "won" ? palette.emerald : state === "lost" ? palette.rose : state === "running" ? palette.cyan : palette.violet;
  return <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${tone}`}>{label}</span>;
}

function GameShell({
  title,
  desc,
  state,
  score,
  metric,
  children,
  onStart,
  onPause,
  onReset,
}: {
  title: string;
  desc: string;
  state: RunState;
  score: number;
  metric?: string;
  children: React.ReactNode;
  onStart: () => void;
  onPause?: () => void;
  onReset: () => void;
}) {
  return (
    <section data-mini-game={title} className="relative min-h-[620px] overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 p-4 text-white shadow-2xl sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_90%_18%,rgba(16,185,129,0.15),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.98))]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/backgrounds/grid-pattern.svg')] opacity-[0.05]" />

      <div className="relative grid gap-5 lg:grid-cols-[1fr_310px]">
        <div className="min-h-[520px] rounded-[24px] border border-white/10 bg-black/24 p-3 sm:p-4">{children}</div>

        <aside className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/70">Arcade MDH</p>
            <StatusPill state={state} />
          </div>
          <h2 className="mt-4 text-3xl font-black leading-tight text-white">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-white/62">{desc}</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-[16px] border border-white/10 bg-black/24 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">Pontos</p>
              <p className="mt-1 text-2xl font-black text-cyan-100">{score}</p>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-black/24 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">Meta</p>
              <p className="mt-1 text-lg font-black text-emerald-100">{metric || "Jogue"}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            {state === "ready" || state === "won" || state === "lost" ? (
              <button type="button" onClick={onStart} className="btn-primary justify-center gap-2 py-3">
                {state === "ready" ? <Play className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                {state === "ready" ? "Começar" : "Jogar novamente"}
              </button>
            ) : (
              <button type="button" onClick={onPause} className="btn-secondary justify-center gap-2 py-3">
                {state === "running" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {state === "running" ? "Pausar" : "Continuar"}
              </button>
            )}
            <button type="button" onClick={onReset} className="btn-glass justify-center gap-2 py-3 text-sm">
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </button>
          </div>

          <div className="mt-5 rounded-[18px] border border-white/10 bg-black/20 p-4 text-xs leading-6 text-white/58">
            Use teclado, botões na tela ou toque. Espaço nunca rola a página durante os jogos.
          </div>
        </aside>
      </div>
    </section>
  );
}

function Pad({ onMove }: { onMove: (dx: number, dy: number) => void }) {
  return (
    <div className="mx-auto mt-4 grid w-36 grid-cols-3 gap-2">
      <span />
      <button type="button" className="btn-glass justify-center p-3" onClick={() => onMove(0, -1)} aria-label="Cima"><ArrowUp className="h-4 w-4" /></button>
      <span />
      <button type="button" className="btn-glass justify-center p-3" onClick={() => onMove(-1, 0)} aria-label="Esquerda"><ArrowLeft className="h-4 w-4" /></button>
      <button type="button" className="btn-glass justify-center p-3" onClick={() => onMove(0, 1)} aria-label="Baixo"><ArrowDown className="h-4 w-4" /></button>
      <button type="button" className="btn-glass justify-center p-3" onClick={() => onMove(1, 0)} aria-label="Direita"><ArrowRight className="h-4 w-4" /></button>
    </div>
  );
}

function FilamentCatcherGame() {
  const [state, setState] = useState<RunState>("ready");
  const [player, setPlayer] = useState(2);
  const [items, setItems] = useState<Array<{ id: number; x: number; y: number; bad: boolean }>>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [tick, setTick] = useState(0);

  const start = useCallback(() => {
    setState("running");
    setPlayer(2);
    setItems([{ id: 1, x: 1, y: 0, bad: false }, { id: 2, x: 4, y: 1, bad: true }]);
    setScore(0);
    setLives(3);
    setTick(0);
  }, []);

  const move = useCallback((dx: number) => setPlayer((value) => clamp(value + dx, 0, 4)), []);
  useGameKeys(state === "running", useCallback((event) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
      event.preventDefault();
      move(1);
    }
  }, [move]));

  useEffect(() => {
    if (state !== "running") return undefined;
    const timer = window.setInterval(() => {
      setTick((value) => value + 1);
      setItems((current) => {
        const next = current.map((item) => ({ ...item, y: item.y + 1 }));
        const landed = next.filter((item) => item.y >= 6);
        const active = next.filter((item) => item.y < 6);
        landed.forEach((item) => {
          if (item.x === player && !item.bad) setScore((value) => value + 120);
          if (item.x === player && item.bad) setLives((value) => Math.max(0, value - 1));
          if (item.x !== player && !item.bad) setLives((value) => Math.max(0, value - 1));
        });
        const id = tick + current.length + 10;
        return tick % 2 === 0
          ? [...active, { id, x: (tick * 2 + 1) % 5, y: 0, bad: tick % 6 === 0 }]
          : active;
      });
    }, 520);
    return () => window.clearInterval(timer);
  }, [player, state, tick]);

  useEffect(() => {
    if (lives <= 0) setState("lost");
    if (score >= 1200) setState("won");
  }, [lives, score]);

  return (
    <GameShell title="Filament Catcher" desc="Mova a bandeja, pegue bobinas verdes e deixe os blobs vermelhos passarem." state={state} score={score} metric={`${lives} vidas`} onStart={start} onReset={start} onPause={() => setState((value) => (value === "running" ? "paused" : "running"))}>
      <div className="grid h-full min-h-[500px] grid-rows-[1fr_auto] gap-4">
        <div className="grid grid-cols-5 gap-2 rounded-[20px] border border-white/10 bg-black/30 p-3">
          {Array.from({ length: 35 }).map((_, index) => {
            const x = index % 5;
            const y = Math.floor(index / 5);
            const item = items.find((entry) => entry.x === x && entry.y === y);
            return (
              <div key={index} className="relative min-h-14 rounded-[14px] border border-white/8 bg-white/[0.035]">
                {item ? <span className={`absolute inset-3 rounded-full ${item.bad ? "bg-rose-400 shadow-[0_0_22px_rgba(251,113,133,0.55)]" : "bg-emerald-300 shadow-[0_0_22px_rgba(52,211,153,0.55)]"}`} /> : null}
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <button key={index} type="button" onClick={() => setPlayer(index)} className={`h-14 rounded-[16px] border transition ${player === index ? "border-cyan-300 bg-cyan-300/30 shadow-[0_0_24px_rgba(34,211,238,0.35)]" : "border-white/10 bg-white/5"}`} aria-label={`Mover para coluna ${index + 1}`}>
              {player === index ? <Package className="mx-auto h-6 w-6 text-cyan-100" /> : null}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

function LayerStackGame() {
  const [state, setState] = useState<RunState>("ready");
  const [score, setScore] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [direction, setDirection] = useState(1);
  const [layers, setLayers] = useState<Array<{ left: number; width: number }>>([]);
  const activeWidth = Math.max(2, 6 - Math.floor(layers.length / 3));

  const start = useCallback(() => {
    setState("running");
    setScore(0);
    setCursor(0);
    setDirection(1);
    setLayers([{ left: 2, width: 6 }]);
  }, []);

  const drop = useCallback(() => {
    if (state !== "running") return;
    const base = layers[layers.length - 1] || { left: 2, width: 6 };
    const left = cursor;
    const right = cursor + activeWidth;
    const overlapLeft = Math.max(left, base.left);
    const overlapRight = Math.min(right, base.left + base.width);
    const overlap = overlapRight - overlapLeft;
    if (overlap <= 0) {
      setState("lost");
      return;
    }
    const next = { left: overlapLeft, width: overlap };
    setLayers((items) => [...items, next].slice(-10));
    setScore((value) => value + overlap * 100);
    setCursor(0);
    if (layers.length >= 8) setState("won");
  }, [activeWidth, cursor, layers, state]);

  useGameKeys(state === "running", useCallback((event) => {
    if (event.code === "Space" || event.key === "Enter") {
      event.preventDefault();
      drop();
    }
  }, [drop]));

  useEffect(() => {
    if (state !== "running") return undefined;
    const timer = window.setInterval(() => {
      setCursor((value) => {
        const next = value + direction;
        if (next <= 0 || next + activeWidth >= 10) {
          setDirection((current) => current * -1);
          return clamp(next, 0, 10 - activeWidth);
        }
        return next;
      });
    }, Math.max(85, 150 - layers.length * 8));
    return () => window.clearInterval(timer);
  }, [activeWidth, direction, layers.length, state]);

  return (
    <GameShell title="Layer Stack" desc="Solte a camada quando estiver alinhada com a base. Quanto maior o encaixe, maior a pontuação." state={state} score={score} metric={`${layers.length}/10 camadas`} onStart={start} onReset={start} onPause={() => setState((value) => (value === "running" ? "paused" : "running"))}>
      <div className="flex h-full min-h-[500px] flex-col justify-end gap-2 rounded-[20px] border border-white/10 bg-black/30 p-5">
        <div className="mb-auto rounded-[16px] border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50">Espaço, Enter ou botão para soltar a camada móvel.</div>
        <div className="flex h-80 flex-col-reverse justify-start gap-1">
          {[...layers, state === "running" ? { left: cursor, width: activeWidth } : null].filter(Boolean).map((layer, index) => (
            <div key={index} className="grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }).map((_, cell) => (
                <span key={cell} className={`h-7 rounded-[8px] ${cell >= layer!.left && cell < layer!.left + layer!.width ? (index === layers.length ? "bg-cyan-300" : "bg-emerald-300") : "bg-white/[0.035]"}`} />
              ))}
            </div>
          ))}
        </div>
        <button type="button" onClick={drop} className="btn-primary justify-center py-3">Soltar camada</button>
      </div>
    </GameShell>
  );
}

function NozzleDodgeGame() {
  const [state, setState] = useState<RunState>("ready");
  const [player, setPlayer] = useState<Point>({ x: 3, y: 5 });
  const [hazards, setHazards] = useState<Point[]>([]);
  const [filament, setFilament] = useState<Point>({ x: 1, y: 1 });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [tick, setTick] = useState(0);

  const start = useCallback(() => {
    setState("running");
    setPlayer({ x: 3, y: 5 });
    setHazards([{ x: 2, y: 0 }, { x: 5, y: 2 }]);
    setFilament({ x: 1, y: 1 });
    setScore(0);
    setLives(3);
    setTick(0);
  }, []);

  const move = useCallback((dx: number, dy: number) => setPlayer((point) => ({ x: clamp(point.x + dx, 0, 6), y: clamp(point.y + dy, 0, 6) })), []);
  useGameKeys(state === "running", useCallback((event) => {
    const key = event.key.toLowerCase();
    if (event.key === "ArrowUp" || key === "w") { event.preventDefault(); move(0, -1); }
    if (event.key === "ArrowDown" || key === "s") { event.preventDefault(); move(0, 1); }
    if (event.key === "ArrowLeft" || key === "a") { event.preventDefault(); move(-1, 0); }
    if (event.key === "ArrowRight" || key === "d") { event.preventDefault(); move(1, 0); }
  }, [move]));

  useEffect(() => {
    if (state !== "running") return undefined;
    const timer = window.setInterval(() => {
      setTick((value) => value + 1);
      setScore((value) => value + 5);
      setHazards((items) => {
        const moved = items.map((item) => ({ x: item.x, y: item.y + 1 })).filter((item) => item.y <= 6);
        return tick % 2 === 0 ? [...moved, { x: (tick * 3 + 2) % 7, y: 0 }] : moved;
      });
    }, 430);
    return () => window.clearInterval(timer);
  }, [state, tick]);

  useEffect(() => {
    if (hazards.some((item) => samePoint(item, player))) {
      setLives((value) => Math.max(0, value - 1));
      setHazards((items) => items.filter((item) => !samePoint(item, player)));
    }
    if (samePoint(player, filament)) {
      setScore((value) => value + 150);
      setFilament({ x: (filament.x + 4) % 7, y: (filament.y + 2) % 7 });
    }
  }, [filament, hazards, player]);

  useEffect(() => {
    if (lives <= 0) setState("lost");
    if (score >= 1500) setState("won");
  }, [lives, score]);

  return (
    <GameShell title="Nozzle Dodge" desc="Controle o bico de impressão, colete energia e desvie das falhas vermelhas." state={state} score={score} metric={`${lives} vidas`} onStart={start} onReset={start} onPause={() => setState((value) => (value === "running" ? "paused" : "running"))}>
      <div className="grid h-full min-h-[500px] content-center">
        <div className="mx-auto grid w-full max-w-[560px] grid-cols-7 gap-2 rounded-[20px] border border-white/10 bg-black/30 p-3">
          {Array.from({ length: 49 }).map((_, index) => {
            const point = { x: index % 7, y: Math.floor(index / 7) };
            const isPlayer = samePoint(point, player);
            const isHazard = hazards.some((item) => samePoint(item, point));
            const isFilament = samePoint(point, filament);
            return (
              <button key={index} type="button" onClick={() => setPlayer(point)} className="relative aspect-square rounded-[14px] border border-white/8 bg-white/[0.035]">
                {isHazard ? <AlertTriangle className="absolute inset-0 m-auto h-6 w-6 text-rose-300" /> : null}
                {isFilament ? <Zap className="absolute inset-0 m-auto h-6 w-6 fill-emerald-300 text-emerald-300" /> : null}
                {isPlayer ? <Target className="absolute inset-0 m-auto h-8 w-8 text-cyan-200 drop-shadow-[0_0_14px_rgba(34,211,238,0.9)]" /> : null}
              </button>
            );
          })}
        </div>
        <Pad onMove={move} />
      </div>
    </GameShell>
  );
}

function BedLevelGame() {
  const [state, setState] = useState<RunState>("ready");
  const [selected, setSelected] = useState(4);
  const [levels, setLevels] = useState([18, -12, 22, -16, 14, -24, 20, -18, 10]);

  const score = levels.reduce((sum, value) => sum + Math.max(0, 100 - Math.abs(value) * 4), 0);
  const calibrated = levels.every((value) => Math.abs(value) <= 3);
  const start = useCallback(() => {
    setState("running");
    setSelected(4);
    setLevels([18, -12, 22, -16, 14, -24, 20, -18, 10]);
  }, []);
  const tune = useCallback(() => {
    if (state !== "running") return;
    setLevels((items) => items.map((value, index) => (index === selected ? Math.trunc(value * 0.45) : value)));
  }, [selected, state]);
  const moveSelection = useCallback((dx: number, dy: number) => {
    setSelected((value) => clamp((Math.floor(value / 3) + dy), 0, 2) * 3 + clamp((value % 3) + dx, 0, 2));
  }, []);

  useGameKeys(state === "running", useCallback((event) => {
    const key = event.key.toLowerCase();
    if (event.code === "Space" || event.key === "Enter") { event.preventDefault(); tune(); }
    if (event.key === "ArrowUp" || key === "w") { event.preventDefault(); moveSelection(0, -1); }
    if (event.key === "ArrowDown" || key === "s") { event.preventDefault(); moveSelection(0, 1); }
    if (event.key === "ArrowLeft" || key === "a") { event.preventDefault(); moveSelection(-1, 0); }
    if (event.key === "ArrowRight" || key === "d") { event.preventDefault(); moveSelection(1, 0); }
  }, [moveSelection, tune]));

  useEffect(() => {
    if (calibrated && state === "running") setState("won");
  }, [calibrated, state]);

  return (
    <GameShell title="Bed Level Master" desc="Escolha cada ponto da mesa e calibre até todos ficarem no centro verde." state={state} score={score} metric={calibrated ? "nivelada" : "±3 alvo"} onStart={start} onReset={start} onPause={() => setState((value) => (value === "running" ? "paused" : "running"))}>
      <div className="grid h-full min-h-[500px] place-items-center">
        <div>
          <div className="grid max-w-[540px] grid-cols-3 gap-3 rounded-[24px] border border-white/10 bg-black/30 p-4">
            {levels.map((value, index) => (
              <button key={index} type="button" onClick={() => setSelected(index)} className={`aspect-square rounded-[18px] border p-3 transition ${selected === index ? "border-cyan-300 bg-cyan-300/15" : "border-white/10 bg-white/[0.035]"}`}>
                <span className={`flex h-full items-center justify-center rounded-[14px] text-xl font-black ${Math.abs(value) <= 3 ? "bg-emerald-300/20 text-emerald-100" : value > 0 ? "bg-amber-300/20 text-amber-100" : "bg-rose-300/20 text-rose-100"}`}>
                  {value > 0 ? "+" : ""}{value}
                </span>
              </button>
            ))}
          </div>
          <button type="button" onClick={tune} className="btn-primary mx-auto mt-5 justify-center px-8 py-3">Calibrar ponto</button>
          <Pad onMove={moveSelection} />
        </div>
      </div>
    </GameShell>
  );
}

function SupportBreakerGame() {
  const [state, setState] = useState<RunState>("ready");
  const [supports, setSupports] = useState<Array<{ id: number; critical: boolean; removed: boolean }>>([]);
  const [target, setTarget] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const start = useCallback(() => {
    setState("running");
    setScore(0);
    setLives(3);
    setTarget(0);
    setSupports(Array.from({ length: 25 }).map((_, index) => ({ id: index, critical: [6, 12, 18].includes(index), removed: false })));
  }, []);

  const remove = useCallback((id: number) => {
    if (state !== "running") return;
    const support = supports.find((item) => item.id === id);
    if (!support || support.removed) return;
    if (support.critical || id !== target) {
      setLives((value) => Math.max(0, value - 1));
      return;
    }
    setSupports((items) => items.map((item) => (item.id === id ? { ...item, removed: true } : item)));
    setScore((value) => value + 120);
    const next = supports.find((item) => !item.removed && !item.critical && item.id !== id);
    if (next) setTarget(next.id);
    else setState("won");
  }, [state, supports, target]);

  useEffect(() => {
    if (lives <= 0) setState("lost");
  }, [lives]);

  useGameKeys(state === "running", useCallback((event) => {
    if (event.code === "Space" || event.key === "Enter") {
      event.preventDefault();
      remove(target);
    }
  }, [remove, target]));

  return (
    <GameShell title="Support Breaker" desc="Remova apenas o suporte destacado. Os suportes vermelhos seguram a peça e não podem quebrar." state={state} score={score} metric={`${lives} vidas`} onStart={start} onReset={start} onPause={() => setState((value) => (value === "running" ? "paused" : "running"))}>
      <div className="grid h-full min-h-[500px] place-items-center">
        <div className="grid max-w-[540px] grid-cols-5 gap-3 rounded-[24px] border border-white/10 bg-black/30 p-5">
          {supports.map((support) => (
            <button key={support.id} type="button" onClick={() => remove(support.id)} disabled={support.removed} className={`aspect-square rounded-[16px] border transition ${support.removed ? "border-white/5 bg-white/[0.02] opacity-20" : support.critical ? "border-rose-300/35 bg-rose-300/15" : support.id === target ? "border-cyan-300 bg-cyan-300/25 shadow-[0_0_22px_rgba(34,211,238,0.35)]" : "border-white/10 bg-white/[0.055]"}`}>
              {support.removed ? <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-200" /> : <Shield className="mx-auto h-6 w-6 text-white/70" />}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

function ColorSwapGame() {
  const colors = useMemo(() => [
    { id: "cyan", label: "Ciano", className: "bg-cyan-300", text: "text-cyan-100" },
    { id: "emerald", label: "Verde", className: "bg-emerald-300", text: "text-emerald-100" },
    { id: "rose", label: "Rosa", className: "bg-rose-300", text: "text-rose-100" },
  ], []);
  const [state, setState] = useState<RunState>("ready");
  const [active, setActive] = useState(0);
  const [chip, setChip] = useState({ color: 0, row: 0 });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(0);

  const start = useCallback(() => {
    setState("running");
    setActive(0);
    setChip({ color: 1, row: 0 });
    setScore(0);
    setLives(3);
    setRound(0);
  }, []);

  useGameKeys(state === "running", useCallback((event) => {
    if (["1", "2", "3"].includes(event.key)) {
      event.preventDefault();
      setActive(Number(event.key) - 1);
    }
    if (event.key === "ArrowLeft") { event.preventDefault(); setActive((value) => clamp(value - 1, 0, 2)); }
    if (event.key === "ArrowRight") { event.preventDefault(); setActive((value) => clamp(value + 1, 0, 2)); }
  }, []));

  useEffect(() => {
    if (state !== "running") return undefined;
    const timer = window.setInterval(() => {
      setChip((current) => {
        if (current.row >= 5) {
          if (current.color === active) setScore((value) => value + 150);
          else setLives((value) => Math.max(0, value - 1));
          setRound((value) => value + 1);
          return { color: (round + 2) % 3, row: 0 };
        }
        return { ...current, row: current.row + 1 };
      });
    }, 430);
    return () => window.clearInterval(timer);
  }, [active, round, state]);

  useEffect(() => {
    if (lives <= 0) setState("lost");
    if (score >= 1500) setState("won");
  }, [lives, score]);

  return (
    <GameShell title="Color Swap" desc="Troque a cor do extrusor antes que o chip chegue ao bico." state={state} score={score} metric={`${lives} vidas`} onStart={start} onReset={start} onPause={() => setState((value) => (value === "running" ? "paused" : "running"))}>
      <div className="grid h-full min-h-[500px] place-items-center">
        <div className="w-full max-w-[520px] rounded-[24px] border border-white/10 bg-black/30 p-5">
          <div className="grid grid-rows-6 gap-2">
            {Array.from({ length: 6 }).map((_, row) => (
              <div key={row} className="grid grid-cols-3 gap-2">
                {colors.map((color, index) => (
                  <span key={color.id} className="relative h-14 rounded-[14px] border border-white/8 bg-white/[0.035]">
                    {chip.row === row && chip.color === index ? <span className={`absolute inset-3 rounded-full ${color.className} shadow-[0_0_22px_rgba(255,255,255,0.28)]`} /> : null}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {colors.map((color, index) => (
              <button key={color.id} type="button" onClick={() => setActive(index)} className={`rounded-[16px] border p-4 font-black ${active === index ? "border-white/45 bg-white/15" : "border-white/10 bg-white/5"} ${color.text}`}>
                <span className={`mr-2 inline-block h-3 w-3 rounded-full ${color.className}`} />
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameShell>
  );
}

function DeliveryDashGame() {
  const [state, setState] = useState<RunState>("ready");
  const [player, setPlayer] = useState<Point>({ x: 0, y: 6 });
  const [customer, setCustomer] = useState<Point>({ x: 6, y: 0 });
  const [hasPackage, setHasPackage] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(45);
  const printer = useMemo(() => ({ x: 0, y: 6 }), []);
  const blockers = useMemo(() => [{ x: 2, y: 2 }, { x: 4, y: 1 }, { x: 3, y: 4 }, { x: 5, y: 5 }], []);

  const start = useCallback(() => {
    setState("running");
    setPlayer({ x: 0, y: 6 });
    setCustomer({ x: 6, y: 0 });
    setHasPackage(false);
    setScore(0);
    setTime(45);
  }, []);

  const move = useCallback((dx: number, dy: number) => {
    if (state !== "running") return;
    setPlayer((point) => {
      const next = { x: clamp(point.x + dx, 0, 6), y: clamp(point.y + dy, 0, 6) };
      return blockers.some((item) => samePoint(item, next)) ? point : next;
    });
  }, [blockers, state]);

  useGameKeys(state === "running", useCallback((event) => {
    const key = event.key.toLowerCase();
    if (event.key === "ArrowUp" || key === "w") { event.preventDefault(); move(0, -1); }
    if (event.key === "ArrowDown" || key === "s") { event.preventDefault(); move(0, 1); }
    if (event.key === "ArrowLeft" || key === "a") { event.preventDefault(); move(-1, 0); }
    if (event.key === "ArrowRight" || key === "d") { event.preventDefault(); move(1, 0); }
  }, [move]));

  useEffect(() => {
    if (state !== "running") return undefined;
    const timer = window.setInterval(() => setTime((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (time <= 0) setState(score >= 600 ? "won" : "lost");
  }, [score, time]);

  useEffect(() => {
    if (samePoint(player, printer)) setHasPackage(true);
    if (hasPackage && samePoint(player, customer)) {
      setScore((value) => value + 200);
      setHasPackage(false);
      setCustomer((current) => ({ x: (current.x + 3) % 7, y: (current.y + 4) % 7 }));
    }
  }, [customer, hasPackage, player, printer]);

  return (
    <GameShell title="Delivery Dash 3D" desc="Pegue pedidos na impressora e leve até o cliente desviando dos atrasos." state={state} score={score} metric={`${time}s`} onStart={start} onReset={start} onPause={() => setState((value) => (value === "running" ? "paused" : "running"))}>
      <div className="grid h-full min-h-[500px] content-center">
        <div className="mx-auto grid w-full max-w-[560px] grid-cols-7 gap-2 rounded-[20px] border border-white/10 bg-black/30 p-3">
          {Array.from({ length: 49 }).map((_, index) => {
            const point = { x: index % 7, y: Math.floor(index / 7) };
            return (
              <button key={index} type="button" onClick={() => !blockers.some((item) => samePoint(item, point)) && setPlayer(point)} className="relative aspect-square rounded-[14px] border border-white/8 bg-white/[0.035]">
                {samePoint(point, printer) ? <Factory className="absolute inset-0 m-auto h-6 w-6 text-cyan-200" /> : null}
                {samePoint(point, customer) ? <Trophy className="absolute inset-0 m-auto h-6 w-6 text-emerald-200" /> : null}
                {blockers.some((item) => samePoint(item, point)) ? <AlertTriangle className="absolute inset-0 m-auto h-5 w-5 text-amber-200" /> : null}
                {samePoint(point, player) ? <Truck className="absolute inset-0 m-auto h-8 w-8 text-white drop-shadow-[0_0_14px_rgba(34,211,238,0.9)]" /> : null}
              </button>
            );
          })}
        </div>
        <div className="mt-4 text-center text-sm font-bold text-white/65">{hasPackage ? "Pedido carregado. Vá até o cliente." : "Volte à impressora para pegar um pedido."}</div>
        <Pad onMove={move} />
      </div>
    </GameShell>
  );
}

function StlPuzzleGame() {
  const solved = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 0], []);
  const [state, setState] = useState<RunState>("ready");
  const [tiles, setTiles] = useState([1, 2, 3, 4, 5, 6, 0, 7, 8]);
  const [moves, setMoves] = useState(0);
  const won = tiles.every((value, index) => value === solved[index]);
  const start = useCallback(() => {
    setState("running");
    setTiles([1, 2, 3, 4, 5, 6, 0, 7, 8]);
    setMoves(0);
  }, []);
  const slide = useCallback((index: number) => {
    if (state !== "running") return;
    const blank = tiles.indexOf(0);
    const adjacent = [blank - 1, blank + 1, blank - 3, blank + 3].includes(index) && Math.abs((blank % 3) - (index % 3)) + Math.abs(Math.floor(blank / 3) - Math.floor(index / 3)) === 1;
    if (!adjacent) return;
    setTiles((items) => {
      const next = [...items];
      [next[blank], next[index]] = [next[index], next[blank]];
      return next;
    });
    setMoves((value) => value + 1);
  }, [state, tiles]);

  useEffect(() => {
    if (won && state === "running") setState("won");
  }, [state, won]);

  useGameKeys(state === "running", useCallback((event) => {
    const blank = tiles.indexOf(0);
    const map: Record<string, number> = { ArrowUp: blank + 3, ArrowDown: blank - 3, ArrowLeft: blank + 1, ArrowRight: blank - 1 };
    const index = map[event.key];
    if (typeof index === "number") {
      event.preventDefault();
      slide(index);
    }
  }, [slide, tiles]));

  return (
    <GameShell title="STL Puzzle" desc="Deslize os fragmentos até recompor o arquivo STL na ordem correta." state={state} score={Math.max(0, 1200 - moves * 30)} metric={`${moves} movimentos`} onStart={start} onReset={start} onPause={() => setState((value) => (value === "running" ? "paused" : "running"))}>
      <div className="grid h-full min-h-[500px] place-items-center">
        <div className="grid max-w-[520px] grid-cols-3 gap-3 rounded-[24px] border border-white/10 bg-black/30 p-5">
          {tiles.map((value, index) => (
            <button key={`${value}-${index}`} type="button" onClick={() => slide(index)} className={`aspect-square rounded-[18px] border text-4xl font-black transition ${value === 0 ? "border-dashed border-white/12 bg-white/[0.02]" : "border-cyan-300/25 bg-cyan-300/15 text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.12)]"}`}>
              {value || ""}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

function PrintTycoonGame() {
  const [state, setState] = useState<RunState>("ready");
  const [time, setTime] = useState(60);
  const [cash, setCash] = useState(0);
  const [orders, setOrders] = useState([80, 120, 160, 100]);
  const [printers, setPrinters] = useState<Array<{ progress: number; value: number | null }>>([
    { progress: 0, value: null },
    { progress: 0, value: null },
    { progress: 0, value: null },
  ]);

  const start = useCallback(() => {
    setState("running");
    setTime(60);
    setCash(0);
    setOrders([80, 120, 160, 100]);
    setPrinters([{ progress: 0, value: null }, { progress: 0, value: null }, { progress: 0, value: null }]);
  }, []);

  const startPrinter = useCallback((index: number) => {
    if (state !== "running" || !orders.length) return;
    setPrinters((items) => {
      if (items[index].value !== null) return items;
      const [order] = orders;
      setOrders((queue) => queue.slice(1));
      return items.map((item, itemIndex) => (itemIndex === index ? { progress: 0, value: order } : item));
    });
  }, [orders, state]);

  const ship = useCallback((index: number) => {
    const printer = printers[index];
    if (printer.value === null || printer.progress < 100) return;
    setCash((value) => value + printer.value!);
    setPrinters((items) => items.map((item, itemIndex) => (itemIndex === index ? { progress: 0, value: null } : item)));
    setOrders((queue) => [...queue, 90 + ((cash + index * 40) % 120)]);
  }, [cash, printers]);

  useEffect(() => {
    if (state !== "running") return undefined;
    const timer = window.setInterval(() => {
      setTime((value) => value - 1);
      setPrinters((items) => items.map((item) => item.value === null ? item : { ...item, progress: Math.min(100, item.progress + 10) }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (time <= 0) setState(cash >= 900 ? "won" : "lost");
  }, [cash, time]);

  return (
    <GameShell title="Print Tycoon Mini" desc="Aceite pedidos, rode impressoras e envie peças prontas antes do relógio zerar." state={state} score={cash} metric={`${time}s`} onStart={start} onReset={start} onPause={() => setState((value) => (value === "running" ? "paused" : "running"))}>
      <div className="grid h-full min-h-[500px] content-center gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          {printers.map((printer, index) => (
            <div key={index} className="rounded-[22px] border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between">
                <Factory className="h-6 w-6 text-cyan-200" />
                <span className="text-xs font-black uppercase tracking-widest text-white/40">P{index + 1}</span>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full bg-emerald-300 transition-all" style={{ width: `${printer.progress}%` }} />
              </div>
              <p className="mt-3 text-sm text-white/60">{printer.value ? `Pedido R$ ${printer.value}` : "Livre"}</p>
              <button type="button" onClick={() => printer.value ? ship(index) : startPrinter(index)} className="btn-glass mt-4 w-full justify-center text-sm">
                {printer.value && printer.progress >= 100 ? "Enviar" : printer.value ? "Produzindo" : "Iniciar"}
              </button>
            </div>
          ))}
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
          <p className="text-xs font-black uppercase tracking-widest text-white/45">Fila de pedidos</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {orders.map((order, index) => (
              <span key={`${order}-${index}`} className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-sm font-bold text-amber-100">R$ {order}</span>
            ))}
          </div>
        </div>
      </div>
    </GameShell>
  );
}

export function MiniGame({ gameId }: { gameId: MiniGameId }) {
  if (gameId === "filament-catcher") return <FilamentCatcherGame />;
  if (gameId === "layer-stack") return <LayerStackGame />;
  if (gameId === "nozzle-dodge") return <NozzleDodgeGame />;
  if (gameId === "bed-level-master") return <BedLevelGame />;
  if (gameId === "support-breaker") return <SupportBreakerGame />;
  if (gameId === "color-swap") return <ColorSwapGame />;
  if (gameId === "delivery-dash-3d") return <DeliveryDashGame />;
  if (gameId === "stl-puzzle") return <StlPuzzleGame />;
  return <PrintTycoonGame />;
}

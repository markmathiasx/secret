"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircleMore, Pause, Play, RotateCcw } from "lucide-react";
import { whatsappNumber } from "@/lib/constants";

const GRID = 9;
const INITIAL_TIME = 45;

type Point = { x: number; y: number };
type GameState = "ready" | "running" | "paused" | "gameover";

function samePoint(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y;
}

function randomPoint(excluded: Point[] = []) {
  for (let tries = 0; tries < 30; tries += 1) {
    const point = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!excluded.some((item) => samePoint(item, point))) return point;
  }
  return { x: 0, y: 0 };
}

function clamp(value: number) {
  return Math.min(GRID - 1, Math.max(0, value));
}

export function PrintQuestGame() {
  const [state, setState] = useState<GameState>("ready");
  const [player, setPlayer] = useState<Point>({ x: 4, y: 4 });
  const [filaments, setFilaments] = useState<Point[]>(() => [{ x: 2, y: 2 }, { x: 6, y: 3 }, { x: 4, y: 7 }]);
  const [failures, setFailures] = useState<Point[]>(() => [{ x: 1, y: 6 }, { x: 7, y: 6 }]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);

  const whatsappHref = useMemo(() => {
    const text = `Fiz ${score} pontos no Print Quest e quero meu desconto manual. Link: https://www.mdh3d.com.br/jogue`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  }, [score]);

  const reset = useCallback(() => {
    setPlayer({ x: 4, y: 4 });
    setFilaments([{ x: 2, y: 2 }, { x: 6, y: 3 }, { x: 4, y: 7 }]);
    setFailures([{ x: 1, y: 6 }, { x: 7, y: 6 }]);
    setScore(0);
    setCombo(1);
    setTimeLeft(INITIAL_TIME);
    setState("running");
  }, []);

  const move = useCallback(
    (dx: number, dy: number) => {
      if (state !== "running") return;
      setPlayer((current) => ({ x: clamp(current.x + dx), y: clamp(current.y + dy) }));
    },
    [state]
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        setState((value) => (value === "running" ? "paused" : value === "paused" ? "running" : value));
        return;
      }
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
        event.preventDefault();
        move(0, -1);
      }
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        event.preventDefault();
        move(0, 1);
      }
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        move(-1, 0);
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        event.preventDefault();
        move(1, 0);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move]);

  useEffect(() => {
    if (state !== "running") return undefined;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          setState("gameover");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (state !== "running") return;
    const hitFilament = filaments.find((item) => samePoint(item, player));
    if (hitFilament) {
      setScore((value) => value + 10 * combo);
      setCombo((value) => Math.min(value + 1, 9));
      setFilaments((items) => items.map((item) => (samePoint(item, hitFilament) ? randomPoint([player, ...failures]) : item)));
    }
    const hitFailure = failures.some((item) => samePoint(item, player));
    if (hitFailure) {
      setScore((value) => Math.max(0, value - 18));
      setCombo(1);
      setFailures((items) => items.map((item) => (samePoint(item, player) ? randomPoint([player, ...filaments]) : item)));
    }
  }, [combo, failures, filaments, player, state]);

  return (
    <section data-print-quest-game="true" className="relative overflow-hidden rounded-[8px] border border-white/12 bg-[#071016] p-4 text-white shadow-[0_28px_90px_rgba(0,0,0,0.32)] sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_10%,rgba(16,185,129,0.22),transparent_32%),radial-gradient(circle_at_78%_14%,rgba(34,211,238,0.18),transparent_34%)]" />
      <div className="mdh-cad-grid pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[8px] border border-white/10 bg-black/22 p-3">
          <div className="grid aspect-square max-h-[680px] w-full gap-1" style={{ gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))` }} role="application" aria-label="Print Quest">
            {Array.from({ length: GRID * GRID }).map((_, index) => {
              const point = { x: index % GRID, y: Math.floor(index / GRID) };
              const isPlayer = samePoint(point, player);
              const isFilament = filaments.some((item) => samePoint(item, point));
              const isFailure = failures.some((item) => samePoint(item, point));
              return (
                <div
                  key={`${point.x}-${point.y}`}
                  className={`relative rounded-[6px] border border-white/8 bg-white/[0.035] ${isPlayer ? "shadow-[0_0_24px_rgba(16,185,129,0.55)]" : ""}`}
                >
                  {isFilament ? <span className="absolute inset-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.6)]" aria-hidden="true" /> : null}
                  {isFailure ? <span className="absolute inset-3 rounded-[4px] bg-rose-400/90 shadow-[0_0_16px_rgba(251,113,133,0.45)]" aria-hidden="true" /> : null}
                  {isPlayer ? (
                    <span className="absolute inset-x-1 bottom-1 top-2 rounded-t-full border border-emerald-100/60 bg-emerald-300" aria-label="Cabeçote de impressão" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="relative rounded-[8px] border border-white/10 bg-white/[0.055] p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100/70">Mini-game original</p>
          <h1 className="mt-2 text-4xl font-black leading-none">Print Quest</h1>
          <p className="mt-3 text-sm leading-6 text-white/66">Controle o cabeçote, colete filamento e evite falhas antes do tempo acabar.</p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-[8px] border border-white/10 bg-black/24 p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Pontos</p>
              <p className="mt-1 text-2xl font-black">{score}</p>
            </div>
            <div className="rounded-[8px] border border-white/10 bg-black/24 p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Combo</p>
              <p className="mt-1 text-2xl font-black">x{combo}</p>
            </div>
            <div className="rounded-[8px] border border-white/10 bg-black/24 p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Tempo</p>
              <p className="mt-1 text-2xl font-black">{timeLeft}s</p>
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            {state === "ready" || state === "gameover" ? (
              <button type="button" onClick={reset} className="btn-primary justify-center gap-2">
                {state === "ready" ? <Play className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                {state === "ready" ? "Jogar" : "Jogar novamente"}
              </button>
            ) : (
              <button type="button" onClick={() => setState((value) => (value === "running" ? "paused" : "running"))} className="btn-secondary justify-center gap-2">
                {state === "running" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {state === "running" ? "Pausar" : "Continuar"}
              </button>
            )}
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-whatsapp justify-center gap-2">
              <MessageCircleMore className="h-4 w-4" />
              Fiz {score} pontos no Print Quest e quero meu desconto manual
            </a>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-[260px]">
            <span />
            <button type="button" onClick={() => move(0, -1)} className="btn-glass justify-center px-3 py-3" aria-label="Mover para cima">↑</button>
            <span />
            <button type="button" onClick={() => move(-1, 0)} className="btn-glass justify-center px-3 py-3" aria-label="Mover para esquerda">←</button>
            <button type="button" onClick={() => move(0, 1)} className="btn-glass justify-center px-3 py-3" aria-label="Mover para baixo">↓</button>
            <button type="button" onClick={() => move(1, 0)} className="btn-glass justify-center px-3 py-3" aria-label="Mover para direita">→</button>
          </div>

          {state === "gameover" ? (
            <div className="mt-5 rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50" role="status">
              Fim de rodada. Envie seu resultado no WhatsApp para atendimento manual.
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

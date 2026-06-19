"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Gamepad2, Info, Play, Sparkles, Star, Trophy, Zap } from "lucide-react";
import { GameKeyboardGuard } from "@/components/game/GameKeyboardGuard";
import { MiniGame, miniGameCatalog, type MiniGameId } from "@/components/game/MiniGames";
import { PrintRunner } from "@/components/game/PrintRunner";
import { PinballStar } from "@/components/games/PinballStar";
import { trackCommerceEvent } from "@/lib/analytics/events";

type ArcadeGameId = "hub" | "pinball-star" | "print-runner" | MiniGameId;

type ArcadeCard = {
  id: Exclude<ArcadeGameId, "hub">;
  title: string;
  desc: string;
  badge: string;
  icon: typeof Gamepad2;
};

const featuredGames: ArcadeCard[] = [
  {
    id: "pinball-star",
    title: "Pinball Star",
    desc: "Mesa neon em Canvas 2D com flippers, bumpers, targets STAR, score, vidas e recorde local.",
    badge: "Novo destaque",
    icon: Star,
  },
  {
    id: "print-runner",
    title: "Print Runner 3D",
    desc: "Desvie de falhas de impressão, colete filamento e mantenha o bico quente.",
    badge: "Runner",
    icon: Zap,
  },
];

function ArcadeButton({ game, onPlay }: { game: ArcadeCard; onPlay: (id: ArcadeCard["id"]) => void }) {
  return (
    <button
      type="button"
      data-game-card={game.id}
      onClick={() => onPlay(game.id)}
      className="group relative overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.055] p-5 text-left shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-200/34 hover:bg-cyan-300/[0.08] focus:outline-none focus:ring-2 focus:ring-cyan-200"
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(3,233,244,0.18),transparent_38%),radial-gradient(circle_at_88%_0%,rgba(255,43,214,0.16),transparent_36%)] opacity-0 transition group-hover:opacity-100" />
      <span className="relative flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-[8px] border border-cyan-200/20 bg-cyan-300/10 text-cyan-100 shadow-[inset_0_0_20px_rgba(3,233,244,0.14)]">
          <game.icon className="h-5 w-5" />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">
          <Play className="h-3 w-3 fill-emerald-100" />
          Jogar
        </span>
      </span>
      <span className="relative mt-5 block text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/70">
        {game.badge}
      </span>
      <span className="relative mt-2 block font-display text-2xl font-black tracking-normal text-white">
        {game.title}
      </span>
      <span className="relative mt-2 block text-sm leading-6 text-white/62">{game.desc}</span>
    </button>
  );
}

export function ArcadeHub() {
  const [activeGame, setActiveGame] = useState<ArcadeGameId>("hub");

  const allGames = useMemo<ArcadeCard[]>(
    () => [
      ...featuredGames,
      ...miniGameCatalog.map((game) => ({
        id: game.id,
        title: game.title,
        desc: game.desc,
        badge: game.difficulty,
        icon: game.icon,
      })),
    ],
    [],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeGame]);

  function playGame(gameId: Exclude<ArcadeGameId, "hub">) {
    trackCommerceEvent("game_play_started", { game_id: gameId });
    setActiveGame(gameId);
  }

  useEffect(() => {
    if (activeGame === "hub") return;

    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
      bodyHeight: body.style.height,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.height = "100vh";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.overscrollBehavior = previous.bodyOverscrollBehavior;
      body.style.height = previous.bodyHeight;
    };
  }, [activeGame]);

  if (activeGame !== "hub") {
    const gameTitle = allGames.find((game) => game.id === activeGame)?.title ?? "Arcade MDH 3D";

    return (
      <main data-active-game={activeGame} className="relative min-h-screen bg-[#02050b] text-white">
        <GameKeyboardGuard />
        <button
          type="button"
          onClick={() => setActiveGame("hub")}
          className="fixed left-4 top-4 z-[80] inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-white/14 bg-black/62 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_16px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl transition hover:border-cyan-200/45 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-200"
          aria-label={`Voltar ao arcade a partir de ${gameTitle}`}
        >
          <ChevronLeft className="h-4 w-4" />
          Arcade
        </button>

        {activeGame === "pinball-star" ? <PinballStar /> : null}
        {activeGame === "print-runner" ? <PrintRunner /> : null}
        {activeGame !== "pinball-star" && activeGame !== "print-runner" ? <MiniGame gameId={activeGame} /> : null}
      </main>
    );
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#02050b] px-4 pb-14 pt-24 text-white sm:px-6 lg:px-8">
      <GameKeyboardGuard />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(3,233,244,0.22),transparent_28%),radial-gradient(circle_at_82%_10%,rgba(255,43,214,0.2),transparent_26%),linear-gradient(180deg,#02050b_0%,#081121_52%,#02050b_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(3,233,244,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(3,233,244,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />

      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/18 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/80">
              <Gamepad2 className="h-3.5 w-3.5" />
              Arcade MDH 3D
            </div>
            <h1 className="mt-4 font-display text-5xl font-black leading-none tracking-normal text-white md:text-7xl">
              Play <span className="text-cyan-300">MDH</span> 3D
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white md:text-lg">
              Pinball Star continua como destaque principal e os mini-games de impressão 3D voltaram para o catálogo jogável.
            </p>
          </div>

          <div className="rounded-[8px] border border-pink-300/20 bg-pink-300/10 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-pink-100/80">
              <Sparkles className="h-4 w-4" />
              Biblioteca restaurada
            </p>
            <p className="mt-3 text-sm leading-6 text-white/66">
              11 experiências ativas: Pinball, Runner e 9 desafios de manufatura aditiva. Nenhum card fica indisponível.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {featuredGames.map((game) => (
            <ArcadeButton key={game.id} game={game} onPlay={playGame} />
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {allGames.slice(featuredGames.length).map((game) => (
            <ArcadeButton key={game.id} game={game} onPlay={playGame} />
          ))}
        </div>

        <aside className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[8px] border border-white/12 bg-white/[0.055] p-5 backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-white/72">
              <Trophy className="h-4 w-4 text-cyan-200" />
              Ranking Semanal
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {["MakerRJ", "3D_Expert", "FilamentMaster", "Gamer3D", "NozzleKing"].map((name, index) => (
                <div key={name} className="rounded-[8px] border border-white/8 bg-black/24 px-3 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100/60">#{index + 1}</p>
                  <p className="mt-1 text-sm font-bold text-white/84">{name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[8px] border border-cyan-300/18 bg-cyan-300/10 p-5 backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100">
              <Info className="h-4 w-4" />
              Vantagens VIP
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/66">
              Recordes altos continuam vinculados a benefícios comerciais da MDH 3D, incluindo cupons e atendimento VIP.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

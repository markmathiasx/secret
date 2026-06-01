"use client";

import { useEffect, useState } from "react";
import { Zap, Trophy, Play, Info } from "lucide-react";
import { MiniGame, miniGameCatalog, type MiniGameId } from "./MiniGames";
import { PrintRunner } from "./PrintRunner";

type GameId = "hub" | "print-runner" | MiniGameId;

export function GameHub() {
  const [activeGame, setActiveGame] = useState<GameId>("hub");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeGame]);

  if (activeGame !== "hub") {
    const gameTitle =
      activeGame === "print-runner"
        ? "Print Runner 3D"
        : miniGameCatalog.find((game) => game.id === activeGame)?.title ?? "Mini-game";

    return (
      <div
        data-active-game={activeGame}
        className="relative min-h-[600px] w-full overflow-hidden rounded-[32px] bg-slate-950 border border-white/10 shadow-2xl"
      >
        <button
          onClick={() => setActiveGame("hub")}
          className="absolute top-4 left-4 z-50 btn-glass px-4 py-2 text-xs font-bold"
          aria-label={`Voltar ao arcade a partir de ${gameTitle}`}
        >
          ← Voltar ao arcade
        </button>
        {activeGame === "print-runner" ? <PrintRunner /> : <MiniGame gameId={activeGame} />}
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.4fr]">
      <div className="space-y-6">
        <div className="glass-panel p-8 md:p-10 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-200">
              <Zap className="h-3 w-3 fill-cyan-300" />
              Destaque do mês
            </div>

            <h2 className="mt-4 text-4xl md:text-5xl font-black text-white leading-tight">
              Print Runner <span className="text-cyan-400">3D</span>
            </h2>

            <p className="mt-4 text-lg text-white/60 max-w-xl leading-relaxed">
              Desvie de falhas de impressão, colete filamento e mantenha o bico quente neste runner viciante com temática de fábrica 3D.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => setActiveGame("print-runner")}
                className="btn-primary px-8 py-4 text-lg font-black group"
              >
                <Play className="mr-2 h-5 w-5 fill-slate-950 transition-transform group-hover:scale-110" />
                Jogar agora
              </button>

              <div className="inline-flex items-center gap-6 px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Recorde</p>
                  <p className="text-xl font-black text-white">2.450</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Dificuldade</p>
                  <p className="text-xl font-black text-emerald-400">Easy</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {miniGameCatalog.map((game) => (
            <button
              key={game.id}
              data-game-card={game.id}
              onClick={() => setActiveGame(game.id)}
              className="glass-panel group p-6 border-white/5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 transition-colors group-hover:border-cyan-300/30 group-hover:bg-cyan-300/15">
                  <game.icon className="h-5 w-5 text-white/50 transition-colors group-hover:text-cyan-100" />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-200">
                  <Play className="h-3 w-3 fill-emerald-200" />
                  Jogar
                </span>
              </div>
              <h3 className="mt-4 text-xl font-black text-white">{game.title}</h3>
              <p className="mt-2 text-sm text-white/40">{game.desc}</p>
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-cyan-200/70">{game.difficulty}</p>
            </button>
          ))}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="glass-panel p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Ranking Semanal
          </h3>
          <div className="space-y-3">
            {[
              { name: "MakerRJ", score: 15400 },
              { name: "3D_Expert", score: 12100 },
              { name: "FilamentMaster", score: 9800 },
              { name: "Gamer3D", score: 8500 },
              { name: "NozzleKing", score: 7200 },
            ].map((user, i) => (
              <div key={user.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black ${i === 0 ? 'text-cyan-400' : 'text-white/20'}`}>#{i + 1}</span>
                  <span className="text-sm font-bold text-white/80">{user.name}</span>
                </div>
                <span className="text-sm font-black text-white">{user.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 bg-cyan-400/5 border-cyan-400/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Vantagens VIP
          </h3>
          <p className="mt-3 text-xs leading-relaxed text-white/60">
            Makers com recordes acima de 5.000 pontos no Print Runner ganham cupons exclusivos de frete grátis no WhatsApp.
          </p>
        </div>
      </aside>
    </div>
  );
}

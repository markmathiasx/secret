"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Zap, AlertTriangle, Trophy, RotateCcw, Gamepad2 } from "lucide-react";

const PLAYER_SIZE = 40;
const OBSTACLE_WIDTH = 30;
const FILAMENT_SIZE = 25;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const SPEED_BASE = 5;

export function PrintRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Game objects
  const player = useRef({ y: 0, velocity: 0, jumping: false });
  const obstacles = useRef<any[]>([]);
  const filaments = useRef<any[]>([]);
  const frame = useRef(0);
  const speed = useRef(SPEED_BASE);

  const resetGame = useCallback(() => {
    setScore(0);
    setGameState("playing");
    player.current = { y: 0, velocity: 0, jumping: false };
    obstacles.current = [];
    filaments.current = [];
    frame.current = 0;
    speed.current = SPEED_BASE;
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const groundY = canvas.height - 60;
    player.current.y = groundY - PLAYER_SIZE;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame.current++;

      // Background lines (speed feel)
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        const x = (i * 100 - (frame.current * 2) % 100);
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + 50, groundY);
        ctx.stroke();
      }

      // Ground
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.strokeRect(0, groundY, canvas.width, 2);

      // Player (3D Nozzle style)
      player.current.velocity += GRAVITY;
      player.current.y += player.current.velocity;

      if (player.current.y > groundY - PLAYER_SIZE) {
        player.current.y = groundY - PLAYER_SIZE;
        player.current.velocity = 0;
        player.current.jumping = false;
      }

      // Draw Nozzle (Player)
      ctx.fillStyle = "#22d3ee"; // cyan-400
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(34, 211, 238, 0.5)";
      ctx.beginPath();
      ctx.moveTo(50, player.current.y);
      ctx.lineTo(50 + PLAYER_SIZE, player.current.y);
      ctx.lineTo(50 + PLAYER_SIZE / 2, player.current.y + PLAYER_SIZE);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Spawning logic
      if (frame.current % 100 === 0) {
        speed.current += 0.1;
        obstacles.current.push({
          x: canvas.width,
          height: 30 + Math.random() * 40,
          type: "blob"
        });
      }

      if (frame.current % 150 === 0) {
        filaments.current.push({
          x: canvas.width,
          y: groundY - 100 - Math.random() * 100
        });
      }

      // Update and draw obstacles (Print Failures)
      ctx.fillStyle = "#fb7185"; // rose-400
      obstacles.current.forEach((obs, i) => {
        obs.x -= speed.current;
        ctx.fillRect(obs.x, groundY - obs.height, OBSTACLE_WIDTH, obs.height);

        // Collision check
        if (
          obs.x < 50 + PLAYER_SIZE &&
          obs.x + OBSTACLE_WIDTH > 50 &&
          player.current.y + PLAYER_SIZE > groundY - obs.height
        ) {
          setGameState("gameover");
        }
      });

      // Update and draw filaments (Points)
      ctx.fillStyle = "#34d399"; // emerald-400
      filaments.current.forEach((fil, i) => {
        fil.x -= speed.current;
        ctx.beginPath();
        ctx.arc(fil.x, fil.y, FILAMENT_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();

        // Collision check
        if (
          Math.abs(fil.x - (50 + PLAYER_SIZE / 2)) < PLAYER_SIZE &&
          Math.abs(fil.y - (player.current.y + PLAYER_SIZE / 2)) < PLAYER_SIZE
        ) {
          setScore(s => s + 100);
          filaments.current.splice(i, 1);
        }
      });

      // Cleanup offscreen
      if (obstacles.current[0]?.x < -50) obstacles.current.shift();
      if (filaments.current[0]?.x < -50) filaments.current.shift();

      setScore(s => s + 1);
      animationId = requestAnimationFrame(gameLoop);
    };

    const jump = () => {
      if (!player.current.jumping) {
        player.current.velocity = JUMP_FORCE;
        player.current.jumping = true;
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        jump();
      }
    };
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      jump();
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("touchstart", handleTouchStart);

    animationId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("touchstart", handleTouchStart);
    };
  }, [gameState, resetGame]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 select-none">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="max-w-full rounded-2xl bg-slate-900 border border-white/10"
        />

        {gameState === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm">
            <Gamepad2 className="h-16 w-16 text-cyan-400 mb-4 animate-bounce" />
            <h2 className="text-3xl font-black text-white">PRINTER RUNNER</h2>
            <p className="mt-2 text-white/60">Pressione Espaço ou Toque para pular</p>
            <button onClick={resetGame} className="btn-primary mt-6 px-8 py-3 font-black">COMEÇAR</button>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/80 rounded-2xl backdrop-blur-sm">
            <AlertTriangle className="h-16 w-16 text-rose-400 mb-4" />
            <h2 className="text-3xl font-black text-white">FALHA NA IMPRESSÃO!</h2>
            <p className="mt-1 text-rose-200">Score: {Math.floor(score)}</p>
            <button onClick={resetGame} className="btn-primary mt-6 px-8 py-3 font-black bg-rose-500 hover:bg-rose-400">
              <RotateCcw className="mr-2 h-5 w-5" />
              TENTAR DE NOVO
            </button>
          </div>
        )}

        <div className="absolute top-4 right-6 flex gap-6 text-white font-black drop-shadow-lg">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Score</span>
            <span className="text-2xl text-cyan-400">{Math.floor(score)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Best</span>
            <span className="text-2xl text-emerald-400">{Math.floor(highScore)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-2xl">
        <div className="glass-panel p-4 flex items-center gap-3">
          <Zap className="h-5 w-5 text-cyan-400" />
          <div className="text-xs">
            <p className="font-black text-white">PULAR</p>
            <p className="text-white/40">Espaço / Toque</p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-3">
          <Trophy className="h-5 w-5 text-emerald-400" />
          <div className="text-xs">
            <p className="font-black text-white">COLETAR</p>
            <p className="text-white/40">Filamento verde</p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
          <div className="text-xs">
            <p className="font-black text-white">DESVIAR</p>
            <p className="text-white/40">Blobs vermelhos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "mdh_entry_gate_seen";

export function HomeEntryGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEY) === "1";
    setOpen(!seen);
  }, []);

  function closeGate() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 p-5 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-[32px] border border-white/15 bg-[#060912]/95 p-7 shadow-2xl">
        <div className="flex items-center gap-4">
          <Image
            src="/logo-mdh.jpg"
            alt="MDH 3D"
            width={84}
            height={84}
            className="rounded-[22px] border border-white/15 object-cover"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Entrada premium</p>
            <h2 className="mt-2 text-2xl font-black text-white">Bem-vindo a MDH 3D</h2>
            <p className="mt-2 text-sm leading-7 text-white/68">
              Entre com Google para salvar favoritos e acompanhar pedidos, ou continue como visitante para explorar toda a vitrine publica.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/login"
            onClick={closeGate}
            className="rounded-full bg-cyan-400 px-5 py-3 text-center text-sm font-semibold text-slate-950"
          >
            Entrar com Google
          </Link>
          <button
            onClick={closeGate}
            className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
          >
            Continuar como visitante
          </button>
        </div>
      </div>
    </div>
  );
}

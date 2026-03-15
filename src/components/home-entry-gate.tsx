"use client";

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
=======
import { useEffect, useState } from "react";
import Link from "next/link";
>>>>>>> theirs
=======
import { useEffect, useState } from "react";
import Link from "next/link";
>>>>>>> theirs
=======
import { useEffect, useState } from "react";
import Link from "next/link";
>>>>>>> theirs
=======
import { useEffect, useState } from "react";
import Link from "next/link";
>>>>>>> theirs

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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
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
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/88 p-5 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[30px] border border-white/15 bg-black/55 p-7 text-center shadow-2xl">
        <img src="/logo-mdh.jpg" alt="MDH 3D" className="mx-auto h-20 w-20 rounded-2xl border border-white/20 object-cover" />
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-cyan-200">Bem-vindo à MDH 3D</p>
        <h2 className="mt-2 text-2xl font-black text-white">Peças premium em impressão 3D no Rio</h2>
        <p className="mt-3 text-sm leading-7 text-white/70">Entre para personalizar sua experiência ou continue como visitante para explorar o catálogo.</p>

        <div className="mt-6 grid gap-3">
          <Link href="/login" onClick={closeGate} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
            Entrar com Google
          </Link>
          <button onClick={closeGate} className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
            Continuar como visitante
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

type Notification = {
  id: string;
  channel: string;
  status: string;
  createdAt: string;
};

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => n.status !== "READ").length;

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        if (Array.isArray(data?.notifications)) {
          setNotifications(data.notifications);
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    try {
      await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
    } catch {
      // ignore
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative rounded-full border border-white/10 bg-white/5 p-2 transition hover:border-cyan-300/30"
        title="Notificações"
      >
        <Bell className="h-4 w-4 text-white/70" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[9px] font-bold text-slate-950">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-[20px] border border-white/10 bg-slate-950/95 p-3 shadow-[0_16px_48px_rgba(2,8,23,0.6)] backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Notificações</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-cyan-300 hover:underline">
                Marcar como lidas
              </button>
            )}
          </div>

          {loading && <p className="py-4 text-center text-xs text-white/40">Carregando…</p>}

          {!loading && notifications.length === 0 && (
            <p className="py-4 text-center text-xs text-white/40">Nenhuma notificação.</p>
          )}

          <div className="max-h-60 space-y-1 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-[14px] border px-3 py-2 text-xs ${n.status === "READ" ? "border-white/5 bg-white/[0.02] text-white/40" : "border-cyan-300/20 bg-cyan-300/8 text-white/80"}`}
              >
                <p className="font-medium">{n.channel}</p>
                <p className="mt-0.5 text-white/40">{new Date(n.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, MessageCircleMore, ShieldCheck, UserRound } from "lucide-react";
import { supportEmail, whatsappMessage, whatsappNumber } from "@/lib/constants";

type PublicLoginPageProps = {
  initialMode?: "login" | "register";
  redirectTo?: string;
  loggedOut?: boolean;
};

type AuthMode = "login" | "register";

export function PublicLoginPage({
  initialMode = "login",
  redirectTo = "/conta",
  loggedOut = false
}: PublicLoginPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const whatsappHref = useMemo(
    () => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
    []
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (mode === "register" && password !== confirmPassword) {
      setStatus("error");
      setMessage("Confirme a mesma senha nos dois campos.");
      return;
    }

    try {
      const response = await fetch(mode === "register" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          next: redirectTo
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(data?.error || "Nao consegui concluir sua autenticacao agora.");
        return;
      }

      window.location.href = data?.redirectTo || redirectTo;
    } catch {
      setStatus("error");
      setMessage("Nao consegui falar com a API da conta agora. Tente novamente em instantes.");
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Conta MDH 3D</p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Entre para repetir pedidos, salvar seus dados e acompanhar compras com mais rapidez.
        </h1>
        <p className="mt-4 text-white/65">
          O fluxo principal da loja continua guest-first, mas a conta propria da plataforma agora usa email, senha e
          sessao persistente para facilitar recompras e acompanhamento.
        </p>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Acesso principal</p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                {mode === "register" ? "Criar conta da plataforma" : "Entrar na sua conta"}
              </h2>
            </div>

            <div className="inline-flex rounded-full border border-white/10 bg-black/20 p-1">
              {([
                { id: "login", label: "Entrar" },
                { id: "register", label: "Cadastrar" }
              ] as const).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMode(item.id);
                    setMessage("");
                    setStatus("idle");
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    mode === item.id
                      ? "bg-cyan-400 text-slate-950"
                      : "text-white/68 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loggedOut ? (
            <p className="mt-5 rounded-[22px] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100/90">
              Sessao encerrada com sucesso.
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "register" ? (
              <label className="block">
                <span className="text-sm text-white/70">Nome completo</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  type="text"
                  required
                  autoComplete="name"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="text-sm text-white/70">E-mail</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                autoComplete="email"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm text-white/70">Senha</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                minLength={8}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
            </label>

            {mode === "register" ? (
              <label className="block">
                <span className="text-sm text-white/70">Confirmar senha</span>
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                />
              </label>
            ) : null}

            <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-xs leading-6 text-white/48">
              Sua sessao usa cookie seguro e HttpOnly, persiste por cerca de 30 dias e so sai quando voce clicar em
              logout ou quando o prazo realmente expirar.
            </div>

            {status === "error" ? <p className="text-sm text-rose-200">{message}</p> : null}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-60"
            >
              {status === "loading"
                ? mode === "register"
                  ? "Criando conta..."
                  : "Entrando..."
                : mode === "register"
                  ? "Criar conta"
                  : "Entrar"}
            </button>
          </form>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3 text-white">
              <LockKeyhole className="h-5 w-5 text-cyan-200" />
              <h3 className="font-semibold">Google continua opcional</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/60">
              O login principal agora e email + senha da propria plataforma. O social fica como camada secundaria e pode
              ser ligado depois sem mexer no checkout, pedidos ou painel.
            </p>
            <button
              type="button"
              disabled
              className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/45"
            >
              Continuar com Google em breve
            </button>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Conta + compra</p>
          <h2 className="mt-2 text-2xl font-bold text-white">A conta ajuda, mas nao trava a venda.</h2>
          <p className="mt-3 text-sm leading-7 text-white/60">
            Quem quiser compra sem cadastro obrigatorio. Quem criar conta ganha uma base mais pratica para recomprar,
            revisar dados e acompanhar pedidos em um lugar unico.
          </p>

          <div className="mt-6 grid gap-3">
            {[
              {
                icon: UserRound,
                title: "Dados mais rapidos no checkout",
                text: "Nome e e-mail ja entram preenchidos para reduzir atrito."
              },
              {
                icon: Mail,
                title: "Historico da conta",
                text: "Os pedidos podem aparecer na conta quando estiverem ligados ao seu cliente."
              },
              {
                icon: ShieldCheck,
                title: "Sessao persistente",
                text: "Refresh e reabertura do navegador nao derrubam a conta se a sessao ainda estiver valida."
              }
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <item.icon className="h-5 w-5 text-cyan-200" />
                <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/58">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <a
              href={whatsappHref}
              className="flex items-center justify-between rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-white"
            >
              <div>
                <p className="text-sm font-semibold">Atendimento direto no WhatsApp</p>
                <p className="text-xs text-white/65">Tire duvidas sem perder o contexto da loja</p>
              </div>
              <MessageCircleMore className="h-5 w-5" />
            </a>

            <Link
              href="/catalogo"
              className="flex items-center justify-between rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-white"
            >
              <div>
                <p className="text-sm font-semibold">Continuar comprando sem conta</p>
                <p className="text-xs text-white/65">O checkout guest continua como caminho principal da venda</p>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/acompanhar-pedido"
              className="flex items-center justify-between rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-white"
            >
              <div>
                <p className="text-sm font-semibold">Acompanhar um pedido</p>
                <p className="text-xs text-white/65">Use numero do pedido + e-mail ou WhatsApp</p>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/60">
            <p className="font-semibold text-white">Suporte da loja</p>
            <p className="mt-2">Se algo travar no cadastro ou no login, escreva para {supportEmail} ou siga pelo WhatsApp.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

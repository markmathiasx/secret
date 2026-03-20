"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Heart, History, MessageSquareShare, ShieldCheck } from "lucide-react";
import { emitCustomerAuthChange, fetchCustomerSession } from "@/lib/customer-session-client";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const passwordRules = [
  { id: "length", label: "Pelo menos 8 caracteres", test: (value: string) => value.length >= 8 },
  { id: "upper-lower", label: "Letras maiusculas e minusculas", test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { id: "number", label: "Pelo menos 1 numero", test: (value: string) => /\d/.test(value) },
  { id: "special", label: "Pelo menos 1 simbolo", test: (value: string) => /[^A-Za-z0-9]/.test(value) }
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const passwordStatus = useMemo(
    () => passwordRules.map((item) => ({ ...item, ok: item.test(password) })),
    [password]
  );
  const passwordScore = passwordStatus.filter((item) => item.ok).length;
  const passwordStrength = useMemo(() => {
    if (!password) {
      return { label: "Defina uma senha forte", tone: "bg-white/20", text: "text-white/60", progress: 0 };
    }

    if (passwordScore <= 1) {
      return { label: "Senha fraca", tone: "bg-rose-400", text: "text-rose-100", progress: 25 };
    }

    if (passwordScore <= 2) {
      return { label: "Senha media", tone: "bg-amber-300", text: "text-amber-100", progress: 50 };
    }

    if (passwordScore <= 3) {
      return { label: "Senha forte", tone: "bg-cyan-300", text: "text-cyan-100", progress: 75 };
    }

    return { label: "Senha excelente", tone: "bg-emerald-300", text: "text-emerald-100", progress: 100 };
  }, [password, passwordScore]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const remembered = window.localStorage.getItem("mdh-login-remember");
    const cachedEmail = window.localStorage.getItem("mdh-login-email");

    if (remembered === "0") {
      setRememberEmail(false);
      return;
    }

    if (cachedEmail) {
      setEmail(cachedEmail);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("mdh-login-remember", rememberEmail ? "1" : "0");
    if (rememberEmail && email.trim()) {
      window.localStorage.setItem("mdh-login-email", email.trim());
      return;
    }
    window.localStorage.removeItem("mdh-login-email");
  }, [email, rememberEmail]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === "register" && password !== confirmPassword) {
      setError("A confirmação da senha não confere.");
      return;
    }

    if (mode === "register" && passwordScore < 3) {
      setError("Use uma senha mais forte para proteger sua conta.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(mode === "register" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "register"
            ? { displayName, email, password }
            : { email, password }
        )
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.error || "Não foi possível concluir o acesso.");
        return;
      }

      const session = await fetchCustomerSession();
      if (!session.user) {
        setError("A conta foi validada, mas o navegador ainda não confirmou a sessão. Atualize a página ou tente entrar novamente.");
        return;
      }

      emitCustomerAuthChange();
      setSuccess(mode === "register" ? "Conta criada com sucesso." : "Login concluído com sucesso.");
      router.replace("/conta");
      router.refresh();
    } catch {
      setError("Erro de rede ao validar seu acesso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Conta MDH 3D</p>
        <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Entre para acompanhar favoritos, orçamentos e pedidos.</h1>
        <p className="mt-4 text-base leading-8 text-white/68">
          O catálogo continua aberto para visitantes, mas a conta deixa a experiência mais pessoal e organizada para quem volta com frequência.
        </p>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Acesso</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Conta com e-mail e senha</h2>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100">
              Até 100 contas iniciais
            </span>
          </div>

          <p className="mt-4 text-sm leading-7 text-white/62">
            Cadastre um login direto no site para salvar favoritos, reencontrar orçamentos e voltar sem depender de Google ou outro provedor.
          </p>

          <div className="mt-6 flex rounded-full border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-white text-slate-950" : "text-white/70"}`}
            >
              Criar conta
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-white text-slate-950" : "text-white/70"}`}
            >
              Entrar
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "register" ? (
              <label className="block">
                <span className="text-sm text-white/70">Seu nome</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
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
              <div className="relative mt-2">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 pr-12 text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 inline-flex items-center px-4 text-white/60"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {mode === "register" ? (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm text-white/70">Confirmar senha</span>
                  <div className="relative mt-2">
                    <input
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 pr-12 text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute inset-y-0 right-0 inline-flex items-center px-4 text-white/60"
                      aria-label={showConfirmPassword ? "Ocultar confirmacao de senha" : "Mostrar confirmacao de senha"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/55">Forca da senha</p>
                    <p className={`text-xs font-semibold ${passwordStrength.text}`}>{passwordStrength.label}</p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full ${passwordStrength.tone}`} style={{ width: `${passwordStrength.progress}%` }} />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {passwordStatus.map((item) => (
                      <p key={item.id} className={`text-xs ${item.ok ? "text-emerald-200" : "text-white/55"}`}>
                        {item.ok ? "OK" : "Pendente"} - {item.label}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="rounded-[26px] border border-cyan-300/20 bg-cyan-300/10 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-100" />
                <div>
                  <p className="text-sm font-semibold text-cyan-50">Armazenamento seguro</p>
                  <p className="mt-1 text-sm leading-6 text-cyan-100/78">
                    A senha fica protegida por hash no servidor e a sua sessão roda em cookie seguro, sem expor a credencial no navegador.
                  </p>
                </div>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={(event) => setRememberEmail(event.target.checked)}
                className="h-4 w-4 accent-cyan-300"
              />
              Lembrar meu e-mail neste dispositivo
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-70"
            >
              {loading ? "Validando..." : mode === "register" ? "Criar minha conta" : "Entrar na minha conta"}
            </button>
          </form>

          {error ? <p className="mt-4 text-sm text-amber-100">{error}</p> : null}
          {success ? (
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </p>
          ) : null}

          <div className="mt-8 rounded-[26px] border border-white/10 bg-black/20 p-5">
            <p className="text-sm font-semibold text-white">Não quer entrar agora?</p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Continue navegando como visitante e use o WhatsApp sempre que quiser fechar um pedido mais rápido.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/catalogo" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                Continuar como visitante
              </Link>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-4 py-2 text-sm font-semibold text-emerald-100">
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-violet-200">O que muda ao entrar</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Uma conta leve, útil e feita para voltar.</h2>

          <div className="mt-6 space-y-4">
            {[
              {
                icon: Heart,
                title: "Favoritos",
                text: "Salve peças que você quer comparar antes de fechar o pedido."
              },
              {
                icon: History,
                title: "Histórico",
                text: "Acompanhe os próximos passos de orçamentos e pedidos conforme o fluxo evolui."
              },
              {
                icon: MessageSquareShare,
                title: "Atalhos de conta",
                text: "Reencontre rápido seus canais de compra, suporte e itens vistos recentemente."
              }
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <item.icon className="h-5 w-5 text-cyan-200" />
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/60">{item.text}</p>
              </div>
            ))}
          </div>

          <Link href="/conta" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
            Ver página da conta
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, Lock, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { OtpInput } from "@/components/otp-input";

type Step = "phone" | "code" | "password" | "done";

const OTP_DURATION = 10 * 60; // 10 minutes in seconds
const RESEND_COOLDOWN = 60;   // seconds before resend is allowed

function PhoneInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  function format(raw: string) {
    const d = raw.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    return d;
  }

  return (
    <input
      type="tel"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(format(e.target.value))}
      placeholder="(21) 92013-7249"
      className="field-base"
      required
    />
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ caracteres", ok: password.length >= 8 },
    { label: "Letra maiúscula", ok: /[A-Z]/.test(password) },
    { label: "Letra minúscula", ok: /[a-z]/.test(password) },
    { label: "Número", ok: /\d/.test(password) },
  ];
  const passed = checks.filter((c) => c.ok).length;
  const color = passed < 2 ? "bg-red-400" : passed < 4 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {checks.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < passed ? color : "bg-white/10"}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map((c) => (
          <span key={c.label} className={`text-xs ${c.ok ? "text-emerald-400" : "text-white/40"}`}>
            {c.ok ? "✓" : "·"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function WhatsAppRecoveryPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulated, setSimulated] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [fallbackLink, setFallbackLink] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION);
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // OTP countdown timer
  useEffect(() => {
    if (step !== "code") return;
    setSecondsLeft(OTP_DURATION);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [step]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  function formatTime(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  async function requestOTP(phoneArg?: string) {
    const p = phoneArg ?? phone;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/password-reset/whatsapp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: p }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.message ?? "Erro ao enviar código."); return; }

      setSimulated(data.simulated ?? false);
      setFallbackLink(data.fallbackLink ?? null);
      setDevCode(data.devCode ?? null);
      setStep("code");
      setResendCooldown(RESEND_COOLDOWN);
    } catch {
      setError("Falha de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    if (code.length < 6) { setError("Digite os 6 dígitos do código."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/password-reset/whatsapp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, newPassword: "placeholder_verify_only" }),
      });
      const data = await res.json().catch(() => ({}));
      // We send a dummy password here just to verify the code — real password is in next step
      // If the backend returns "pelo menos 8 caracteres" that means the code was accepted
      if (res.ok || (data.message ?? "").includes("caractere") || (data.message ?? "").includes("maiúscula")) {
        setStep("password");
      } else {
        setError(data.message ?? "Código incorreto.");
      }
    } catch {
      setError("Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/password-reset/whatsapp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStep("done");
      } else {
        setError(data.message ?? "Erro ao redefinir senha.");
        // Code may have expired — send back to code step
        if ((data.message ?? "").includes("expirado") || (data.message ?? "").includes("inválido")) {
          setCode("");
          setStep("code");
        }
      }
    } catch {
      setError("Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step: Done ──────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <section className="mx-auto max-w-md px-6 py-20">
        <div className="glass-panel p-8 text-center space-y-4">
          <CheckCircle className="mx-auto h-14 w-14 text-emerald-400" />
          <h1 className="text-2xl font-black text-white">Senha redefinida!</h1>
          <p className="text-sm text-white/60">Sua nova senha foi salva. Você já pode entrar na sua conta.</p>
          <Link href="/login" className="btn-primary w-full justify-center mt-4 block">
            Entrar agora
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <div className="glass-panel p-8 md:p-10 space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Acesso MDH 3D</p>
          <h1 className="mt-2 text-3xl font-black text-white flex items-center gap-2">
            <MessageCircle className="h-7 w-7 text-green-400 shrink-0" />
            Recuperar via WhatsApp
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {step === "phone" && "Informe o WhatsApp cadastrado na sua conta."}
            {step === "code" && `Digite o código de 6 dígitos enviado para ${phone}.`}
            {step === "password" && "Código verificado. Crie sua nova senha."}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {(["phone", "code", "password"] as const).map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${
              s === step ? "bg-cyan-400" :
              ["phone", "code", "password"].indexOf(step) > i ? "bg-cyan-400/40" : "bg-white/10"
            }`} />
          ))}
        </div>

        {/* ── Step 1: Phone ── */}
        {step === "phone" && (
          <form onSubmit={(e) => { e.preventDefault(); requestOTP(); }} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-white/70">Número do WhatsApp</span>
              <PhoneInput value={phone} onChange={setPhone} />
            </label>
            {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
            <button type="submit" disabled={loading || phone.replace(/\D/g, "").length < 10} className="btn-primary w-full justify-center">
              {loading ? "Enviando…" : "Enviar código"}
            </button>
          </form>
        )}

        {/* ── Step 2: Code ── */}
        {step === "code" && (
          <div className="space-y-5">
            {/* Dev mode: show code */}
            {devCode && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/8 px-4 py-3 text-sm text-amber-300">
                <span className="font-semibold">Dev mode:</span> código = <span className="font-mono font-bold">{devCode}</span>
              </div>
            )}

            {/* Simulated fallback */}
            {simulated && fallbackLink && !devCode && (
              <a
                href={fallbackLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/8 px-4 py-3 text-sm text-green-300 hover:bg-green-400/12 transition"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                Não recebeu? Clique para obter o código via suporte
              </a>
            )}

            <OtpInput value={code} onChange={setCode} disabled={loading || secondsLeft === 0} />

            {/* Countdown */}
            <div className="text-center" aria-live="polite">
              {secondsLeft > 0 ? (
                <p className="text-xs text-white/40">
                  Código expira em <span className="font-mono text-white/60">{formatTime(secondsLeft)}</span>
                </p>
              ) : (
                <p className="text-xs text-rose-300">Código expirado. Solicite um novo abaixo.</p>
              )}
            </div>

            {error && <p role="alert" className="text-sm text-rose-300 text-center">{error}</p>}

            <button
              onClick={verifyCode}
              disabled={loading || code.length < 6 || secondsLeft === 0}
              className="btn-primary w-full justify-center"
            >
              {loading ? "Verificando…" : "Confirmar código"}
            </button>

            {/* Resend */}
            <div className="text-center">
              {resendCooldown > 0 ? (
                <p className="text-xs text-white/30">
                  Reenviar disponível em <span className="font-mono">{resendCooldown}s</span>
                </p>
              ) : (
                <button
                  onClick={() => { setCode(""); requestOTP(); }}
                  className="flex items-center gap-1.5 mx-auto text-xs text-cyan-300 hover:text-cyan-200 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reenviar código
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: New Password ── */}
        {step === "password" && (
          <form onSubmit={resetPassword} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-white/70">Nova senha</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                className="field-base"
                required
              />
              <PasswordStrength password={newPassword} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-white/70">Confirmar senha</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                className="field-base"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-rose-300">As senhas não coincidem.</p>
              )}
            </label>
            {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
            <button
              type="submit"
              disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
              className="btn-primary w-full justify-center"
            >
              <Lock className="h-4 w-4" />
              {loading ? "Salvando…" : "Salvar nova senha"}
            </button>
          </form>
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-between pt-2 border-t border-white/8">
          {step === "phone" ? (
            <Link href="/recuperar-senha" className="flex items-center gap-1 text-sm text-white/50 hover:text-white/70 transition">
              <ArrowLeft className="h-4 w-4" />
              Recuperar por e-mail
            </Link>
          ) : (
            <button
              onClick={() => { setStep(step === "password" ? "code" : "phone"); setError(null); }}
              className="flex items-center gap-1 text-sm text-white/50 hover:text-white/70 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          )}
          <Link href="/login" className="text-sm text-white/40 hover:text-white/60 transition">
            Ir para login
          </Link>
        </div>
      </div>
    </section>
  );
}

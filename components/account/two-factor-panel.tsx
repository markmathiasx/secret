"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { KeyRound, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { useCustomerSession } from "@/lib/customer-session-client";

type SetupState = {
  secret: string;
  otpauthUrl: string;
  backupCodes: string[];
};

export function TwoFactorPanel() {
  const session = useCustomerSession();
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [code, setCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const enabled = Boolean(session.user?.twoFactorEnabled);
  const canManage = session.loggedIn;
  const helperText = useMemo(() => {
    if (enabled) return "Seu login já pode pedir TOTP ou backup code quando necessário.";
    return "Ative o 2FA opcional para proteger compras, pedidos e acesso seller/admin com uma camada extra.";
  }, [enabled]);

  useEffect(() => {
    if (!setup?.otpauthUrl) {
      setQrCode("");
      return;
    }

    QRCode.toDataURL(setup.otpauthUrl, {
      width: 280,
      margin: 1,
    })
      .then(setQrCode)
      .catch(() => setQrCode(""));
  }, [setup?.otpauthUrl]);

  async function beginSetup() {
    setLoading(true);
    setMessage(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.secret) {
        setMessage(data?.error || "Não foi possível iniciar o setup do 2FA agora.");
        return;
      }

      setSetup({
        secret: data.secret,
        otpauthUrl: data.otpauthUrl,
        backupCodes: Array.isArray(data.backupCodes) ? data.backupCodes : [],
      });
      setSuccess("Escaneie o QR Code no seu app autenticador e confirme com o código gerado.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmSetup() {
    if (!code.trim()) {
      setMessage("Informe o código gerado no seu app autenticador para confirmar.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/2fa/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data?.error || "Não foi possível confirmar o 2FA.");
        return;
      }

      setSuccess("2FA ativado com sucesso. Guarde os backup codes em um lugar seguro.");
      setCode("");
      window.dispatchEvent(new CustomEvent("mdh:auth-change"));
      setTimeout(() => window.location.reload(), 600);
    } finally {
      setLoading(false);
    }
  }

  async function disableSetup() {
    setLoading(true);
    setMessage(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data?.error || "Não foi possível desativar o 2FA.");
        return;
      }

      setSetup(null);
      setCode("");
      setSuccess("2FA desativado. Sua próxima entrada volta a depender apenas da senha.");
      window.dispatchEvent(new CustomEvent("mdh:auth-change"));
      setTimeout(() => window.location.reload(), 600);
    } finally {
      setLoading(false);
    }
  }

  if (!canManage) return null;

  return (
    <section className="glass-panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/78">Segurança da conta</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Autenticação em duas etapas</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/68">{helperText}</p>
        </div>
        <span
          className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
            enabled
              ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
              : "border-white/10 bg-white/5 text-white/70"
          }`}
        >
          {enabled ? "2FA ativo" : "2FA opcional"}
        </span>
      </div>

      {!enabled ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => void beginSetup()} disabled={loading} className="btn-primary">
            <ShieldCheck className="mr-2 h-4 w-4" />
            {loading ? "Preparando..." : "Ativar 2FA"}
          </button>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => void disableSetup()} disabled={loading} className="btn-secondary">
            <Trash2 className="mr-2 h-4 w-4" />
            {loading ? "Desativando..." : "Desativar 2FA"}
          </button>
        </div>
      )}

      {setup ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            {qrCode ? (
              <Image
                src={qrCode}
                alt="QR Code para configurar 2FA na MDH 3D Store"
                width={280}
                height={280}
                className="mx-auto rounded-[20px] bg-white p-3"
              />
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-[20px] border border-dashed border-white/15 text-sm text-white/55">
                Gerando QR Code...
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-cyan-100">
                <Smartphone className="h-4 w-4" />
                <p className="text-sm font-semibold">Passo 1</p>
              </div>
              <p className="mt-2 text-sm leading-7 text-white/68">
                Escaneie o QR Code acima com Google Authenticator, 1Password, Microsoft Authenticator ou outro app compatível com TOTP.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-cyan-100">
                <KeyRound className="h-4 w-4" />
                <p className="text-sm font-semibold">Passo 2</p>
              </div>
              <p className="mt-2 text-sm leading-7 text-white/68">Se o QR não abrir, use esta chave secreta manual:</p>
              <p className="mt-3 break-all rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white">
                {setup.secret}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Passo 3</p>
              <p className="mt-2 text-sm leading-7 text-white/68">
                Digite o código atual do app para concluir a ativação.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="field-base min-w-[180px]"
                />
                <button type="button" onClick={() => void confirmSetup()} disabled={loading} className="btn-primary">
                  Confirmar 2FA
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-sm font-semibold text-amber-50">Backup codes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {setup.backupCodes.map((backupCode) => (
                  <span
                    key={backupCode}
                    className="rounded-full border border-amber-300/20 bg-black/20 px-3 py-2 font-mono text-xs text-amber-50"
                  >
                    {backupCode}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm text-amber-200">{message}</p> : null}
      {success ? <p className="mt-4 text-sm text-emerald-200">{success}</p> : null}
    </section>
  );
}

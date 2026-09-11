"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { sanitizeCustomerRedirect } from "@/lib/auth-redirect";

export function GoogleCustomerLogin() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getProviders().then((providers) => {
      if (active) setAvailable(Boolean(providers?.google));
    }).catch(() => {
      if (active) setAvailable(false);
    });
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason) setError(reason === "OAuthAccountNotLinked"
      ? "Este e-mail já possui outra forma de acesso. Entre com sua senha; não vinculamos contas automaticamente."
      : "Não foi possível entrar com Google. Verifique a conta escolhida ou use e-mail e senha. Contas com 2FA devem usar o acesso protegido.");
    return () => { active = false; };
  }, []);

  async function login() {
    setPending(true);
    setError("");
    try {
      const query = new URLSearchParams(window.location.search);
      const redirectTo = sanitizeCustomerRedirect(query.get("next") || query.get("redirectTo"));
      await signIn("google", { redirectTo });
    } catch {
      setError("Google indisponível agora. Tente novamente ou use e-mail e senha.");
      setPending(false);
    }
  }

  return (
    <div className="mt-5 space-y-2 rounded-lg border border-white/10 p-4">
      <button type="button" onClick={login} disabled={!available || pending} className="btn-secondary w-full justify-center disabled:opacity-60">
        {pending ? "Conectando ao Google..." : "Entrar com Google"}
      </button>
      <p className="text-sm text-white/70">
        {available === null ? "Verificando disponibilidade..." : available
          ? "Seu cadastro de cliente será salvo com segurança. Ao continuar, você aceita os termos e a política de privacidade da loja."
          : "O acesso pelo Google está indisponível no momento. Use seu e-mail e senha ou fale com nossa equipe."}
      </p>
      {error && <p role="alert" className="text-sm text-amber-200">{error}</p>}
    </div>
  );
}

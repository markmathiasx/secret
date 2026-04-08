'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function PasswordRecoveryPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const isResetMode = token.length > 0;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const title = useMemo(
    () => (isResetMode ? 'Defina sua nova senha' : 'Recuperar acesso à sua conta'),
    [isResetMode]
  );

  async function handleRequestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error || 'Não foi possível iniciar a recuperação.');
        return;
      }

      setMessage('Se o e-mail existir na base, você receberá um link de redefinição em instantes.');
    } catch {
      setError('Falha de rede ao iniciar a recuperação.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError('A confirmação da senha não confere.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error || 'Não foi possível redefinir a senha.');
        return;
      }

      setMessage('Senha redefinida com sucesso. Você já pode entrar na sua conta.');
    } catch {
      setError('Falha de rede ao redefinir a senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <div className="glass-panel p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Acesso MDH 3D</p>
        <h1 className="mt-3 text-4xl font-black text-white">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-white/68">
          {isResetMode
            ? 'Digite a nova senha que você quer usar nesta conta.'
            : 'Informe seu e-mail para receber um link de recuperação. Em ambiente local, a mensagem vai para o MailHog.'}
        </p>

        <form onSubmit={isResetMode ? handleResetPassword : handleRequestReset} className="mt-8 space-y-4">
          {isResetMode ? (
            <>
              <label className="block">
                <span className="mb-2 block text-sm text-white/70">Nova senha</span>
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={8} className="field-base" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-white/70">Confirmar senha</span>
                <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" minLength={8} className="field-base" required />
              </label>
            </>
          ) : (
            <label className="block">
              <span className="mb-2 block text-sm text-white/70">Email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="field-base" required />
            </label>
          )}

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? 'Processando...' : isResetMode ? 'Salvar nova senha' : 'Enviar link de recuperação'}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-emerald-200">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-200">{error}</p> : null}

        <div className="mt-6">
          <Link href="/login" className="text-sm font-semibold text-cyan-100 transition hover:text-cyan-50">
            Voltar para o login
          </Link>
        </div>
      </div>
    </section>
  );
}

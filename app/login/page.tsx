'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, MessageCircleMore, ShieldCheck, User } from 'lucide-react';
import { emitCustomerAuthChange, fetchCustomerSession } from '@/lib/customer-session-client';
import { whatsappMessage, whatsappNumber } from '@/lib/constants';

const benefits = [
  'Salvar favoritos e voltar mais rápido aos produtos vistos',
  'Acompanhar pedidos e próximos orçamentos em um só lugar',
  'Organizar sua jornada de compra sem depender de login social',
  'Comprar novamente com mais agilidade'
];
const LOGIN_REDIRECT_KEY = 'mdh_login_redirect';

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 1) return { label: 'Baixa', width: '25%' };
  if (score === 2) return { label: 'Media', width: '50%' };
  if (score === 3) return { label: 'Boa', width: '75%' };
  return { label: 'Forte', width: '100%' };
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const redirectTo = searchParams.get('redirect') || '';
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const loginContext = useMemo(() => {
    if (redirectTo.includes('/checkout')) return 'Entre para continuar o checkout com seus dados e pedidos salvos.';
    if (redirectTo.includes('/conta')) return 'Entre para abrir sua area do cliente com favoritos, historico e orcamentos.';
    if (redirectTo.includes('/catalogo')) return 'Entre para salvar itens e voltar depois sem perder sua curadoria.';
    return 'Entre para acelerar sua jornada de compra e manter tudo organizado.';
  }, [redirectTo]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (redirectTo) {
      window.sessionStorage.setItem(LOGIN_REDIRECT_KEY, redirectTo);
    }
  }, [redirectTo]);

  async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSuccess(null);

    if (mode === 'register' && password !== confirmPassword) {
      setMessage('A confirmação da senha não confere.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(mode === 'register' ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'register'
            ? { name, email, password }
            : { email, password }
        )
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data?.error || 'Não foi possível concluir o acesso.');
        return;
      }

      const session = await fetchCustomerSession();
      if (!session.user) {
        setMessage('A conta foi validada, mas a sessão ainda não foi confirmada pelo navegador. Atualize a página ou tente entrar novamente.');
        return;
      }

      emitCustomerAuthChange();
      setSuccess(mode === 'register' ? 'Conta criada com sucesso.' : 'Login concluído com sucesso.');
      const storedRedirect = typeof window !== 'undefined' ? window.sessionStorage.getItem(LOGIN_REDIRECT_KEY) : null;
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(LOGIN_REDIRECT_KEY);
      }
      router.replace(storedRedirect || redirectTo || '/conta');
      router.refresh();
    } catch {
      setMessage('Erro de rede ao validar seu acesso.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="glass-panel p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Conta MDH 3D</p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">Crie sua conta para comprar com mais rapidez e acompanhar sua jornada.</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/65">
            Você pode navegar como visitante, mas a conta ajuda a reunir favoritos, pedidos e próximos contatos com a MDH 3D em um ambiente mais organizado.
          </p>

          <div className="mt-6 rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-7 text-cyan-50">
            {loginContext}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/75">
                {benefit}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <Link href="/catalogo" className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75 transition hover:border-cyan-300/25 hover:text-cyan-100">
              <p className="font-semibold text-white">Continuar vendo o catálogo</p>
              <p className="mt-1 text-white/55">Boa rota se você quer salvar favoritos antes de sair.</p>
            </Link>
            <Link href="/checkout" className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75 transition hover:border-cyan-300/25 hover:text-cyan-100">
              <p className="font-semibold text-white">Abrir checkout</p>
              <p className="mt-1 text-white/55">Útil para quem já está decidindo pagamento e entrega.</p>
            </Link>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-7">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Acesso</p>
              <h2 className="text-2xl font-black text-white">Conta própria com sessão segura</h2>
            </div>
          </div>

          <div className="mt-6 flex rounded-full border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setMessage(null);
                setSuccess(null);
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-white text-slate-950' : 'text-white/70'}`}
            >
              Criar conta
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setMessage(null);
                setSuccess(null);
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-slate-950' : 'text-white/70'}`}
            >
              Entrar
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="mt-6 space-y-4">
            {mode === 'register' ? (
              <label className="block">
                <span className="mb-2 block text-sm text-white/70">Nome</span>
                <div className="field-base flex items-center gap-3">
                  <User className="h-4 w-4 text-white/45" />
                  <input value={name} onChange={(e) => setName(e.target.value)} type="text" autoComplete="name" className="w-full bg-transparent outline-none" required />
                </div>
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm text-white/70">Email</span>
              <div className="field-base flex items-center gap-3">
                <Mail className="h-4 w-4 text-white/45" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" inputMode="email" className="w-full bg-transparent outline-none" required />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-white/70">Senha</span>
              <div className="field-base flex items-center gap-3">
                <LockKeyhole className="h-4 w-4 text-white/45" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} className="w-full bg-transparent outline-none" required minLength={8} />
              </div>
            </label>

            {mode === 'register' ? (
              <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-white/50">
                  <span>Forca da senha</span>
                  <span className="text-cyan-100">{passwordStrength.label}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: passwordStrength.width }} />
                </div>
              </div>
            ) : null}

            {mode === 'register' ? (
              <label className="block">
                <span className="mb-2 block text-sm text-white/70">Confirmar senha</span>
                <div className="field-base flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-white/45" />
                  <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="w-full bg-transparent outline-none" required minLength={8} />
                </div>
              </label>
            ) : null}

            <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-100" />
                <div>
                  <p className="text-sm font-semibold text-cyan-50">Armazenamento seguro</p>
                  <p className="mt-1 text-sm leading-6 text-cyan-100/78">
                    A senha é transformada em hash no servidor e a sessão roda em cookie assinado, sem expor a credencial no navegador.
                  </p>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-70">
              {loading ? 'Processando...' : mode === 'register' ? 'Criar minha conta' : 'Entrar na minha conta'}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/catalogo" className="btn-ghost-sm">
              Continuar como visitante
            </Link>
            <Link href={redirectTo || '/conta'} className="btn-ghost-sm">
              {redirectTo ? 'Voltar para a etapa anterior' : 'Ir para minha conta'}
            </Link>
            <a href={whatsappHref} className="btn-secondary inline-flex items-center gap-2">
              <MessageCircleMore className="h-4 w-4" />
              WhatsApp
            </a>
          </div>

          {redirectTo ? (
            <div className="mt-4 rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm text-white/68">
              <div className="flex items-center gap-2 text-cyan-100">
                <ArrowRight className="h-4 w-4" />
                <span className="font-semibold">Depois do login</span>
              </div>
              <p className="mt-2">Você será redirecionado automaticamente para <span className="text-white">{redirectTo}</span>.</p>
            </div>
          ) : null}

          {message ? <p className="mt-4 text-sm text-amber-200">{message}</p> : null}
          {success ? <p className="mt-4 text-sm text-emerald-200">{success}</p> : null}
        </div>
      </div>
    </section>
  );
}

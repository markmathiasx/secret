'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { LockKeyhole, Mail, MessageCircleMore } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { whatsappMessage, whatsappNumber } from '@/lib/constants';

const benefits = [
  'Salvar favoritos e coleções preferidas',
  'Voltar mais rápido para produtos vistos',
  'Organizar histórico e próximos pedidos',
  'Usar Google como opção extra, sem depender dele'
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const whatsappHref = useMemo(() => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, []);

  async function oauthGoogle() {
    setMessage(null);
    if (!supabaseBrowser) {
      setMessage('Login social opcional: preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local.');
      return;
    }

    setLoading(true);
    const origin = window.location.origin;
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/auth/callback` }
    });

    if (error) {
      setLoading(false);
      setMessage('Não foi possível iniciar o login com Google.');
    }
  }

  async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!supabaseBrowser) {
      setMessage('Autenticação própria ainda depende do Supabase configurado nesta versão.');
      return;
    }

    setLoading(true);
    const signIn = await supabaseBrowser.auth.signInWithPassword({ email, password });

    if (signIn.error) {
      const signUp = await supabaseBrowser.auth.signUp({ email, password });
      if (signUp.error) {
        setMessage('Não foi possível entrar ou criar a conta agora. Revise email, senha e conexão com o banco.');
        setLoading(false);
        return;
      }
      setMessage('Conta criada. Se o provedor exigir confirmação, verifique seu email.');
      setLoading(false);
      return;
    }

    window.location.href = '/conta';
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="glass-panel p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Conta MDH 3D</p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">Entre para manter sua jornada organizada e voltar mais rápido ao que você já gostou.</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/65">
            O site continua aberto para visitante, mas a conta ajuda a salvar preferências, histórico e próximos pedidos.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/75">
                {benefit}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 md:p-7">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Acesso</p>
              <h2 className="text-2xl font-black text-white">Conta própria + Google opcional</h2>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-white/70">Email</span>
              <div className="field-base flex items-center gap-3">
                <Mail className="h-4 w-4 text-white/45" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full bg-transparent outline-none" required />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-white/70">Senha</span>
              <div className="field-base flex items-center gap-3">
                <LockKeyhole className="h-4 w-4 text-white/45" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full bg-transparent outline-none" required minLength={6} />
              </div>
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-70">
              {loading ? 'Processando...' : 'Entrar ou criar conta'}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={oauthGoogle} disabled={loading} className="btn-ghost-sm">
              Entrar com Google
            </button>
            <Link href="/catalogo" className="btn-ghost-sm">
              Continuar como visitante
            </Link>
            <a href={whatsappHref} className="btn-secondary inline-flex items-center gap-2">
              <MessageCircleMore className="h-4 w-4" />
              WhatsApp
            </a>
          </div>

          {message ? <p className="mt-4 text-sm text-amber-200">{message}</p> : null}
        </div>
      </div>
    </section>
  );
}

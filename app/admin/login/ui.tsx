'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { adminConfig } from '@/lib/constants';

export function AdminLoginForm() {
  const [email, setEmail] = useState(adminConfig.email);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const result = await signIn('credentials', {
      email,
      password,
      role: 'admin',
      redirect: false,
      callbackUrl: '/admin'
    });

    if (result?.error) {
      setStatus('error');
      setMessage('Falha no login. Verifique as credenciais do admin e o status da conta.');
      return;
    }

    window.location.href = result?.url || '/admin';
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm text-white/70">E-mail do admin</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="field-base mt-2" />
      </label>

      <label className="block">
        <span className="text-sm text-white/70">Senha do admin</span>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="field-base mt-2" />
      </label>

      {status === 'error' ? (
        <p className="text-sm text-rose-200">{message}</p>
      ) : (
        <p className="text-xs text-white/45">Senha validada pelo fluxo de credenciais do Auth.js com role admin.</p>
      )}

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full justify-center disabled:opacity-60">
        {status === 'loading' ? 'Entrando...' : 'Entrar no painel'}
      </button>
    </form>
  );
}

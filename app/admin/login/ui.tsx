'use client';

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
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus('error');
      setMessage(data?.error || 'Falha no login');
      return;
    }

    window.location.href = data?.redirectTo || '/admin';
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
        <p className="text-xs text-white/45">Senha validada no servidor e sessão do painel protegida por cookie assinado.</p>
      )}

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full justify-center disabled:opacity-60">
        {status === 'loading' ? 'Entrando...' : 'Entrar no painel'}
      </button>
    </form>
  );
}

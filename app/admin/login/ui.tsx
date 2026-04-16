'use client';

import { useState } from 'react';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload?.ok) {
      setStatus('error');
      setMessage(payload?.error || 'Falha no login. Verifique as credenciais do admin.');
      return;
    }

    window.location.href = payload?.redirectTo || '/admin';
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
        <p className="text-xs text-white/45">Use apenas o e-mail administrativo autorizado para entrar no painel.</p>
      )}

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full justify-center disabled:opacity-60">
        {status === 'loading' ? 'Entrando...' : 'Entrar no painel'}
      </button>
    </form>
  );
}

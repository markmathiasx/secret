import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from '@/lib/env';

export type StorageKind = 'quotes' | 'orders';

type MemoryStore = {
  quotes: Array<Record<string, unknown>>;
  orders: Array<Record<string, unknown>>;
};

function getMemoryStore() {
  const scope = globalThis as typeof globalThis & { __mdhMemoryStore?: MemoryStore };

  if (!scope.__mdhMemoryStore) {
    scope.__mdhMemoryStore = {
      quotes: [],
      orders: []
    };
  }

  return scope.__mdhMemoryStore;
}

function getSupabaseAdmin() {
  const { url, serviceRole } = getSupabaseEnv();
  if (!url || !serviceRole) return null;

  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function getTableName(kind: StorageKind) {
  return kind === 'quotes'
    ? process.env.SUPABASE_QUOTES_TABLE || 'quotes'
    : process.env.SUPABASE_ORDERS_TABLE || 'orders';
}

export async function storeRecord(kind: StorageKind, payload: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    const data = {
      id: crypto.randomUUID(),
      ...payload
    };

    getMemoryStore()[kind].push(data);

    return {
      ok: true,
      storage: 'memory' as const,
      data
    };
  }

  try {
    const { data, error } = await supabase.from(getTableName(kind)).insert(payload).select().single();

    if (error) {
      return { ok: false, storage: 'supabase' as const, error: error.message };
    }

    return { ok: true, storage: 'supabase' as const, data };
  } catch (error) {
    return {
      ok: false,
      storage: 'supabase' as const,
      error: error instanceof Error ? error.message : 'Falha inesperada ao salvar registro.'
    };
  }
}

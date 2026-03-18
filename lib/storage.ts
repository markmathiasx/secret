import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from '@/lib/env';

export type StorageKind = 'quotes' | 'orders' | 'quoteRequests';

type MemoryStore = {
  quotes: Array<Record<string, unknown>>;
  orders: Array<Record<string, unknown>>;
  quoteRequests: Array<Record<string, unknown>>;
};

function getMemoryStore() {
  const scope = globalThis as typeof globalThis & { __mdhMemoryStore?: MemoryStore };

  if (!scope.__mdhMemoryStore) {
    scope.__mdhMemoryStore = {
      quotes: [],
      orders: [],
      quoteRequests: []
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
  if (kind === 'quotes') return process.env.SUPABASE_QUOTES_TABLE || 'quotes';
  if (kind === 'quoteRequests') return process.env.SUPABASE_QUOTE_REQUESTS_TABLE || 'quote_requests';
  return process.env.SUPABASE_ORDERS_TABLE || 'orders';
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

export async function updateOrderRecord(orderCode: string, payload: Record<string, unknown>) {
  const normalizedCode = orderCode.trim();
  if (!normalizedCode) {
    return {
      ok: false,
      storage: 'memory' as const,
      error: 'Código do pedido ausente.'
    };
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    const order = getMemoryStore().orders.find((item) => item.order_code === normalizedCode);
    if (!order) {
      return {
        ok: false,
        storage: 'memory' as const,
        error: 'Pedido não encontrado.'
      };
    }

    Object.assign(order, payload);

    return {
      ok: true,
      storage: 'memory' as const,
      data: order
    };
  }

  try {
    const { data, error } = await supabase
      .from(getTableName('orders'))
      .update(payload)
      .eq('order_code', normalizedCode)
      .select()
      .maybeSingle();

    if (error) {
      return { ok: false, storage: 'supabase' as const, error: error.message };
    }

    if (!data) {
      return { ok: false, storage: 'supabase' as const, error: 'Pedido não encontrado.' };
    }

    return { ok: true, storage: 'supabase' as const, data };
  } catch (error) {
    return {
      ok: false,
      storage: 'supabase' as const,
      error: error instanceof Error ? error.message : 'Falha inesperada ao atualizar pedido.'
    };
  }
}

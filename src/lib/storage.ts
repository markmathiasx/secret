import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

function getSupabase() {
  const { url, serviceRole } = getSupabaseEnv();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

export async function storeRecord(kind: "quotes" | "orders", payload: Record<string, unknown>) {
  const supabase = getSupabase();

  if (!supabase) {
    return { ok: true, storage: "mock" as const, data: { id: crypto.randomUUID(), ...payload } };
  }

  const table =
    kind === "quotes"
      ? process.env.SUPABASE_QUOTES_TABLE || "quotes"
      : process.env.SUPABASE_ORDERS_TABLE || "orders";

  const { data, error } = await supabase.from(table).insert(payload).select().single();

  if (error) {
    return { ok: false, storage: "supabase" as const, error: error.message };
  }

  return { ok: true, storage: "supabase" as const, data };
}

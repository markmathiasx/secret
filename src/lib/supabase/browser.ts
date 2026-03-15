import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

const { url, anon } = getSupabaseEnv();

export const supabaseBrowser = url && anon ? createClient(url, anon) : null;

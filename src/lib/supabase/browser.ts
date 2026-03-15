import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

const url = getSupabaseUrl();
const key = getSupabaseAnonKey();

export const supabaseBrowser = url && key ? createClient(url, key) : null;

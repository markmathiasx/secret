import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

const url = getSupabaseUrl();
const anonKey = getSupabaseAnonKey();

export const supabaseBrowser = url && anonKey ? createClient(url, anonKey) : null;

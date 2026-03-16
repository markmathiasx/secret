import { createClient } from "@supabase/supabase-js";
import { getSupabaseBrowserKey, getSupabaseUrl } from "@/lib/env";

const url = getSupabaseUrl() || "";
const key = getSupabaseBrowserKey() || "";

export const supabaseBrowser = url && key ? createClient(url, key) : null;
